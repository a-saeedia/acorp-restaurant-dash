/**
 * Deterministic seed data.
 *
 * `createInitialState()` is a pure function of SIMULATION_SEED and the fixed
 * demo clock: calling it twice yields byte-identical state, which is what makes
 * "reset" and frame-accurate video rendering trustworthy.
 */

import {
  CAMPAIGNS,
  CUSTOMER_NAMES_FA,
  EXPENSES,
  INGREDIENTS,
  MENU,
  RESTAURANT,
  SUPPLIERS,
  TABLE_LABELS_FA,
} from './catalog';
import {
  CUSTOMIZATION_BY_ID,
  MENU_BY_ID,
  INGREDIENT_BY_ID,
} from './catalog';
import {
  DEMO_DAY_KEY,
  DEMO_NOW_ISO,
  DEMO_NOW_MS,
  HISTORY_DAYS,
  SERVICE_START_HOUR,
  SIMULATION_SEED,
  SIMULATION_VERSION,
  addDays,
  dayKeyOf,
  weekdayOf,
} from './config';
import { buildAnalyticsSnapshot, buildMarketingSnapshot, resolveRecipe } from './analytics';
import { buildOrder, orderConsumption } from './orders';
import { mulberry32, randomFloat, randomInt, seedFrom, weightedPick } from './rng';
import type {
  DailyAggregate,
  DayKey,
  InventoryTransaction,
  MarketingSnapshot,
  Order,
  OrderStatus,
  PurchaseRequest,
  SimulationNotification,
  SimulationState,
  Toman,
} from './types';

/* -------------------------------------------------------------------------- */
/* Demand model                                                              */
/* -------------------------------------------------------------------------- */

/** Relative demand by JS weekday (0=Sun … 6=Sat). Thursday/Friday peak in Iran. */
const WEEKDAY_DEMAND = [0.9, 0.86, 0.88, 0.98, 1.22, 1.3, 0.95] as const;

/** Baseline non-cancelled orders per service day. */
const BASE_ORDERS_PER_DAY = 112;

/** Relative order volume per service hour for today's seeded tickets. */
const HOUR_WEIGHTS: Array<{ hour: number; weight: number }> = [
  { hour: 11, weight: 22 },
  { hour: 12, weight: 78 },
  { hour: 13, weight: 100 },
  { hour: 14, weight: 66 },
  { hour: 15, weight: 34 },
  { hour: 16, weight: 26 },
  { hour: 17, weight: 34 },
  { hour: 18, weight: 58 },
  { hour: 19, weight: 92 },
  { hour: 20, weight: 60 },
];

const MENU_IDS = MENU.map((item) => item.id);
const MENU_POPULARITY = MENU.map((item) => item.popularity);

const CUSTOMIZATION_POOL = [
  'c-extra-cheese',
  'c-extra-sauce',
  'c-spicy',
  'c-no-onion',
  'c-no-sauce',
] as const;

/** Weighted customisation mix; combined with a 30% chance of any customisation. */
const CUSTOMIZATION_WEIGHTS = [3.4, 2.2, 1.4, 1.2, 0.8] as const;

/* -------------------------------------------------------------------------- */
/* History                                                                    */
/* -------------------------------------------------------------------------- */

interface DayBuild {
  aggregate: DailyAggregate;
}

function buildHistoryDay(dayKey: DayKey, index: number, total: number): DayBuild {
  const rng = mulberry32(seedFrom('history', dayKey));
  const weekday = weekdayOf(dayKey);
  const demand = WEEKDAY_DEMAND[weekday] ?? 1;

  const seasonal =
    1 + 0.05 * Math.sin((index / total) * Math.PI * 2) + 0.025 * Math.cos((index / total) * Math.PI * 6);
  const trend = 1 + 0.12 * (index / total);
  const noise = randomFloat(rng, 0.93, 1.07);

  const orderCount = Math.max(
    45,
    Math.round(BASE_ORDERS_PER_DAY * demand * seasonal * trend * noise),
  );

  const aggregate: DailyAggregate = {
    dayKey,
    orderCount: 0,
    grossSales: 0,
    discounts: 0,
    refunds: 0,
    cogs: 0,
    itemQuantity: {},
    qrOrders: 0,
    deliveryOrders: 0,
  };

  for (let i = 0; i < orderCount; i += 1) {
    const menuItemId = weightedPick(rng, MENU_IDS, MENU_POPULARITY);
    const quantity = rng() < 0.84 ? 1 : rng() < 0.9 ? 2 : 3;

    const customizationIds: string[] = [];
    if (rng() < 0.3) {
      customizationIds.push(weightedPick(rng, CUSTOMIZATION_POOL, CUSTOMIZATION_WEIGHTS));
      if (rng() < 0.08) {
        const extra = weightedPick(rng, CUSTOMIZATION_POOL, CUSTOMIZATION_WEIGHTS);
        if (!customizationIds.includes(extra)) customizationIds.push(extra);
      }
    }

    const menuItem = MENU_BY_ID.get(menuItemId);
    if (!menuItem) continue;

    const unitPrice =
      menuItem.price +
      customizationIds.reduce(
        (sum, id) => sum + (CUSTOMIZATION_BY_ID.get(id)?.priceDelta ?? 0),
        0,
      );
    const subtotal = unitPrice * quantity;
    const discount = rng() < 0.06 ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal - discount;
    const cogs =
      resolveRecipe(menuItem, customizationIds).reduce((sum, line) => {
        const ingredient = INGREDIENT_BY_ID.get(line.ingredientId);
        return sum + (ingredient ? ingredient.unitCost * line.quantity : 0);
      }, 0) * quantity;

    const cancelled = rng() < 0.011;
    const refunded = !cancelled && rng() < 0.004;

    if (cancelled) {
      if (refunded) aggregate.refunds += total;
      continue;
    }

    aggregate.orderCount += 1;
    aggregate.grossSales += subtotal;
    aggregate.discounts += discount;
    aggregate.cogs += Math.round(cogs);
    if (refunded) aggregate.refunds += total;

    if (rng() < 0.64) aggregate.qrOrders += 1;
    else aggregate.deliveryOrders += 1;

    aggregate.itemQuantity[menuItemId] = (aggregate.itemQuantity[menuItemId] ?? 0) + quantity;
  }

  return { aggregate };
}

export function generateHistory(): DailyAggregate[] {
  const days: DailyAggregate[] = [];
  const startKey = addDays(DEMO_DAY_KEY, -HISTORY_DAYS);
  for (let i = 0; i < HISTORY_DAYS; i += 1) {
    const dayKey = addDays(startKey, i);
    days.push(buildHistoryDay(dayKey, i, HISTORY_DAYS).aggregate);
  }
  return days;
}

/* -------------------------------------------------------------------------- */
/* Today's operational orders                                                */
/* -------------------------------------------------------------------------- */

export const TODAY_ORDER_COUNT = 96;
const FIRST_TODAY_SEQUENCE = 986;

/** Weighted minute-of-service sampling, seeded per day. */
function sampleServiceMinutes(rng: () => number, count: number): number[] {
  const slots: Array<{ minute: number; weight: number }> = [];
  for (const { hour, weight } of HOUR_WEIGHTS) {
    for (let slot = 0; slot < 6; slot += 1) {
      slots.push({ minute: (hour - SERVICE_START_HOUR) * 60 + slot * 10, weight });
    }
  }
  const minutes = new Set<number>();
  let guard = 0;
  while (minutes.size < count && guard < count * 40) {
    const slot = weightedPick(
      rng,
      slots,
      slots.map((entry) => entry.weight),
    );
    minutes.add(slot.minute + randomInt(rng, 0, 9));
    guard += 1;
  }
  const sorted = [...minutes].sort((a, b) => a - b);
  while (sorted.length < count) {
    sorted.push(sorted[sorted.length - 1] ?? 0);
  }
  return sorted.slice(0, count);
}

const IN_FLIGHT_STATUSES: OrderStatus[] = [
  'completed',
  'ready',
  'preparing',
  'preparing',
  'ready',
  'preparing',
  'preparing',
  'preparing',
];

export function generateTodayOrders(): Order[] {
  const rng = mulberry32(seedFrom('today', DEMO_DAY_KEY));
  const serviceStartMs = Date.parse(`${DEMO_DAY_KEY}T${String(SERVICE_START_HOUR).padStart(2, '0')}:00:00+03:30`);
  const minutes = sampleServiceMinutes(rng, TODAY_ORDER_COUNT);
  const orders: Order[] = [];

  for (let i = 0; i < minutes.length; i += 1) {
    const minuteOffset = minutes[i] ?? 0;
    const createdAtMs = Math.min(serviceStartMs + minuteOffset * 60_000, DEMO_NOW_MS - 4 * 60_000);
    const createdAtIso = new Date(createdAtMs).toISOString();

    const menuItemId = weightedPick(rng, MENU_IDS, MENU_POPULARITY);
    const quantity = rng() < 0.86 ? 1 : 2;
    const customizationIds: string[] = [];
    if (rng() < 0.32) {
      customizationIds.push(weightedPick(rng, CUSTOMIZATION_POOL, CUSTOMIZATION_WEIGHTS));
    }

    const channel = rng() < 0.66 ? 'qr' : 'delivery';
    const isLast = i >= minutes.length - IN_FLIGHT_STATUSES.length;
    const status: OrderStatus = isLast
      ? (IN_FLIGHT_STATUSES[i - (minutes.length - IN_FLIGHT_STATUSES.length)] ?? 'preparing')
      : 'completed';

    let paymentStatus: 'paid' | 'pending' | 'refunded' = 'paid';
    let cancelReasonFa: string | null = null;

    if (!isLast && status === 'completed') {
      if (i === 12 || i === 47) {
        paymentStatus = 'refunded';
        cancelReasonFa = 'انصراف مشتری پیش از آماده‌سازی';
      }
    }
    if (isLast && channel === 'delivery' && i === minutes.length - 2) {
      paymentStatus = 'pending';
    }

    const sequence = FIRST_TODAY_SEQUENCE + i;
    const customerNameFa =
      CUSTOMER_NAMES_FA[randomInt(rng, 0, CUSTOMER_NAMES_FA.length - 1)] ?? 'مهمان';
    const tableFa =
      channel === 'qr'
        ? (TABLE_LABELS_FA[randomInt(rng, 0, TABLE_LABELS_FA.length - 1)] ?? 'میز ۱')
        : null;

    orders.push(
      buildOrder({
        sequence,
        channel,
        createdAtIso,
        status,
        paymentStatus,
        customerNameFa,
        tableFa,
        lines: [{ menuItemId, quantity, customizationIds }],
        discountRate: rng() < 0.07 ? 0.1 : 0,
        cancelReasonFa,
      }),
    );
  }

  orders.sort((a, b) => Date.parse(a.createdAtIso) - Date.parse(b.createdAtIso));
  return orders;
}

/* -------------------------------------------------------------------------- */
/* Inventory                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Post-seed stock targets. The demo order is calibrated to push beef and cheese
 * across their reorder thresholds so the replenishment story is reproducible.
 */
const POST_SEED_TARGETS: Record<string, number> = {
  'ing-beef': 4_050,
  'ing-bun': 46,
  'ing-cheese': 31,
  'ing-onion': 1_450,
  'ing-lettuce': 960,
  'ing-tomato': 1_180,
  'ing-sauce': 820,
  'ing-pack': 41,
};

export interface SeedInventoryResult {
  inventory: Record<string, number>;
  transactions: InventoryTransaction[];
}

export function buildSeededInventory(orders: readonly Order[]): SeedInventoryResult {
  const consumption = new Map<string, number>();
  for (const order of orders) {
    for (const [ingredientId, quantity] of orderConsumption(order)) {
      consumption.set(ingredientId, (consumption.get(ingredientId) ?? 0) + quantity);
    }
  }

  const inventory: Record<string, number> = {};
  const transactions: InventoryTransaction[] = [];
  const openingIso = `${DEMO_DAY_KEY}T09:00:00+03:30`;

  for (const ingredient of INGREDIENTS) {
    const consumed = consumption.get(ingredient.id) ?? 0;
    const target = POST_SEED_TARGETS[ingredient.id] ?? ingredient.reorderThreshold * 1.4;
    const opening = Math.round(target + consumed);
    inventory[ingredient.id] = opening;
    transactions.push({
      id: `inv-opening-${ingredient.id}`,
      ingredientId: ingredient.id,
      kind: 'opening',
      delta: opening,
      quantityAfter: opening,
      atIso: openingIso,
      orderId: null,
      noteFa: 'موجودی ابتدای روز',
    });
  }

  // One aggregated deduction transaction per order, so the ledger stays readable.
  for (const order of orders) {
    const atIso = order.createdAtIso;
    for (const [ingredientId, quantity] of orderConsumption(order)) {
      const before = inventory[ingredientId] ?? 0;
      const after = Math.max(0, Math.round(before - quantity));
      inventory[ingredientId] = after;
      transactions.push({
        id: `inv-deduct-${order.id}-${ingredientId}`,
        ingredientId,
        kind: 'deduction',
        delta: -quantity,
        quantityAfter: after,
        atIso,
        orderId: order.id,
        noteFa: `کسر خودکار برای سفارش ${order.reference}`,
      });
    }
  }

  return { inventory, transactions };
}

/* -------------------------------------------------------------------------- */
/* Purchase requests                                                          */
/* -------------------------------------------------------------------------- */

export function buildSeededPurchaseRequests(): PurchaseRequest[] {
  const beef = INGREDIENT_BY_ID.get('ing-beef');
  const bun = INGREDIENT_BY_ID.get('ing-bun');
  const requests: PurchaseRequest[] = [];

  if (bun) {
    const supplier = SUPPLIERS.find((entry) => entry.id === bun.supplierId);
    requests.push({
      id: 'pr-2041',
      supplierId: bun.supplierId,
      supplierNameFa: supplier?.nameFa ?? 'تأمین‌کننده',
      ingredientId: bun.id,
      ingredientNameFa: bun.nameFa,
      status: 'approved',
      currentQuantity: 22,
      reorderThreshold: bun.reorderThreshold,
      recommendedQuantity: bun.reorderQuantity,
      unitCost: bun.unitCost,
      estimatedCost: bun.unitCost * bun.reorderQuantity,
      unitLabelFa: bun.unitLabelFa,
      createdAtIso: `${addDays(DEMO_DAY_KEY, -2)}T10:12:00+03:30`,
      preparedAtIso: `${addDays(DEMO_DAY_KEY, -2)}T10:31:00+03:30`,
      approvedAtIso: `${addDays(DEMO_DAY_KEY, -2)}T10:48:00+03:30`,
      orderId: null,
      noteFa: 'درخواست شبیه‌سازی‌شده — تأیید داخلی، بدون ارسال به تأمین‌کننده',
    });
  }

  if (beef) {
    const supplier = SUPPLIERS.find((entry) => entry.id === beef.supplierId);
    requests.push({
      id: 'pr-2042',
      supplierId: beef.supplierId,
      supplierNameFa: supplier?.nameFa ?? 'تأمین‌کننده',
      ingredientId: beef.id,
      ingredientNameFa: beef.nameFa,
      status: 'approved',
      currentQuantity: 5_200,
      reorderThreshold: beef.reorderThreshold,
      recommendedQuantity: beef.reorderQuantity,
      unitCost: beef.unitCost,
      estimatedCost: beef.unitCost * beef.reorderQuantity,
      unitLabelFa: beef.unitLabelFa,
      createdAtIso: `${addDays(DEMO_DAY_KEY, -1)}T18:02:00+03:30`,
      preparedAtIso: `${addDays(DEMO_DAY_KEY, -1)}T18:15:00+03:30`,
      approvedAtIso: `${addDays(DEMO_DAY_KEY, -1)}T18:40:00+03:30`,
      orderId: null,
      noteFa: 'درخواست شبیه‌سازی‌شده — تأیید داخلی، بدون ارسال به تأمین‌کننده',
    });
  }

  return requests;
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                             */
/* -------------------------------------------------------------------------- */

function buildSeededNotifications(orders: readonly Order[]): SimulationNotification[] {
  const recent = orders.slice(-4);
  const notifications: SimulationNotification[] = [];

  for (const [index, order] of recent.entries()) {
    const atMs = Date.parse(order.createdAtIso) + (index + 1) * 45_000;
    if (atMs > DEMO_NOW_MS) continue;
    notifications.push({
      id: `ntf-seed-${index}`,
      kind: index % 2 === 0 ? 'kitchen' : 'cashier',
      titleFa: index % 2 === 0 ? 'تیکت جدید آشپزخانه' : 'سفارش تأیید شد',
      bodyFa:
        index % 2 === 0
          ? `سفارش ${order.reference} برای آماده‌سازی به آشپزخانه ارسال شد.`
          : `سفارش ${order.reference} توسط صندوق تأیید شد.`,
      atIso: new Date(atMs).toISOString(),
      orderId: order.id,
      read: index < recent.length - 2,
    });
  }

  return notifications;
}

/* -------------------------------------------------------------------------- */
/* Initial state                                                             */
/* -------------------------------------------------------------------------- */

export function createInitialState(): SimulationState {
  const orders = generateTodayOrders();
  const history = generateHistory();
  const { inventory, transactions } = buildSeededInventory(orders);
  const purchaseRequests = buildSeededPurchaseRequests();
  const notifications = buildSeededNotifications(orders);

  const source = {
    orders,
    history,
    campaigns: CAMPAIGNS,
    inventory,
    todayKey: DEMO_DAY_KEY,
  };

  const metrics = buildAnalyticsSnapshot(source, 'day', DEMO_DAY_KEY, DEMO_NOW_ISO);
  const marketing: MarketingSnapshot = buildMarketingSnapshot(source, 'month', DEMO_DAY_KEY);

  return {
    seed: SIMULATION_SEED,
    clockMs: DEMO_NOW_MS,
    clockIso: DEMO_NOW_ISO,
    orders,
    inventory,
    inventoryTransactions: transactions,
    purchaseRequests,
    history,
    expenses: EXPENSES,
    campaigns: CAMPAIGNS,
    notifications,
    processed: {},
    metrics,
    marketing,
    lastEvent: null,
    appliedEventCount: 0,
    version: SIMULATION_VERSION,
    demoStarted: false,
  } satisfies SimulationState;
}

/** Money helper used by the seed narrative and tests. */
export function tomanValue(): Toman {
  return 0;
}

export const SEED_META = {
  restaurant: RESTAURANT,
  todayKey: dayKeyOf(DEMO_NOW_ISO) as DayKey,
};
