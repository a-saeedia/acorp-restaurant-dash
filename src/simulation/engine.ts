/**
 * The deterministic simulation engine.
 *
 * `applyEvent` is a pure reducer: same state + same event = same next state, and
 * an event whose id was already processed is a no-op (idempotency). Nothing here
 * touches timers, the DOM or the network, so the video layer can reconstruct any
 * frame's state by replaying a prefix of the event list.
 */

import {
  CUSTOMER_NAMES_FA,
  INGREDIENTS,
  INGREDIENT_BY_ID,
  MENU_BY_ID,
  SUPPLIERS,
  TABLE_LABELS_FA,
} from './catalog';
import { DEMO_DAY_KEY, DEMO_NOW_ISO, DEMO_NOW_MS } from './config';
import {
  buildAnalyticsSnapshot,
  buildMarketingSnapshot,
  buildProfitAndLoss,
  aggregateOrders,
} from './analytics';
import { buildOrder, orderConsumption, orderIdOf, referenceOf } from './orders';
import { createInitialState } from './seed';
import type {
  InventoryTransaction,
  Order,
  OrderStatus,
  PurchaseRequest,
  SimulationEvent,
  SimulationEventType,
  SimulationNotification,
  SimulationState,
} from './types';

/* -------------------------------------------------------------------------- */
/* Workflow definition                                                       */
/* -------------------------------------------------------------------------- */

export interface WorkflowStep {
  type: SimulationEventType;
  /** Offset from the workflow start, in milliseconds. */
  offsetMs: number;
}

/**
 * Canonical order workflow. Times are the demo's real-time pacing; the video
 * layer compresses them with `compress` so one scene fits a few seconds.
 */
export const ORDER_WORKFLOW: readonly WorkflowStep[] = [
  { type: 'ORDER_RECEIVED', offsetMs: 0 },
  { type: 'ORDER_CONFIRMED', offsetMs: 1_800 },
  { type: 'KITCHEN_NOTIFIED', offsetMs: 3_000 },
  { type: 'INVENTORY_DEDUCTED', offsetMs: 4_200 },
  { type: 'STOCK_THRESHOLD_CHECKED', offsetMs: 5_600 },
  { type: 'PURCHASE_RECOMMENDATION_CREATED', offsetMs: 7_000 },
  // Revenue is recognised when the payment is confirmed, so the first analytics
  // refresh happens at the end of the intake chain.
  { type: 'ANALYTICS_UPDATED', offsetMs: 8_400 },
  { type: 'ORDER_PREPARING', offsetMs: 90_000 },
  { type: 'ORDER_READY', offsetMs: 420_000 },
  { type: 'ORDER_COMPLETED', offsetMs: 540_000 },
  // Final refresh once the ticket leaves the kitchen board.
  { type: 'ANALYTICS_UPDATED', offsetMs: 541_200 },
];

export const EVENT_TITLES_FA: Record<SimulationEventType, string> = {
  ORDER_RECEIVED: 'سفارش دریافت شد',
  ORDER_CONFIRMED: 'سفارش تأیید شد',
  KITCHEN_NOTIFIED: 'آشپزخانه مطلع شد',
  ORDER_PREPARING: 'آماده‌سازی آغاز شد',
  ORDER_READY: 'سفارش آماده تحویل است',
  ORDER_COMPLETED: 'سفارش تحویل شد',
  ORDER_CANCELLED: 'سفارش لغو شد',
  INVENTORY_DEDUCTED: 'موجودی کسر شد',
  STOCK_THRESHOLD_CHECKED: 'حد سفارش بررسی شد',
  PURCHASE_RECOMMENDATION_CREATED: 'پیشنهاد خرید ایجاد شد',
  PURCHASE_REQUEST_PREPARED: 'درخواست خرید تنظیم شد',
  PURCHASE_REQUEST_APPROVED: 'درخواست خرید تأیید شد',
  ANALYTICS_UPDATED: 'تحلیل کسب‌وکار به‌روز شد',
};

const EVENT_DETAILS_FA: Record<SimulationEventType, string> = {
  ORDER_RECEIVED: 'سفارش از منوی QR وارد سامانه شد.',
  ORDER_CONFIRMED: 'صندوق سفارش را تأیید و پرداخت را ثبت کرد.',
  KITCHEN_NOTIFIED: 'تیکت آماده‌سازی روی نمایشگر آشپزخانه ظاهر شد.',
  ORDER_PREPARING: 'آشپز تیکت را برداشت و آماده‌سازی شروع شد.',
  ORDER_READY: 'سفارش آماده شد و در انتظار تحویل است.',
  ORDER_COMPLETED: 'سفارش به مشتری تحویل و در فروش ثبت شد.',
  ORDER_CANCELLED: 'سفارش به‌صورت صریح لغو شد.',
  INVENTORY_DEDUCTED: 'مواد اولیه بر اساس دستور پخت از انبار کسر شد.',
  STOCK_THRESHOLD_CHECKED: 'موجودی اقلام با حد سفارش مقایسه شد.',
  PURCHASE_RECOMMENDATION_CREATED: 'برای اقلام زیر حد، پیشنهاد خرید ساخته شد.',
  PURCHASE_REQUEST_PREPARED: 'درخواست خرید برای تأیید مدیر تنظیم شد.',
  PURCHASE_REQUEST_APPROVED: 'درخواست در محیط نمایشی تأیید شد؛ خریدی ارسال نشده است.',
  ANALYTICS_UPDATED: 'شاخص‌های فروش، هزینه و سود بازمحاسبه شد.',
};

/** Ends the workflow early — used by tests and the "cancel" demo control. */
export function buildCancellationEvent(orderId: string, atMs: number): SimulationEvent {
  return {
    id: `${orderId}:ORDER_CANCELLED`,
    type: 'ORDER_CANCELLED',
    atMs,
    atIso: new Date(atMs).toISOString(),
    sequence: 0,
    orderId,
    titleFa: EVENT_TITLES_FA.ORDER_CANCELLED,
    detailFa: EVENT_DETAILS_FA.ORDER_CANCELLED,
    refs: {},
  };
}

export interface WorkflowOptions {
  /** Divide every offset by this factor to fit the video timeline. */
  compress?: number;
  /** Only include steps up to (and including) this type. */
  until?: SimulationEventType;
  /** Persian reference used in the event detail line. */
  reference?: string;
}

export function buildOrderWorkflow(
  orderId: string,
  startMs: number,
  options: WorkflowOptions = {},
): SimulationEvent[] {
  const compress = options.compress ?? 1;
  const events: SimulationEvent[] = [];

  for (const [index, step] of ORDER_WORKFLOW.entries()) {
    const atMs = startMs + Math.round(step.offsetMs / compress);
    events.push({
      // Sequence suffix keeps ids unique when a type repeats in one workflow
      // (ANALYTICS_UPDATED fires twice) while staying stable across replays.
      id: `${orderId}:${step.type}:${index}`,
      type: step.type,
      atMs,
      atIso: new Date(atMs).toISOString(),
      sequence: index,
      orderId,
      titleFa: EVENT_TITLES_FA[step.type],
      detailFa: eventDetail(step.type, options.reference),
      refs: {},
    });
    if (options.until && step.type === options.until) break;
  }

  return events;
}

function eventDetail(type: SimulationEventType, reference?: string): string {
  const base = EVENT_DETAILS_FA[type];
  return reference ? `سفارش ${reference} — ${base}` : base;
}

/* -------------------------------------------------------------------------- */
/* State helpers                                                             */
/* -------------------------------------------------------------------------- */

function withOrder(state: SimulationState, orderId: string, patch: Partial<Order>): Order[] {
  return state.orders.map((order) => {
    if (order.id !== orderId) return order;
    return { ...order, ...patch, updatedAtIso: state.clockIso };
  });
}

function findOrder(state: SimulationState, orderId: string): Order | undefined {
  return state.orders.find((order) => order.id === orderId);
}

function pushNotification(
  state: SimulationState,
  notification: Omit<SimulationNotification, 'id' | 'atIso' | 'read'>,
  eventId: string,
): SimulationNotification[] {
  return [
    {
      ...notification,
      id: `ntf-${eventId}`,
      atIso: state.clockIso,
      read: false,
    },
    ...state.notifications,
  ].slice(0, 40);
}

/** Ingredients at or below their reorder threshold. */
export function lowStockIngredients(
  inventory: Record<string, number>,
): Array<{ ingredientId: string; quantity: number; threshold: number }> {
  const result: Array<{ ingredientId: string; quantity: number; threshold: number }> = [];
  for (const ingredient of INGREDIENTS) {
    const quantity = inventory[ingredient.id] ?? 0;
    if (quantity < ingredient.reorderThreshold) {
      result.push({
        ingredientId: ingredient.id,
        quantity,
        threshold: ingredient.reorderThreshold,
      });
    }
  }
  return result;
}

function nextPurchaseRequestId(requests: readonly PurchaseRequest[]): number {
  let max = 2040;
  for (const request of requests) {
    const match = /^pr-(\d+)$/.exec(request.id);
    if (match?.[1]) max = Math.max(max, Number(match[1]));
  }
  return max + 1;
}

function openRequestExists(requests: readonly PurchaseRequest[], ingredientId: string): boolean {
  return requests.some(
    (request) =>
      request.ingredientId === ingredientId &&
      (request.status === 'recommendation' || request.status === 'prepared'),
  );
}

function recalculateMetrics(
  state: SimulationState,
): Pick<SimulationState, 'metrics' | 'marketing'> {
  const source = {
    orders: state.orders,
    history: state.history,
    campaigns: state.campaigns,
    inventory: state.inventory,
    todayKey: DEMO_DAY_KEY,
  };
  return {
    metrics: buildAnalyticsSnapshot(source, 'day', DEMO_DAY_KEY, state.clockIso),
    marketing: buildMarketingSnapshot(source, 'month', DEMO_DAY_KEY),
  };
}

/* -------------------------------------------------------------------------- */
/* Reducer                                                                   */
/* -------------------------------------------------------------------------- */

export function applyEvent(state: SimulationState, event: SimulationEvent): SimulationState {
  // Idempotency: the same event id can never be applied twice.
  if (state.processed[event.id]) return state;

  const order = event.orderId ? findOrder(state, event.orderId) : undefined;
  const clockMs = Math.max(state.clockMs, event.atMs);
  const clockIso = new Date(clockMs).toISOString();

  /** Base state with clock advanced + event marked as processed. */
  const tick: SimulationState = {
    ...state,
    clockMs,
    clockIso,
    processed: { ...state.processed, [event.id]: true },
    appliedEventCount: state.appliedEventCount + 1,
    lastEvent: event,
    demoStarted: state.demoStarted || Boolean(event.orderId),
  };

  switch (event.type) {
    case 'ORDER_RECEIVED': {
      if (!order) return tick;
      return {
        ...tick,
        orders: withOrder(tick, order.id, { status: 'received' }),
        notifications: pushNotification(
          tick,
          {
            kind: 'cashier',
            titleFa: 'سفارش جدید',
            bodyFa: `سفارش ${order.reference} از ${
              order.channel === 'qr' ? 'منوی QR' : 'ارسال آنلاین'
            } دریافت شد.`,
            orderId: order.id,
          },
          event.id,
        ),
      };
    }

    case 'ORDER_CONFIRMED': {
      if (!order) return tick;
      return {
        ...tick,
        orders: withOrder(tick, order.id, { status: 'confirmed', paymentStatus: 'paid' }),
        notifications: pushNotification(
          tick,
          {
            kind: 'cashier',
            titleFa: 'تأیید صندوق',
            bodyFa: `سفارش ${order.reference} تأیید و پرداخت ثبت شد.`,
            orderId: order.id,
          },
          event.id,
        ),
      };
    }

    case 'KITCHEN_NOTIFIED': {
      if (!order) return tick;
      return {
        ...tick,
        notifications: pushNotification(
          tick,
          {
            kind: 'kitchen',
            titleFa: 'تیکت جدید آشپزخانه',
            bodyFa: `سفارش ${order.reference} برای آماده‌سازی ارسال شد.`,
            orderId: order.id,
          },
          event.id,
        ),
      };
    }

    case 'INVENTORY_DEDUCTED': {
      if (!order) return tick;
      const consumption = orderConsumption(order);
      const inventory = { ...tick.inventory };
      const transactions: InventoryTransaction[] = [...tick.inventoryTransactions];

      for (const [ingredientId, quantity] of consumption) {
        const before = inventory[ingredientId] ?? 0;
        const after = Math.max(0, Math.round(before - quantity));
        inventory[ingredientId] = after;
        transactions.push({
          id: `invt-${event.id}-${ingredientId}`,
          ingredientId,
          kind: 'deduction',
          delta: -quantity,
          quantityAfter: after,
          atIso: tick.clockIso,
          orderId: order.id,
          noteFa: `کسر خودکار برای سفارش ${order.reference}`,
        });
      }

      return { ...tick, inventory, inventoryTransactions: transactions };
    }

    case 'STOCK_THRESHOLD_CHECKED': {
      const low = lowStockIngredients(tick.inventory);
      return {
        ...tick,
        notifications:
          low.length === 0
            ? tick.notifications
            : pushNotification(
                tick,
                {
                  kind: 'inventory',
                  titleFa: 'هشدار موجودی',
                  bodyFa: `${low.length} قلم ماده اولیه به حد سفارش رسیده است.`,
                  orderId: event.orderId,
                },
                event.id,
              ),
      };
    }

    case 'PURCHASE_RECOMMENDATION_CREATED': {
      const low = lowStockIngredients(tick.inventory);
      if (low.length === 0) return tick;

      let number = nextPurchaseRequestId(tick.purchaseRequests);
      const created: PurchaseRequest[] = [];

      for (const entry of low) {
        if (openRequestExists([...tick.purchaseRequests, ...created], entry.ingredientId)) continue;
        const ingredient = INGREDIENT_BY_ID.get(entry.ingredientId);
        if (!ingredient) continue;
        const supplier = SUPPLIERS.find((item) => item.id === ingredient.supplierId);
        const recommended = Math.max(
          ingredient.reorderQuantity,
          Math.ceil((entry.threshold - entry.quantity) / ingredient.reorderQuantity + 1) *
            ingredient.reorderQuantity,
        );
        created.push({
          id: `pr-${number}`,
          supplierId: ingredient.supplierId,
          supplierNameFa: supplier?.nameFa ?? 'تأمین‌کننده',
          ingredientId: ingredient.id,
          ingredientNameFa: ingredient.nameFa,
          status: 'recommendation',
          currentQuantity: entry.quantity,
          reorderThreshold: entry.threshold,
          recommendedQuantity: recommended,
          unitCost: ingredient.unitCost,
          estimatedCost: ingredient.unitCost * recommended,
          unitLabelFa: ingredient.unitLabelFa,
          createdAtIso: tick.clockIso,
          preparedAtIso: null,
          approvedAtIso: null,
          orderId: event.orderId,
          noteFa: 'پیشنهاد خودکار بر اساس حد سفارش — خرید واقعی انجام نشده است',
        });
        number += 1;
      }

      if (created.length === 0) return tick;

      return {
        ...tick,
        purchaseRequests: [...created, ...tick.purchaseRequests],
        notifications: pushNotification(
          tick,
          {
            kind: 'supplier',
            titleFa: 'پیشنهاد خرید',
            bodyFa: `${created.length} پیشنهاد خرید برای اقلام کم‌موجود آماده بررسی است.`,
            orderId: event.orderId,
          },
          event.id,
        ),
        lastEvent: { ...event, refs: { requestIds: created.map((item) => item.id).join(',') } },
      };
    }

    case 'ANALYTICS_UPDATED': {
      return { ...tick, ...recalculateMetrics(tick) };
    }

    case 'ORDER_PREPARING': {
      if (!order) return tick;
      return { ...tick, orders: withOrder(tick, order.id, { status: 'preparing' }) };
    }

    case 'ORDER_READY': {
      if (!order) return tick;
      return {
        ...tick,
        orders: withOrder(tick, order.id, { status: 'ready' }),
        notifications: pushNotification(
          tick,
          {
            kind: 'kitchen',
            titleFa: 'سفارش آماده است',
            bodyFa: `سفارش ${order.reference} آماده تحویل است.`,
            orderId: order.id,
          },
          event.id,
        ),
      };
    }

    case 'ORDER_COMPLETED': {
      if (!order) return tick;
      // Metrics are intentionally NOT recomputed here: the workflow emits a
      // dedicated ANALYTICS_UPDATED event right after, which is the only place
      // (besides an explicit cancellation) where KPIs are recalculated.
      return {
        ...tick,
        orders: withOrder(tick, order.id, { status: 'completed' }),
        notifications: pushNotification(
          tick,
          {
            kind: 'analytics',
            titleFa: 'تحویل سفارش',
            bodyFa: `سفارش ${order.reference} تحویل شد و در انتظار به‌روزرسانی تحلیل است.`,
            orderId: order.id,
          },
          event.id,
        ),
      };
    }

    case 'ORDER_CANCELLED': {
      if (!order) return tick;
      const cancelled: SimulationState = {
        ...tick,
        orders: withOrder(tick, order.id, {
          status: 'cancelled',
          paymentStatus: 'refunded',
          cancelReasonFa: order.cancelReasonFa ?? 'لغو توسط کاربر در محیط نمایشی',
        }),
      };
      return { ...cancelled, ...recalculateMetrics(cancelled) };
    }

    case 'PURCHASE_REQUEST_PREPARED': {
      const requestId = event.refs.requestId;
      if (!requestId) return tick;
      return {
        ...tick,
        purchaseRequests: tick.purchaseRequests.map((request) =>
          request.id === requestId && request.status === 'recommendation'
            ? { ...request, status: 'prepared', preparedAtIso: tick.clockIso }
            : request,
        ),
      };
    }

    case 'PURCHASE_REQUEST_APPROVED': {
      const requestId = event.refs.requestId;
      if (!requestId) return tick;
      return {
        ...tick,
        purchaseRequests: tick.purchaseRequests.map((request) =>
          request.id === requestId &&
          (request.status === 'recommendation' || request.status === 'prepared')
            ? { ...request, status: 'approved', approvedAtIso: tick.clockIso }
            : request,
        ),
      };
    }

    default:
      return tick;
  }
}

export function applyEvents(
  state: SimulationState,
  events: readonly SimulationEvent[],
): SimulationState {
  return events.reduce<SimulationState>((current, event) => applyEvent(current, event), state);
}

/* -------------------------------------------------------------------------- */
/* Replay                                                                    */
/* -------------------------------------------------------------------------- */

/** State at a given instant — the primitive the video layer renders from. */
export function deriveStateAt(
  initial: SimulationState,
  events: readonly SimulationEvent[],
  atMs: number,
): SimulationState {
  return applyEvents(
    initial,
    events.filter((event) => event.atMs <= atMs).sort((a, b) => a.atMs - b.atMs),
  );
}

/** State after exactly `frameCount` frames at `fps` — deterministic per frame. */
export function deriveStateAtFrame(
  initial: SimulationState,
  events: readonly SimulationEvent[],
  frame: number,
  fps: number,
  originMs: number,
): SimulationState {
  return deriveStateAt(initial, events, originMs + (frame / fps) * 1000);
}

/* -------------------------------------------------------------------------- */
/* Demo helpers                                                              */
/* -------------------------------------------------------------------------- */

/** First reference used by the demo after the seeded day (986…1081 are seeded). */
export const SAMPLE_ORDER_SEQUENCE = 1082;

/** The next free order sequence for a new demo order. */
export function nextOrderSequence(state: SimulationState): number {
  let max = SAMPLE_ORDER_SEQUENCE - 1;
  for (const order of state.orders) {
    const match = /^ord-(\d+)$/.exec(order.id);
    if (match?.[1]) max = Math.max(max, Number(match[1]));
  }
  return max + 1;
}

/**
 * The sample order used by the dashboard's demo control and by the commercial:
 * a classic A-Corp burger with extra cheese, ordered from table 7 by QR.
 */
export function buildSampleOrder(sequence = SAMPLE_ORDER_SEQUENCE): Order {
  return buildOrder({
    sequence,
    channel: 'qr',
    createdAtIso: DEMO_NOW_ISO,
    status: 'received',
    paymentStatus: 'pending',
    customerNameFa: CUSTOMER_NAMES_FA[0] ?? 'سارا محمدی',
    tableFa: TABLE_LABELS_FA[6] ?? 'میز ۷',
    lines: [{ menuItemId: 'menu-classic', quantity: 1, customizationIds: ['c-extra-cheese'] }],
    discountRate: 0,
    cancelReasonFa: null,
  });
}

/** Appends a freshly received order to state (the ORDER_RECEIVED step). */
export function insertOrder(state: SimulationState, order: Order): SimulationState {
  if (state.orders.some((existing) => existing.id === order.id)) return state;
  return { ...state, orders: [...state.orders, order] };
}

export function resetSimulation(): SimulationState {
  return createInitialState();
}

/** Builds a prepared/approved transition event for a purchase request. */
export function buildPurchaseRequestEvent(
  request: PurchaseRequest,
  type: 'PURCHASE_REQUEST_PREPARED' | 'PURCHASE_REQUEST_APPROVED',
  atMs: number,
): SimulationEvent {
  return {
    id: `${request.id}:${type}`,
    type,
    atMs,
    atIso: new Date(atMs).toISOString(),
    sequence: 0,
    orderId: request.orderId,
    titleFa: EVENT_TITLES_FA[type],
    detailFa:
      type === 'PURCHASE_REQUEST_APPROVED'
        ? `درخواست ${request.ingredientNameFa} تأیید شد — صرفاً شبیه‌سازی، بدون ارسال واقعی.`
        : `درخواست ${request.ingredientNameFa} برای تأیید مدیر تنظیم شد.`,
    refs: { requestId: request.id },
  };
}

/** Convenience for the "یک قدم جلو" control: next workflow event not yet applied. */
export function nextPendingEvent(
  state: SimulationState,
  events: readonly SimulationEvent[],
): SimulationEvent | undefined {
  return [...events].sort((a, b) => a.atMs - b.atMs).find((event) => !state.processed[event.id]);
}

/** Today's revenue from operational orders (used by the header KPI). */
export function todaySummary(state: SimulationState) {
  const aggregate = aggregateOrders(state.orders, DEMO_DAY_KEY);
  const pnl = buildProfitAndLoss(aggregate, state.marketing.spend / 30, 1);
  return { aggregate, pnl };
}

export const SIMULATION_START_MS = DEMO_NOW_MS;

export function statusAfter(type: SimulationEventType): OrderStatus | null {
  switch (type) {
    case 'ORDER_RECEIVED':
      return 'received';
    case 'ORDER_CONFIRMED':
      return 'confirmed';
    case 'ORDER_PREPARING':
      return 'preparing';
    case 'ORDER_READY':
      return 'ready';
    case 'ORDER_COMPLETED':
      return 'completed';
    case 'ORDER_CANCELLED':
      return 'cancelled';
    default:
      return null;
  }
}

export function orderReference(orderId: string): string {
  const match = /^ord-(\d+)$/.exec(orderId);
  return match?.[1] ? referenceOf(Number(match[1])) : orderId;
}

export function orderById(state: SimulationState, orderId: string): Order | undefined {
  return state.orders.find((order) => order.id === orderId);
}

export function menuName(menuItemId: string): string {
  return MENU_BY_ID.get(menuItemId)?.nameFa ?? 'قلم منو';
}

export function newOrderId(sequence: number): string {
  return orderIdOf(sequence);
}
