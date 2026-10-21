/**
 * Analytics: every metric is derived from the same order/aggregate dataset.
 *
 * Definitions (also documented in docs/architecture.md):
 *   grossSales      = Σ subtotal of non-cancelled orders
 *   discounts       = Σ discount
 *   refunds         = Σ total of refunded orders
 *   netSales        = grossSales − discounts − refunds
 *   cogs            = Σ ingredient + packaging cost of sold items
 *   grossProfit     = netSales − cogs
 *   opex            = fixed monthly expenses × (window days ÷ 30)
 *   marketingSpend  = campaign spend × overlap ratio of the window
 *   netOperatingProfit = grossProfit − opex − marketingSpend
 *   aov             = netSales ÷ orderCount
 *   inventoryValue  = Σ current quantity × unit cost
 *
 * Revenue is never presented as profit. Historical days before the demo day
 * come from the synthetic daily dataset and are flagged as such.
 */

import {
  CUSTOMIZATION_BY_ID,
  EXPENSES,
  INGREDIENT_BY_ID,
  MENU_BY_ID,
} from './catalog';
import {
  DEMO_DAY_KEY,
  OPEX_DAYS_PER_MONTH,
  PERIOD_DAYS,
  SERVICE_END_HOUR,
  SERVICE_START_HOUR,
  addDays,
  dayKeyOf,
} from './config';
import { seedFrom, mulberry32 } from './rng';
import type {
  AnalyticsPeriod,
  AnalyticsSnapshot,
  DailyAggregate,
  DayKey,
  MarketingCampaign,
  MarketingSnapshot,
  MenuItem,
  Order,
  OrderChannel,
  ProfitAndLoss,
  RecipeLine,
  Toman,
} from './types';

/* -------------------------------------------------------------------------- */
/* Recipe resolution — the ONLY place ingredient consumption is calculated     */
/* -------------------------------------------------------------------------- */

/**
 * Resolves the effective recipe of one unit: base recipe plus customisation
 * deltas. Negative deltas are clamped at zero so a "no onion" request can never
 * create negative consumption.
 */
export function resolveRecipe(item: MenuItem, customizationIds: readonly string[]): RecipeLine[] {
  const quantities = new Map<string, number>();
  for (const line of item.recipe) {
    quantities.set(line.ingredientId, (quantities.get(line.ingredientId) ?? 0) + line.quantity);
  }
  for (const customizationId of customizationIds) {
    const customization = CUSTOMIZATION_BY_ID.get(customizationId);
    if (!customization) continue;
    for (const delta of customization.recipeDelta) {
      quantities.set(
        delta.ingredientId,
        (quantities.get(delta.ingredientId) ?? 0) + delta.quantity,
      );
    }
  }
  const resolved: RecipeLine[] = [];
  for (const [ingredientId, quantity] of quantities) {
    const safe = Math.max(0, Math.round(quantity));
    if (safe > 0) resolved.push({ ingredientId, quantity: safe });
  }
  resolved.sort((a, b) => a.ingredientId.localeCompare(b.ingredientId));
  return resolved;
}

/** Ingredient + packaging cost of a resolved recipe for `quantity` units. */
export function recipeCost(lines: readonly RecipeLine[], quantity = 1): Toman {
  let total = 0;
  for (const line of lines) {
    const ingredient = INGREDIENT_BY_ID.get(line.ingredientId);
    if (!ingredient) continue;
    total += line.quantity * ingredient.unitCost;
  }
  return Math.round(total * quantity);
}

/** Unit cost per 1000 Toman spent per ingredient — used by cost breakdowns. */
export function ingredientCostMap(lines: readonly RecipeLine[]): Map<string, Toman> {
  const map = new Map<string, Toman>();
  for (const line of lines) {
    const ingredient = INGREDIENT_BY_ID.get(line.ingredientId);
    if (!ingredient) continue;
    map.set(line.ingredientId, (map.get(line.ingredientId) ?? 0) + line.quantity * ingredient.unitCost);
  }
  return map;
}

/* -------------------------------------------------------------------------- */
/* Order math                                                */
/* -------------------------------------------------------------------------- */

export function orderGross(order: Order): Toman {
  return order.subtotal;
}

export function orderCogs(order: Order): Toman {
  return order.cogs;
}

/** Net revenue contributed by an order, after its discount and possible refund. */
export function orderNetSales(order: Order): Toman {
  if (order.status === 'cancelled') return 0;
  if (order.paymentStatus === 'refunded') return 0;
  return order.total;
}

function orderItemQuantity(order: Order): Record<string, number> {
  const map: Record<string, number> = {};
  for (const item of order.items) {
    map[item.menuItemId] = (map[item.menuItemId] ?? 0) + item.quantity;
  }
  return map;
}

/* -------------------------------------------------------------------------- */
/* Aggregates                                                                */
/* -------------------------------------------------------------------------- */

export function aggregateOrders(orders: readonly Order[], dayKey: DayKey): DailyAggregate {
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

  for (const order of orders) {
    if (dayKeyOf(order.createdAtIso) !== dayKey) continue;
    if (order.status === 'cancelled') {
      if (order.paymentStatus === 'refunded') aggregate.refunds += order.total;
      continue;
    }
    aggregate.orderCount += 1;
    aggregate.grossSales += order.subtotal;
    aggregate.discounts += order.discount;
    aggregate.cogs += order.cogs;
    if (order.paymentStatus === 'refunded') {
      aggregate.refunds += order.total;
    }
    if (order.channel === 'qr') aggregate.qrOrders += 1;
    else aggregate.deliveryOrders += 1;
    const quantities = orderItemQuantity(order);
    for (const [menuItemId, quantity] of Object.entries(quantities)) {
      aggregate.itemQuantity[menuItemId] = (aggregate.itemQuantity[menuItemId] ?? 0) + quantity;
    }
  }

  return aggregate;
}

function emptyAggregate(dayKey: DayKey): DailyAggregate {
  return {
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
}

function addAggregate(target: DailyAggregate, source: DailyAggregate): void {
  target.orderCount += source.orderCount;
  target.grossSales += source.grossSales;
  target.discounts += source.discounts;
  target.refunds += source.refunds;
  target.cogs += source.cogs;
  target.qrOrders += source.qrOrders;
  target.deliveryOrders += source.deliveryOrders;
  for (const [menuItemId, quantity] of Object.entries(source.itemQuantity)) {
    target.itemQuantity[menuItemId] = (target.itemQuantity[menuItemId] ?? 0) + quantity;
  }
}

/** Builds a day-key → aggregate index from the synthetic history. */
export function indexHistory(history: readonly DailyAggregate[]): Map<DayKey, DailyAggregate> {
  const map = new Map<DayKey, DailyAggregate>();
  for (const entry of history) map.set(entry.dayKey, entry);
  return map;
}

/* -------------------------------------------------------------------------- */
/* Profit & loss                                                             */
/* -------------------------------------------------------------------------- */

export function fixedOpexForDays(days: number): Toman {
  const monthly = EXPENSES.reduce((sum, expense) => sum + expense.monthlyAmount, 0);
  const prorated = (monthly / OPEX_DAYS_PER_MONTH) * days;
  return Math.round(prorated);
}

/**
 * Share of the service day that has already elapsed at `clockIso` (0…1).
 *
 * A "today" window is a partial day. Costing a full day of rent and payroll
 * against half a day of revenue produces a fake loss, so both sides of the P&L
 * are prorated by this factor. The UI always labels a partial day as such.
 */
export function serviceDayProgress(clockIso: string): number {
  const ms = Date.parse(clockIso);
  const local = new Date(ms + 3.5 * 3_600_000); // Tehran, no DST
  const hours = local.getUTCHours() + local.getUTCMinutes() / 60;
  const elapsed = hours - SERVICE_START_HOUR;
  const span = SERVICE_END_HOUR - SERVICE_START_HOUR;
  return Math.max(0.08, Math.min(1, elapsed / span));
}

/** Monthly-equivalent campaign spend, used to annualise long windows. */
export function monthlyCampaignSpend(campaigns: readonly MarketingCampaign[]): Toman {
  const monthAgo = addDays(DEMO_DAY_KEY, -30);
  return Math.round(
    campaigns.reduce((sum, campaign) => {
      const ratio = campaignOverlapRatio(campaign, monthAgo, DEMO_DAY_KEY);
      return sum + campaign.spend * Math.min(1, ratio);
    }, 0),
  );
}

/** Straight-line overlap of a campaign with a day-key window, 0…1. */
export function campaignOverlapRatio(
  campaign: MarketingCampaign,
  fromDayKey: DayKey,
  toDayKey: DayKey,
): number {
  const from = Date.parse(postfixDay(fromDayKey));
  const to = Date.parse(postfixDay(toDayKey));
  const start = Date.parse(postfixDay(campaign.startedOn));
  const end = Date.parse(postfixDay(campaign.endedOn));
  const overlapStart = Math.max(from, start);
  const overlapEnd = Math.min(to, end);
  if (overlapEnd < overlapStart) return 0;
  const overlapDays = (overlapEnd - overlapStart) / 86_400_000 + 1;
  const campaignDays = Math.max(1, (end - start) / 86_400_000 + 1);
  return Math.min(1, overlapDays / campaignDays);
}

function postfixDay(dayKey: DayKey): string {
  return `${dayKey}T00:00:00.000Z`;
}

export function marketingSpendForRange(
  campaigns: readonly MarketingCampaign[],
  fromDayKey: DayKey,
  toDayKey: DayKey,
): Toman {
  let total = 0;
  for (const campaign of campaigns) {
    total += campaign.spend * campaignOverlapRatio(campaign, fromDayKey, toDayKey);
  }
  return Math.round(total);
}

export function buildProfitAndLoss(
  aggregate: DailyAggregate,
  marketingSpend: Toman,
  windowDays: number,
): ProfitAndLoss {
  const netSales = aggregate.grossSales - aggregate.discounts - aggregate.refunds;
  const grossProfit = netSales - aggregate.cogs;
  const operatingExpenses = fixedOpexForDays(windowDays);
  const netOperatingProfit = grossProfit - operatingExpenses - marketingSpend;
  return {
    grossSales: aggregate.grossSales,
    discounts: aggregate.discounts,
    refunds: aggregate.refunds,
    netSales,
    cogs: aggregate.cogs,
    grossProfit,
    operatingExpenses,
    marketingSpend,
    netOperatingProfit,
    grossMarginPct: netSales === 0 ? 0 : round1((grossProfit / netSales) * 100),
    netMarginPct: netSales === 0 ? 0 : round1((netOperatingProfit / netSales) * 100),
  };
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/* -------------------------------------------------------------------------- */
/* Snapshot                                                                  */
/* -------------------------------------------------------------------------- */

const jalaliMonthFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  month: 'long',
  year: 'numeric',
});

const jalaliMonthKeyFormatter = new Intl.DateTimeFormat('en-US-u-ca-persian', {
  month: '2-digit',
  year: 'numeric',
});

function monthBucket(dayKey: DayKey): { key: string; labelFa: string } {
  const date = new Date(`${dayKey}T09:00:00.000Z`);
  return {
    key: jalaliMonthKeyFormatter.format(date),
    labelFa: jalaliMonthFormatter.format(date),
  };
}

export interface RangeSource {
  orders: readonly Order[];
  history: readonly DailyAggregate[];
  campaigns: readonly MarketingCampaign[];
  inventory: Record<string, number>;
  todayKey: DayKey;
}

function collectDays(source: RangeSource, fromKey: DayKey, toKey: DayKey): DailyAggregate[] {
  const historyIndex = indexHistory(source.history);
  const days: DailyAggregate[] = [];
  let cursor = fromKey;
  let guard = 0;
  while (cursor <= toKey && guard < 800) {
    if (cursor === source.todayKey) {
      days.push(aggregateOrders(source.orders, cursor));
    } else {
      days.push(historyIndex.get(cursor) ?? emptyAggregate(cursor));
    }
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return days;
}

export function buildAnalyticsSnapshot(
  source: RangeSource,
  period: AnalyticsPeriod,
  endDayKey: DayKey = source.todayKey,
  computedAtIso: string = `${source.todayKey}T00:00:00+03:30`,
): AnalyticsSnapshot {
  const windowDays = PERIOD_DAYS[period];
  const fromKey = addDays(endDayKey, -(windowDays - 1));
  const days = collectDays(source, fromKey, endDayKey);

  const total = emptyAggregate(fromKey);
  for (const day of days) addAggregate(total, day);

  // A window that ends today contains an unfinished service day. Prorate the
  // cost side by the elapsed share so the P&L is not structurally loss-making.
  const dayProgress = endDayKey === source.todayKey ? serviceDayProgress(computedAtIso) : 1;
  const isPartialDay = dayProgress < 0.999;
  const opexDays = windowDays - (1 - dayProgress);

  // Campaigns only cover the current month. Long windows are annualised from
  // the monthly-equivalent spend, documented in docs/architecture.md.
  const marketingSpend =
    windowDays > 45
      ? Math.round(monthlyCampaignSpend(source.campaigns) * (windowDays / 30))
      : Math.round(marketingSpendForRange(source.campaigns, fromKey, endDayKey));

  const netSales = total.grossSales - total.discounts - total.refunds;
  const grossProfit = netSales - total.cogs;
  const operatingExpenses = fixedOpexForDays(opexDays);
  const netOperatingProfit = grossProfit - operatingExpenses - marketingSpend;

  const pnl: ProfitAndLoss = {
    grossSales: total.grossSales,
    discounts: total.discounts,
    refunds: total.refunds,
    netSales,
    cogs: total.cogs,
    grossProfit,
    operatingExpenses,
    marketingSpend,
    netOperatingProfit,
    grossMarginPct: netSales === 0 ? 0 : round1((grossProfit / netSales) * 100),
    netMarginPct: netSales === 0 ? 0 : round1((netOperatingProfit / netSales) * 100),
  };

  // Previous window of equal length, for the delta badges.
  const prevEndKey = addDays(fromKey, -1);
  const prevStartKey = addDays(prevEndKey, -(windowDays - 1));
  const prevDays = collectDays(source, prevStartKey, prevEndKey);
  const prevTotal = emptyAggregate(prevStartKey);
  for (const day of prevDays) addAggregate(prevTotal, day);
  const prevMarketing = marketingSpendForRange(source.campaigns, prevStartKey, prevEndKey);
  const prevNetSales = prevTotal.grossSales - prevTotal.discounts - prevTotal.refunds;
  const prevGrossProfit = prevNetSales - prevTotal.cogs;
  const prevNet = prevGrossProfit - fixedOpexForDays(windowDays) - prevMarketing;

  // Chart series: daily for short windows, Jalali-monthly for a year.
  const granularity: 'day' | 'month' = windowDays > 45 ? 'month' : 'day';
  const series: AnalyticsSnapshot['daily'] = [];
  if (granularity === 'day') {
    for (const day of days) {
      const net = day.grossSales - day.discounts - day.refunds;
      series.push({
        dayKey: day.dayKey,
        labelFa: shortDayLabel(day.dayKey),
        netSales: net,
        orderCount: day.orderCount,
      });
    }
  } else {
    const buckets = new Map<string, { dayKey: DayKey; labelFa: string; netSales: number; orderCount: number }>();
    for (const day of days) {
      const { key, labelFa } = monthBucket(day.dayKey);
      const existing = buckets.get(key);
      const net = day.grossSales - day.discounts - day.refunds;
      if (existing) {
        existing.netSales += net;
        existing.orderCount += day.orderCount;
      } else {
        buckets.set(key, { dayKey: day.dayKey, labelFa, netSales: net, orderCount: day.orderCount });
      }
    }
    series.push(...buckets.values());
  }

  // Top items by quantity in the window.
  const topItems = Object.entries(total.itemQuantity)
    .map(([menuItemId, quantity]) => {
      const menuItem = MENU_BY_ID.get(menuItemId);
      return {
        menuItemId,
        nameFa: menuItem?.nameFa ?? 'قلم حذف‌شده',
        quantity,
        revenue: quantity * (menuItem?.price ?? 0),
      };
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const channelTotal = total.qrOrders + total.deliveryOrders;
  const channelSplit: AnalyticsSnapshot['channelSplit'] = (['qr', 'delivery'] as OrderChannel[]).map(
    (channel) => {
      const orders = channel === 'qr' ? total.qrOrders : total.deliveryOrders;
      return {
        channel,
        orders,
        share: channelTotal === 0 ? 0 : round1((orders / channelTotal) * 100),
      };
    },
  );

  const ingredientSpend = buildIngredientSpend(total);
  const inventoryValue = Object.entries(source.inventory).reduce((sum, [ingredientId, quantity]) => {
    const ingredient = INGREDIENT_BY_ID.get(ingredientId);
    return sum + (ingredient ? ingredient.unitCost * quantity : 0);
  }, 0);

  return {
    period,
    fromDayKey: fromKey,
    toDayKey: endDayKey,
    granularity,
    dayProgress,
    isPartialDay,
    includesSyntheticHistory: windowDays > 1,
    pnl,
    orderCount: total.orderCount,
    averageOrderValue: total.orderCount === 0 ? 0 : Math.round(netSales / total.orderCount),
    inventoryValue: Math.round(inventoryValue),
    topItems,
    daily: series,
    channelSplit,
    ingredientSpend,
    comparison: {
      netSalesPct: pctChange(prevNetSales, netSales),
      orderCountPct: pctChange(prevTotal.orderCount, total.orderCount),
      netProfitPct: pctChange(prevNet, netOperatingProfit),
      averageOrderValuePct: pctChange(
        prevTotal.orderCount === 0 ? 0 : prevNetSales / prevTotal.orderCount,
        total.orderCount === 0 ? 0 : netSales / total.orderCount,
      ),
    },
    computedAtIso,
  };
}

export function pctChange(previous: number, current: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return round1(((current - previous) / Math.abs(previous)) * 100);
}

function buildIngredientSpend(total: DailyAggregate): AnalyticsSnapshot['ingredientSpend'] {
  const spend = new Map<string, number>();
  for (const [menuItemId, quantity] of Object.entries(total.itemQuantity)) {
    const menuItem = MENU_BY_ID.get(menuItemId);
    if (!menuItem) continue;
    for (const line of menuItem.recipe) {
      const ingredient = INGREDIENT_BY_ID.get(line.ingredientId);
      if (!ingredient) continue;
      spend.set(
        line.ingredientId,
        (spend.get(line.ingredientId) ?? 0) + line.quantity * quantity * ingredient.unitCost,
      );
    }
  }
  return [...spend.entries()]
    .map(([ingredientId, amount]) => ({
      ingredientId,
      nameFa: INGREDIENT_BY_ID.get(ingredientId)?.nameFa ?? ingredientId,
      amount: Math.round(amount),
    }))
    .sort((a, b) => b.amount - a.amount);
}

/* -------------------------------------------------------------------------- */
/* Marketing                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Repeat-customer rate and conversion rates are *simulated estimates*. They are
 * derived deterministically from the window so they never flicker between
 * renders, and they are always labelled «برآورد شبیه‌سازی‌شده» in the UI.
 */
export function buildMarketingSnapshot(
  source: RangeSource,
  period: AnalyticsPeriod,
  endDayKey: DayKey = source.todayKey,
): MarketingSnapshot {
  const windowDays = PERIOD_DAYS[period];
  const fromKey = addDays(endDayKey, -(windowDays - 1));
  const analytics = buildAnalyticsSnapshot(source, period, endDayKey);

  let spend = 0;
  let impressions = 0;
  let clicks = 0;
  let conversions = 0;
  let revenueAttributed = 0;
  const channelMap = new Map<
    MarketingCampaign['channel'],
    { labelFa: string; spend: number; conversions: number; revenue: number }
  >();

  for (const campaign of source.campaigns) {
    const ratio = campaignOverlapRatio(campaign, fromKey, endDayKey);
    if (ratio === 0) continue;
    const campaignSpend = campaign.spend * ratio;
    const campaignConversions = campaign.conversions * ratio;
    const campaignRevenue = campaign.revenueAttributed * ratio;
    spend += campaignSpend;
    impressions += campaign.impressions * ratio;
    clicks += campaign.clicks * ratio;
    conversions += campaignConversions;
    revenueAttributed += campaignRevenue;
    const existing = channelMap.get(campaign.channel) ?? {
      labelFa: campaign.channelLabelFa,
      spend: 0,
      conversions: 0,
      revenue: 0,
    };
    existing.spend += campaignSpend;
    existing.conversions += campaignConversions;
    existing.revenue += campaignRevenue;
    channelMap.set(campaign.channel, existing);
  }

  const rng = mulberry32(seedFrom('marketing', `${period}:${endDayKey}`));
  const repeatCustomerRate = round1(31 + rng() * 11);
  const totalChannelRevenue = [...channelMap.values()].reduce((sum, value) => sum + value.revenue, 0);

  return {
    period,
    spend: Math.round(spend),
    impressions: Math.round(impressions),
    clicks: Math.round(clicks),
    conversions: Math.round(conversions),
    revenueAttributed: Math.round(revenueAttributed),
    clickThroughRate: impressions === 0 ? 0 : round1((clicks / impressions) * 100),
    conversionRate: clicks === 0 ? 0 : round1((conversions / clicks) * 100),
    attributionRoi: spend === 0 ? 0 : round1((revenueAttributed - spend) / spend),
    repeatCustomerRate,
    averageOrderValue: analytics.averageOrderValue,
    channels: [...channelMap.entries()].map(([channel, value]) => ({
      channel,
      labelFa: value.labelFa,
      spend: Math.round(value.spend),
      conversions: Math.round(value.conversions),
      revenue: Math.round(value.revenue),
      share: totalChannelRevenue === 0 ? 0 : round1((value.revenue / totalChannelRevenue) * 100),
    })),
    topItems: analytics.topItems.map((item) => ({
      menuItemId: item.menuItemId,
      nameFa: item.nameFa,
      quantity: item.quantity,
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* Presentation helpers                                                      */
/* -------------------------------------------------------------------------- */

const shortDayFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  day: 'numeric',
  month: 'short',
});

function shortDayLabel(dayKey: DayKey): string {
  return shortDayFormatter.format(new Date(`${dayKey}T09:00:00.000Z`));
}

export const DEMO_TODAY = DEMO_DAY_KEY;
