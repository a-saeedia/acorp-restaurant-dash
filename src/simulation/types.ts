/**
 * A-Corp Restaurant Intelligence — domain types.
 *
 * Every screen (dashboard) and every frame (video) reads from these types.
 * Nothing here knows about React, Remotion, timers or the DOM.
 */

/* -------------------------------------------------------------------------- */
/* Units, currency and clock                                                  */
/* -------------------------------------------------------------------------- */

/** All monetary values are integers in Iranian Toman (تومان). */
export type Toman = number;

/** ISO-8601 timestamp with an explicit offset, e.g. 2026-10-21T20:15:00+03:30. */
export type IsoDateTime = string;

/** Calendar day key in the restaurant's local timezone, e.g. 2026-10-21. */
export type DayKey = string;

export type IngredientUnit = 'g' | 'piece';

export type StockStatus = 'critical' | 'low' | 'healthy';

/* -------------------------------------------------------------------------- */
/* Menu, recipes, ingredients                                                 */
/* -------------------------------------------------------------------------- */

export interface RecipeLine {
  ingredientId: string;
  /** In the ingredient's own unit (`g` or `piece`). */
  quantity: number;
}

export interface MenuItem {
  id: string;
  nameFa: string;
  descriptionFa: string;
  price: Toman;
  categoryFa: string;
  /** Base recipe for a single unit, before customisations. */
  recipe: RecipeLine[];
  /** Nominal kitchen preparation time, used by the kitchen display. */
  prepMinutes: number;
  /** Relative popularity weight used by the deterministic generator. */
  popularity: number;
}

export interface Customization {
  id: string;
  nameFa: string;
  priceDelta: Toman;
  /** Recipe delta applied on top of the menu item's base recipe. */
  recipeDelta: RecipeLine[];
}

export interface Ingredient {
  id: string;
  nameFa: string;
  unit: IngredientUnit;
  unitLabelFa: string;
  /** Cost of one unit, in Toman. */
  unitCost: Toman;
  /** Below this quantity the ingredient is flagged for replenishment. */
  reorderThreshold: number;
  /** Suggested replenishment quantity when the threshold is crossed. */
  reorderQuantity: number;
  supplierId: string;
}

export interface Supplier {
  id: string;
  nameFa: string;
  contactFa: string;
  leadTimeDays: number;
  ingredientIds: string[];
}

/* -------------------------------------------------------------------------- */
/* Orders                                                                     */
/* -------------------------------------------------------------------------- */

/** Where the order came from: a table-side QR scan or home delivery. */
export type OrderChannel = 'qr' | 'delivery';

/**
 * Canonical order state machine. `cancelled` is a terminal branch that is
 * always entered explicitly — never by skipping states.
 */
export type OrderStatus =
  | 'received'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export interface OrderItem {
  id: string;
  menuItemId: string;
  nameFa: string;
  quantity: number;
  unitPrice: Toman;
  customizationIds: string[];
  /** Human readable customisation labels, resolved once at order creation. */
  customizationLabelsFa: string[];
  lineSubtotal: Toman;
  /** Ingredient cost of the whole line (unit cost at order time × recipe). */
  lineCost: Toman;
  /** Fully resolved recipe for one unit, including customisation deltas. */
  resolvedRecipe: RecipeLine[];
}

export interface Order {
  id: string;
  /** Short Persian-facing reference, e.g. «۱۰۴۲». */
  reference: string;
  channel: OrderChannel;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAtIso: IsoDateTime;
  updatedAtIso: IsoDateTime;
  customerNameFa: string;
  /** Table label for QR orders, e.g. «میز ۷». */
  tableFa: string | null;
  items: OrderItem[];
  subtotal: Toman;
  discount: Toman;
  total: Toman;
  /** Ingredient + packaging cost of everything on the ticket. */
  cogs: Toman;
  prepMinutes: number;
  cancelReasonFa: string | null;
}

export interface SalesTransaction {
  id: string;
  orderId: string;
  atIso: IsoDateTime;
  dayKey: DayKey;
  channel: OrderChannel;
  grossSales: Toman;
  discount: Toman;
  refund: Toman;
  netSales: Toman;
  cogs: Toman;
  itemQuantity: Record<string, number>;
}

/* -------------------------------------------------------------------------- */
/* Inventory                                                                  */
/* -------------------------------------------------------------------------- */

export type InventoryTransactionKind = 'opening' | 'deduction' | 'replenishment' | 'adjustment';

export interface InventoryTransaction {
  id: string;
  ingredientId: string;
  kind: InventoryTransactionKind;
  /** Signed quantity delta in the ingredient's unit. */
  delta: number;
  quantityAfter: number;
  atIso: IsoDateTime;
  orderId: string | null;
  noteFa: string;
}

export interface InventoryRow {
  ingredient: Ingredient;
  quantity: number;
  status: StockStatus;
  /** quantity / reorderThreshold, clamped for the indicator. */
  level: number;
  value: Toman;
  supplierNameFa: string;
}

/* -------------------------------------------------------------------------- */
/* Purchasing                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * A purchase request starts as a *recommendation* computed from the stock
 * threshold. `prepared` and `approved` are simulated approvals inside the demo
 * only — no real purchase order is ever transmitted.
 */
export type PurchaseRequestStatus = 'recommendation' | 'prepared' | 'approved' | 'dismissed';

export interface PurchaseRequest {
  id: string;
  supplierId: string;
  supplierNameFa: string;
  ingredientId: string;
  ingredientNameFa: string;
  status: PurchaseRequestStatus;
  currentQuantity: number;
  reorderThreshold: number;
  recommendedQuantity: number;
  unitCost: Toman;
  estimatedCost: Toman;
  unitLabelFa: string;
  createdAtIso: IsoDateTime;
  preparedAtIso: IsoDateTime | null;
  approvedAtIso: IsoDateTime | null;
  orderId: string | null;
  noteFa: string;
}

/* -------------------------------------------------------------------------- */
/* Analytics                                                                  */
/* -------------------------------------------------------------------------- */

export interface Expense {
  id: string;
  categoryFa: string;
  labelFa: string;
  /** Straight-line monthly amount in Toman. Prorated per day when aggregated. */
  monthlyAmount: Toman;
}

export interface DailyAggregate {
  dayKey: DayKey;
  orderCount: number;
  grossSales: Toman;
  discounts: Toman;
  refunds: Toman;
  cogs: Toman;
  itemQuantity: Record<string, number>;
  qrOrders: number;
  deliveryOrders: number;
}

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'year';

export interface ProfitAndLoss {
  grossSales: Toman;
  discounts: Toman;
  refunds: Toman;
  netSales: Toman;
  cogs: Toman;
  grossProfit: Toman;
  operatingExpenses: Toman;
  marketingSpend: Toman;
  netOperatingProfit: Toman;
  grossMarginPct: number;
  netMarginPct: number;
}

export interface AnalyticsSnapshot {
  period: AnalyticsPeriod;
  fromDayKey: DayKey;
  toDayKey: DayKey;
  /** Whether the chart series is bucketed per day or per Jalali month. */
  granularity: 'day' | 'month';
  /** 0…1 share of the service day elapsed when the window includes today. */
  dayProgress: number;
  /** True when the window includes an unfinished service day. */
  isPartialDay: boolean;
  /** True when the window reaches into the synthetic historical dataset. */
  includesSyntheticHistory: boolean;
  pnl: ProfitAndLoss;
  orderCount: number;
  averageOrderValue: Toman;
  inventoryValue: Toman;
  topItems: Array<{ menuItemId: string; nameFa: string; quantity: number; revenue: Toman }>;
  daily: Array<{
    dayKey: DayKey;
    labelFa: string;
    netSales: Toman;
    orderCount: number;
  }>;
  channelSplit: Array<{ channel: OrderChannel; orders: number; share: number }>;
  ingredientSpend: Array<{ ingredientId: string; nameFa: string; amount: Toman }>;
  /** Percentage change versus the immediately preceding window of equal length. */
  comparison: {
    netSalesPct: number;
    orderCountPct: number;
    netProfitPct: number;
    averageOrderValuePct: number;
  };
  computedAtIso: IsoDateTime;
}

/* -------------------------------------------------------------------------- */
/* Marketing                                                                  */
/* -------------------------------------------------------------------------- */

export type CampaignChannel =
  | 'instagram'
  | 'google-maps'
  | 'referral'
  | 'delivery-app'
  | 'in-store-qr';

export interface MarketingCampaign {
  id: string;
  nameFa: string;
  channel: CampaignChannel;
  channelLabelFa: string;
  spend: Toman;
  impressions: number;
  clicks: number;
  conversions: number;
  revenueAttributed: Toman;
  startedOn: DayKey;
  endedOn: DayKey;
  active: boolean;
}

export interface MarketingSnapshot {
  period: AnalyticsPeriod;
  spend: Toman;
  impressions: number;
  clicks: number;
  conversions: number;
  revenueAttributed: Toman;
  clickThroughRate: number;
  conversionRate: number;
  attributionRoi: number;
  repeatCustomerRate: number;
  averageOrderValue: Toman;
  channels: Array<{
    channel: CampaignChannel;
    labelFa: string;
    spend: Toman;
    conversions: number;
    revenue: Toman;
    share: number;
  }>;
  topItems: Array<{ menuItemId: string; nameFa: string; quantity: number }>;
}

/* -------------------------------------------------------------------------- */
/* Simulation events                                                          */
/* -------------------------------------------------------------------------- */

export type SimulationEventType =
  | 'ORDER_RECEIVED'
  | 'ORDER_CONFIRMED'
  | 'KITCHEN_NOTIFIED'
  | 'ORDER_PREPARING'
  | 'ORDER_READY'
  | 'ORDER_COMPLETED'
  | 'ORDER_CANCELLED'
  | 'INVENTORY_DEDUCTED'
  | 'STOCK_THRESHOLD_CHECKED'
  | 'PURCHASE_RECOMMENDATION_CREATED'
  | 'PURCHASE_REQUEST_PREPARED'
  | 'PURCHASE_REQUEST_APPROVED'
  | 'ANALYTICS_UPDATED';

export interface SimulationEvent {
  /** Stable identifier — the idempotency key. */
  id: string;
  type: SimulationEventType;
  /** Milliseconds since the Unix epoch, on the simulated clock. */
  atMs: number;
  atIso: IsoDateTime;
  /** Monotonic ordering inside the workflow. */
  sequence: number;
  orderId: string | null;
  /** Persian title shown in the event log / video caption. */
  titleFa: string;
  /** Persian one-line explanation. */
  detailFa: string;
  /** Event-specific identifiers (purchase request id, ingredient id, …). */
  refs: Record<string, string>;
}

export type NotificationKind = 'cashier' | 'kitchen' | 'inventory' | 'supplier' | 'analytics';

export interface SimulationNotification {
  id: string;
  kind: NotificationKind;
  titleFa: string;
  bodyFa: string;
  atIso: IsoDateTime;
  orderId: string | null;
  read: boolean;
}

/* -------------------------------------------------------------------------- */
/* Simulation state                                                           */
/* -------------------------------------------------------------------------- */

export interface SimulationState {
  readonly seed: number;
  /** Wall clock of the demo, fixed so renders are reproducible. */
  clockMs: number;
  clockIso: IsoDateTime;
  /** Today's operational orders. Historical sales live in `history`. */
  orders: Order[];
  inventory: Record<string, number>;
  inventoryTransactions: InventoryTransaction[];
  purchaseRequests: PurchaseRequest[];
  /** One aggregate per day, oldest first, ending the day before the demo day. */
  history: DailyAggregate[];
  expenses: Expense[];
  campaigns: MarketingCampaign[];
  notifications: SimulationNotification[];
  /** Idempotency ledger: event id → true. */
  processed: Record<string, true>;
  metrics: AnalyticsSnapshot;
  marketing: MarketingSnapshot;
  /** Last applied event, for the event log strip. */
  lastEvent: SimulationEvent | null;
  appliedEventCount: number;
  /** Seed data version, used to guard resets. */
  readonly version: string;
  /** True once a live demo workflow has mutated operational state. */
  demoStarted: boolean;
}

/* -------------------------------------------------------------------------- */
/* Restaurant identity                                                        */
/* -------------------------------------------------------------------------- */

export interface RestaurantProfile {
  nameFa: string;
  brandFa: string;
  branchFa: string;
  cityFa: string;
  phoneFa: string;
  sloganFa: string;
}

export interface DemoClockStep {
  offsetMs: number;
  labelFa: string;
}
