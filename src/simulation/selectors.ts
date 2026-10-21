/**
 * Read-only derivations from `SimulationState`. Components never compute
 * business rules themselves — they call these.
 */

import { INGREDIENTS, SUPPLIERS, SUPPLIER_BY_ID } from './catalog';
import { DEMO_DAY_KEY, PERIOD_DAYS, addDays } from './config';
import {
  aggregateOrders,
  buildAnalyticsSnapshot,
  buildMarketingSnapshot,
  indexHistory,
} from './analytics';
import type {
  AnalyticsPeriod,
  AnalyticsSnapshot,
  DailyAggregate,
  DayKey,
  Ingredient,
  InventoryRow,
  MarketingSnapshot,
  Order,
  OrderStatus,
  PurchaseRequest,
  SimulationState,
  StockStatus,
  Supplier,
  Toman,
} from './types';

/**
 * Stock classification (documented rule):
 *   critical → quantity < 50% of the reorder threshold
 *   low      → quantity < threshold
 *   healthy  → otherwise
 */
export function stockStatusOf(quantity: number, threshold: number): StockStatus {
  if (quantity < threshold * 0.5) return 'critical';
  if (quantity < threshold) return 'low';
  return 'healthy';
}

/** Bar level 0…100 where 200% of the threshold fills the bar. */
export function stockLevelOf(quantity: number, threshold: number): number {
  if (threshold <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((quantity / (threshold * 2)) * 100)));
}

export function inventoryRows(state: SimulationState): InventoryRow[] {
  return INGREDIENTS.map((ingredient: Ingredient) => {
    const quantity = state.inventory[ingredient.id] ?? 0;
    const supplier = SUPPLIER_BY_ID.get(ingredient.supplierId);
    return {
      ingredient,
      quantity,
      status: stockStatusOf(quantity, ingredient.reorderThreshold),
      level: stockLevelOf(quantity, ingredient.reorderThreshold),
      value: Math.round(quantity * ingredient.unitCost),
      supplierNameFa: supplier?.nameFa ?? '—',
    };
  });
}

export function inventoryValueOf(state: SimulationState): Toman {
  return inventoryRows(state).reduce((sum, row) => sum + row.value, 0);
}

export function lowStockRows(state: SimulationState): InventoryRow[] {
  return inventoryRows(state)
    .filter((row) => row.status !== 'healthy')
    .sort((a, b) => a.level - b.level);
}

/**
 * Healthy but within 15% of the threshold. Surfaced as "نزدیک حد سفارش" so the
 * inventory screen is informative before anything actually crosses the line.
 */
export function nearThresholdRows(state: SimulationState): InventoryRow[] {
  return inventoryRows(state)
    .filter(
      (row) =>
        row.status === 'healthy' &&
        row.quantity < row.ingredient.reorderThreshold * 1.15,
    )
    .sort((a, b) => a.level - b.level);
}

export function isNearThreshold(row: InventoryRow): boolean {
  return (
    row.status === 'healthy' && row.quantity < row.ingredient.reorderThreshold * 1.15
  );
}

export function ordersByStatus(state: SimulationState, status: OrderStatus): Order[] {
  return state.orders
    .filter((order) => order.status === status)
    .sort((a, b) => Date.parse(b.createdAtIso) - Date.parse(a.createdAtIso));
}

export function ordersByStatuses(state: SimulationState, statuses: OrderStatus[]): Order[] {
  const set = new Set(statuses);
  return state.orders
    .filter((order) => set.has(order.status))
    .sort((a, b) => Date.parse(b.createdAtIso) - Date.parse(a.createdAtIso));
}

export function activeOrders(state: SimulationState): Order[] {
  return ordersByStatuses(state, ['received', 'confirmed', 'preparing', 'ready']);
}

export function pipelineCounts(state: SimulationState): Record<OrderStatus, number> {
  const counts: Record<OrderStatus, number> = {
    received: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    cancelled: 0,
  };
  for (const order of state.orders) counts[order.status] += 1;
  return counts;
}

export function purchaseRequestsByStatus(
  state: SimulationState,
  status: PurchaseRequest['status'],
): PurchaseRequest[] {
  return state.purchaseRequests
    .filter((request) => request.status === status)
    .sort((a, b) => Date.parse(b.createdAtIso) - Date.parse(a.createdAtIso));
}

export function openPurchaseRequests(state: SimulationState): PurchaseRequest[] {
  return state.purchaseRequests.filter(
    (request) => request.status === 'recommendation' || request.status === 'prepared',
  );
}

export interface SupplierSummary {
  supplier: Supplier;
  ingredientRows: InventoryRow[];
  openRequests: number;
  openValue: Toman;
  worstStatus: StockStatus;
}

export function supplierSummaries(state: SimulationState): SupplierSummary[] {
  const rows = inventoryRows(state);
  return SUPPLIERS.map((supplier) => {
    const ingredientRows = rows.filter((row) => row.ingredient.supplierId === supplier.id);
    const requests = state.purchaseRequests.filter(
      (request) =>
        request.supplierId === supplier.id &&
        (request.status === 'recommendation' || request.status === 'prepared'),
    );
    const severity: Record<StockStatus, number> = { healthy: 0, low: 1, critical: 2 };
    const worstStatus = ingredientRows.reduce<StockStatus>(
      (worst, row) => (severity[row.status] > severity[worst] ? row.status : worst),
      'healthy',
    );
    return {
      supplier,
      ingredientRows,
      openRequests: requests.length,
      openValue: requests.reduce((sum, request) => sum + request.estimatedCost, 0),
      worstStatus,
    };
  });
}

export function supplierNameOf(supplierId: string): string {
  return SUPPLIERS.find((supplier) => supplier.id === supplierId)?.nameFa ?? '—';
}

export function lastInventoryTransactions(state: SimulationState, limit = 12) {
  return [...state.inventoryTransactions]
    .sort((a, b) => Date.parse(b.atIso) - Date.parse(a.atIso))
    .slice(0, limit);
}

export function unreadNotifications(state: SimulationState) {
  return state.notifications.filter((notification) => !notification.read);
}

/* -------------------------------------------------------------------------- */
/* Analytics views                                                           */
/* -------------------------------------------------------------------------- */

export function analyticsFor(
  state: SimulationState,
  period: AnalyticsPeriod,
): AnalyticsSnapshot {
  return buildAnalyticsSnapshot(
    {
      orders: state.orders,
      history: state.history,
      campaigns: state.campaigns,
      inventory: state.inventory,
      todayKey: DEMO_DAY_KEY,
    },
    period,
    DEMO_DAY_KEY,
    state.clockIso,
  );
}

export function marketingFor(state: SimulationState, period: AnalyticsPeriod): MarketingSnapshot {
  return buildMarketingSnapshot(
    {
      orders: state.orders,
      history: state.history,
      campaigns: state.campaigns,
      inventory: state.inventory,
      todayKey: DEMO_DAY_KEY,
    },
    period,
    DEMO_DAY_KEY,
  );
}

export function todayAggregate(state: SimulationState): DailyAggregate {
  return aggregateOrders(state.orders, DEMO_DAY_KEY);
}

export function historyIndex(state: SimulationState): Map<DayKey, DailyAggregate> {
  return indexHistory(state.history);
}

/** The last N days including today, oldest first. */
export function trailingDays(state: SimulationState, days: number): DailyAggregate[] {
  const index = historyIndex(state);
  const out: DailyAggregate[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const dayKey = addDays(DEMO_DAY_KEY, -offset);
    if (dayKey === DEMO_DAY_KEY) out.push(todayAggregate(state));
    else
      out.push(
        index.get(dayKey) ?? {
          dayKey,
          orderCount: 0,
          grossSales: 0,
          discounts: 0,
          refunds: 0,
          cogs: 0,
          itemQuantity: {},
          qrOrders: 0,
          deliveryOrders: 0,
        },
      );
  }
  return out;
}

export function periodDays(period: AnalyticsPeriod): number {
  return PERIOD_DAYS[period];
}

export function metricDeltaLabel(value: number): string {
  if (value > 0) return 'رشد';
  if (value < 0) return 'کاهش';
  return 'بدون تغییر';
}

/** Derived hourly distribution for the day chart. */
export function hourlyOrderCounts(state: SimulationState): number[] {
  const buckets = new Array<number>(12).fill(0);
  for (const order of state.orders) {
    const hour = Number(
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Tehran',
        hour: '2-digit',
        hour12: false,
      }).format(new Date(order.createdAtIso)),
    );
    const index = hour - 11;
    if (index >= 0 && index < buckets.length) buckets[index] = (buckets[index] ?? 0) + 1;
  }
  return buckets;
}
