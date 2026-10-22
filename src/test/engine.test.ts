import { expect, it } from 'vitest';

import {
  applyEvent,
  applyEvents,
  buildOrderWorkflow,
  buildSampleOrder,
  deriveStateAt,
  insertOrder,
} from '../simulation/engine';
import { TODAY_ORDER_COUNT, createInitialState } from '../simulation/seed';
import { DEMO_NOW_MS } from '../simulation/config';
import { inventoryRows, purchaseRequestsByStatus } from '../simulation/selectors';
import { orderConsumption } from '../simulation/orders';
import type { SimulationEvent } from '../simulation/types';

function seededWorkflow() {
  const initial = createInitialState();
  const order = buildSampleOrder();
  const withOrder = insertOrder(initial, order);
  const events = buildOrderWorkflow(order.id, DEMO_NOW_MS);
  return { initial, withOrder, order, events };
}

function stockOf(state: ReturnType<typeof createInitialState>, id: string): number {
  return state.inventory[id] ?? 0;
}

it('runs the full order workflow through the canonical states', () => {
  const { withOrder, events, order: sampleOrder } = seededWorkflow();
  let state = withOrder;
  const seen: string[] = [];

  for (const event of events) {
    state = applyEvent(state, event);
    seen.push(event.type);
  }

  expect(seen).toEqual([
    'ORDER_RECEIVED',
    'ORDER_CONFIRMED',
    'KITCHEN_NOTIFIED',
    'INVENTORY_DEDUCTED',
    'STOCK_THRESHOLD_CHECKED',
    'PURCHASE_RECOMMENDATION_CREATED',
    'ANALYTICS_UPDATED',
    'ORDER_PREPARING',
    'ORDER_READY',
    'ORDER_COMPLETED',
    'ANALYTICS_UPDATED',
  ]);

  const order = state.orders.find((candidate) => candidate.id === sampleOrder.id);
  expect(order?.status).toBe('completed');
  expect(order?.paymentStatus).toBe('paid');
});

it('is idempotent: replaying an event never deducts stock twice', () => {
  const { withOrder, events } = seededWorkflow();
  const deduction = events.find((event) => event.type === 'INVENTORY_DEDUCTED');
  if (!deduction) throw new Error('missing deduction event');

  const afterFirst = applyEvent(withOrder, deduction);
  const afterSecond = applyEvent(afterFirst, deduction);

  expect(stockOf(afterSecond, 'ing-beef')).toBe(stockOf(afterFirst, 'ing-beef'));
  expect(stockOf(afterSecond, 'ing-cheese')).toBe(stockOf(afterFirst, 'ing-cheese'));
  expect(afterSecond.inventoryTransactions.length).toBe(afterFirst.inventoryTransactions.length);
  expect(afterSecond.appliedEventCount).toBe(afterFirst.appliedEventCount);
});

it('deducts exactly the resolved recipe of the order', () => {
  const { withOrder, order, events } = seededWorkflow();
  const deduction = events.find((event) => event.type === 'INVENTORY_DEDUCTED');
  if (!deduction) throw new Error('missing deduction event');

  const before = withOrder.inventory;
  const after = applyEvent(withOrder, deduction);
  const consumption = orderConsumption(order);

  for (const [ingredientId, quantity] of consumption) {
    expect(stockOf(after, ingredientId)).toBe((before[ingredientId] ?? 0) - quantity);
  }

  // Beef: 120g patty + 120g extra patty is NOT applied; this order adds cheese only.
  expect(stockOf(after, 'ing-beef')).toBe((before['ing-beef'] ?? 0) - 120);
  expect(stockOf(after, 'ing-cheese')).toBe((before['ing-cheese'] ?? 0) - 2);
});

it('creates a purchase recommendation when stock crosses the threshold', () => {
  const { withOrder, events } = seededWorkflow();
  const state = applyEvents(withOrder, events);

  const recommendations = purchaseRequestsByStatus(state, 'recommendation');
  expect(recommendations.length).toBeGreaterThan(0);

  const beef = recommendations.find((request) => request.ingredientId === 'ing-beef');
  expect(beef).toBeDefined();
  expect(beef?.estimatedCost).toBe((beef?.unitCost ?? 0) * (beef?.recommendedQuantity ?? 0));
  expect(beef?.noteFa).toContain('خرید واقعی انجام نشده');

  const low = inventoryRows(state).filter((row) => row.status !== 'healthy');
  expect(low.some((row) => row.ingredient.id === 'ing-beef')).toBe(true);
});

it('records cashier and kitchen notifications', () => {
  const { withOrder, events } = seededWorkflow();
  const state = applyEvents(withOrder, events.slice(0, 3));
  const kinds = new Set(state.notifications.map((notification) => notification.kind));
  expect(kinds.has('cashier')).toBe(true);
  expect(kinds.has('kitchen')).toBe(true);
});

it('updates analytics only through the ANALYTICS_UPDATED step', () => {
  const { withOrder, events } = seededWorkflow();
  const before = withOrder.metrics.pnl.netSales;
  const intakeOnly = events.filter((event) => event.sequence <= 4);
  expect(intakeOnly.map((event) => event.type)).not.toContain('ANALYTICS_UPDATED');

  const atIntake = applyEvents(withOrder, intakeOnly);
  expect(atIntake.metrics.pnl.netSales).toBe(before);

  const updated = applyEvents(withOrder, events);
  expect(updated.metrics.pnl.netSales).toBeGreaterThan(before);
});

it('replays deterministically to any instant', () => {
  const { initial, withOrder, events, order } = seededWorkflow();
  const midpoint = DEMO_NOW_MS + 5_000;
  const a = deriveStateAt(withOrder, events, midpoint);
  const b = deriveStateAt(withOrder, events, midpoint);
  expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  // Events after the cutoff must not be applied.
  expect(a.processed[`${order.id}:ORDER_COMPLETED:9`]).toBeUndefined();
  // And the untouched initial state must be reusable (no mutation).
  expect(initial.orders).toHaveLength(TODAY_ORDER_COUNT);
});

it('resets back to the identical initial state', () => {
  const first = createInitialState();
  const second = createInitialState();
  expect(second.orders.map((order) => order.id)).toEqual(first.orders.map((order) => order.id));
  expect(second.inventory).toEqual(first.inventory);
  expect(second.notifications.map((notification) => notification.id)).toEqual(
    first.notifications.map((notification) => notification.id),
  );
});

it('moves a purchase request recommendation â†’ prepared â†’ approved', () => {
  const { withOrder, events } = seededWorkflow();
  let state = applyEvents(withOrder, events);

  const target = purchaseRequestsByStatus(state, 'recommendation')[0];
  if (!target) throw new Error('no recommendation created');

  const prepared: SimulationEvent = {
    id: `${target.id}:PURCHASE_REQUEST_PREPARED`,
    type: 'PURCHASE_REQUEST_PREPARED',
    atMs: state.clockMs + 1000,
    atIso: new Date(state.clockMs + 1000).toISOString(),
    sequence: 0,
    orderId: null,
    titleFa: 'تنظیم درخواست',
    detailFa: '',
    refs: { requestId: target.id },
  };
  state = applyEvent(state, prepared);
  expect(state.purchaseRequests.find((request) => request.id === target.id)?.status).toBe(
    'prepared',
  );

  const approved: SimulationEvent = {
    ...prepared,
    id: `${target.id}:APPROVED`,
    type: 'PURCHASE_REQUEST_APPROVED',
  };
  state = applyEvent(state, approved);
  const approvedRequest = state.purchaseRequests.find((request) => request.id === target.id);
  expect(approvedRequest?.status).toBe('approved');
  expect(approvedRequest?.approvedAtIso).not.toBeNull();
});
