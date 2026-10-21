import { describe, expect, it } from 'vitest';

import {
  buildAnalyticsSnapshot,
  campaignOverlapRatio,
  fixedOpexForDays,
  resolveRecipe,
  recipeCost,
} from '../simulation/analytics';
import { CUSTOMIZATIONS, MENU, MENU_BY_ID } from '../simulation/catalog';
import { DEMO_DAY_KEY, addDays, dayKeyOf } from '../simulation/config';
import {
  TODAY_ORDER_COUNT,
  createInitialState,
  generateHistory,
  generateTodayOrders,
} from '../simulation/seed';
import { aggregateOrders, buildMarketingSnapshot, pctChange } from '../simulation/analytics';
import { orderConsumption } from '../simulation/orders';

const classic = MENU_BY_ID.get('menu-classic');
if (!classic) throw new Error('menu fixture missing');

function qtyOf(lines: Array<{ ingredientId: string; quantity: number }>, id: string): number {
  return lines.find((line) => line.ingredientId === id)?.quantity ?? 0;
}

describe('recipe resolution', () => {
  it('resolves the base recipe of a menu item', () => {
    const resolved = resolveRecipe(classic, []);
    expect(qtyOf(resolved, 'ing-beef')).toBe(120);
    expect(qtyOf(resolved, 'ing-bun')).toBe(1);
    expect(qtyOf(resolved, 'ing-cheese')).toBe(1);
    expect(qtyOf(resolved, 'ing-pack')).toBe(1);
  });

  it('applies positive customisation deltas', () => {
    const resolved = resolveRecipe(classic, ['c-extra-cheese', 'c-extra-patty']);
    expect(qtyOf(resolved, 'ing-cheese')).toBe(2);
    expect(qtyOf(resolved, 'ing-beef')).toBe(240);
  });

  it('clamps negative deltas at zero instead of creating negative stock', () => {
    const resolved = resolveRecipe(classic, ['c-no-onion', 'c-no-sauce']);
    expect(qtyOf(resolved, 'ing-onion')).toBe(0);
    expect(qtyOf(resolved, 'ing-sauce')).toBe(0);
    expect(resolved.every((line) => line.quantity > 0)).toBe(true);
  });

  it('is order-independent for customisations', () => {
    const a = resolveRecipe(classic, ['c-no-onion', 'c-extra-sauce']);
    const b = resolveRecipe(classic, ['c-extra-sauce', 'c-no-onion']);
    expect(a).toEqual(b);
  });

  it('prices the classic burger at the documented food cost', () => {
    // 120×320 + 1×9,500 + 1×6,800 + 18×45 + 22×60 + 30×55 + 28×110 + 1×4,200
    expect(recipeCost(resolveRecipe(classic, []))).toBe(65_760);
  });

  it('keeps every customisation price delta reflected in the recipe cost', () => {
    for (const customization of CUSTOMIZATIONS) {
      const base = recipeCost(resolveRecipe(classic, []));
      const withCustomization = recipeCost(resolveRecipe(classic, [customization.id]));
      if (customization.priceDelta > 0) {
        expect(withCustomization).toBeGreaterThanOrEqual(base);
      } else {
        expect(withCustomization).toBeLessThanOrEqual(base);
      }
    }
  });
});

describe('seed determinism', () => {
  it('produces byte-identical state on repeated creation', () => {
    const first = createInitialState();
    const second = createInitialState();
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it('generates a full year of history ending yesterday', () => {
    const history = generateHistory();
    expect(history).toHaveLength(365);
    expect(history[history.length - 1]?.dayKey).toBe(addDays(DEMO_DAY_KEY, -1));
    expect(history.every((day) => day.orderCount > 0)).toBe(true);
  });

  it('generates the seeded operational day', () => {
    const orders = generateTodayOrders();
    expect(orders).toHaveLength(TODAY_ORDER_COUNT);
    for (const order of orders) {
      expect(dayKeyOf(order.createdAtIso)).toBe(DEMO_DAY_KEY);
    }
    // Orders are chronological and have unique references.
    const references = new Set(orders.map((order) => order.reference));
    expect(references.size).toBe(orders.length);
  });

  it('keeps the seeded inventory exactly at the documented post-seed targets', () => {
    const state = createInitialState();
    expect(state.inventory['ing-beef']).toBe(4_050);
    expect(state.inventory['ing-cheese']).toBe(31);
    expect(state.inventory['ing-bun']).toBe(46);
  });

  it('never seeds negative stock', () => {
    const state = createInitialState();
    for (const [ingredientId, quantity] of Object.entries(state.inventory)) {
      expect(quantity, ingredientId).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('analytics arithmetic', () => {
  it('never equals revenue to profit', () => {
    const state = createInitialState();
    const snapshot = buildAnalyticsSnapshot(
      {
        orders: state.orders,
        history: state.history,
        campaigns: state.campaigns,
        inventory: state.inventory,
        todayKey: DEMO_DAY_KEY,
      },
      'month',
      DEMO_DAY_KEY,
    );
    expect(snapshot.pnl.netSales).toBeGreaterThan(0);
    expect(snapshot.pnl.netOperatingProfit).toBeLessThan(snapshot.pnl.netSales);
    expect(snapshot.pnl.grossProfit).toBe(snapshot.pnl.netSales - snapshot.pnl.cogs);
    expect(snapshot.pnl.netOperatingProfit).toBe(
      snapshot.pnl.grossProfit - snapshot.pnl.operatingExpenses - snapshot.pnl.marketingSpend,
    );
  });

  it('ties net sales to gross sales, discounts and refunds', () => {
    const state = createInitialState();
    const aggregate = aggregateOrders(state.orders, DEMO_DAY_KEY);
    expect(aggregate.grossSales - aggregate.discounts - aggregate.refunds).toBeGreaterThan(0);

    const snapshot = buildAnalyticsSnapshot(
      {
        orders: state.orders,
        history: state.history,
        campaigns: state.campaigns,
        inventory: state.inventory,
        todayKey: DEMO_DAY_KEY,
      },
      'day',
      DEMO_DAY_KEY,
    );
    expect(snapshot.pnl.grossSales).toBe(aggregate.grossSales);
    expect(snapshot.pnl.netSales).toBe(
      aggregate.grossSales - aggregate.discounts - aggregate.refunds,
    );
  });

  it('computes average order value from net sales, not gross sales', () => {
    const state = createInitialState();
    const snapshot = buildAnalyticsSnapshot(
      {
        orders: state.orders,
        history: state.history,
        campaigns: state.campaigns,
        inventory: state.inventory,
        todayKey: DEMO_DAY_KEY,
      },
      'week',
      DEMO_DAY_KEY,
    );
    expect(snapshot.averageOrderValue).toBe(
      Math.round(snapshot.pnl.netSales / snapshot.orderCount),
    );
  });

  it('prorates fixed operating expenses over a 30-day month', () => {
    expect(fixedOpexForDays(30)).toBe(685_000_000);
    expect(fixedOpexForDays(1)).toBe(Math.round(685_000_000 / 30));
  });

  it('scales campaign attribution by window overlap', () => {
    const state = createInitialState();
    const campaign = state.campaigns[0];
    if (!campaign) throw new Error('campaign fixture missing');
    expect(campaignOverlapRatio(campaign, '2026-10-01', '2026-10-21')).toBeCloseTo(1, 5);
    const half = campaignOverlapRatio(campaign, '2026-10-01', '2026-10-10');
    expect(half).toBeGreaterThan(0.4);
    expect(half).toBeLessThan(0.55);
  });

  it('reports a year window using monthly buckets', () => {
    const state = createInitialState();
    const snapshot = buildAnalyticsSnapshot(
      {
        orders: state.orders,
        history: state.history,
        campaigns: state.campaigns,
        inventory: state.inventory,
        todayKey: DEMO_DAY_KEY,
      },
      'year',
      DEMO_DAY_KEY,
    );
    expect(snapshot.granularity).toBe('month');
    expect(snapshot.daily.length).toBeGreaterThanOrEqual(12);
    expect(snapshot.daily.every((bucket) => bucket.labelFa.length > 0)).toBe(true);
  });

  it('exposes a marketing snapshot whose ROI is derived, not invented', () => {
    const state = createInitialState();
    const marketing = buildMarketingSnapshot(
      {
        orders: state.orders,
        history: state.history,
        campaigns: state.campaigns,
        inventory: state.inventory,
        todayKey: DEMO_DAY_KEY,
      },
      'month',
      DEMO_DAY_KEY,
    );
    const expectedRoi =
      Math.round(((marketing.revenueAttributed - marketing.spend) / marketing.spend) * 10) / 10;
    expect(marketing.attributionRoi).toBe(expectedRoi);
    expect(marketing.channels.reduce((sum, channel) => sum + channel.share, 0)).toBeCloseTo(100, 0);
  });

  it('computes percentage change without dividing by zero', () => {
    expect(pctChange(0, 0)).toBe(0);
    expect(pctChange(0, 10)).toBe(100);
    expect(pctChange(100, 90)).toBe(-10);
  });
});

describe('order consumption consistency', () => {
  it('derives the same consumption everywhere for the same order', () => {
    const state = createInitialState();
    const order = state.orders[10];
    if (!order) throw new Error('seeded order missing');
    const first = orderConsumption(order);
    const second = orderConsumption(order);
    expect([...first.entries()]).toEqual([...second.entries()]);
    for (const item of order.items) {
      expect(item.resolvedRecipe.length).toBeGreaterThan(0);
    }
  });

  it('sells only menu items that exist in the catalogue', () => {
    const state = createInitialState();
    const menuIds = new Set(MENU.map((item) => item.id));
    for (const order of state.orders) {
      for (const item of order.items) {
        expect(menuIds.has(item.menuItemId)).toBe(true);
      }
    }
  });
});
