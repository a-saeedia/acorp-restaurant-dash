/**
 * Persian interface copy. Kept in one place so terminology stays consistent
 * across the dashboard and the commercial.
 */

import type {
  AnalyticsPeriod,
  InventoryTransactionKind,
  OrderChannel,
  OrderStatus,
  PaymentStatus,
  PurchaseRequestStatus,
  SimulationEventType,
  StockStatus,
} from '../simulation/types';

export const NAV_LABELS_FA = {
  overview: 'میز کار',
  orders: 'سفارش‌ها',
  kitchen: 'آشپزخانه',
  inventory: 'انبار',
  suppliers: 'تأمین‌کنندگان',
  analytics: 'تحلیل کسب‌وکار',
  marketing: 'بازاریابی',
} as const;

export const ORDER_STATUS_FA: Record<OrderStatus, string> = {
  received: 'دریافت‌شده',
  confirmed: 'تأییدشده',
  preparing: 'در حال آماده‌سازی',
  ready: 'آماده تحویل',
  completed: 'تکمیل‌شده',
  cancelled: 'لغوشده',
};

export const ORDER_STATUS_ORDER: OrderStatus[] = [
  'received',
  'confirmed',
  'preparing',
  'ready',
  'completed',
];

export const CHANNEL_FA: Record<OrderChannel, string> = {
  qr: 'QR سر میز',
  delivery: 'ارسال آنلاین',
};

export const PAYMENT_FA: Record<PaymentStatus, string> = {
  paid: 'پرداخت‌شده',
  pending: 'در انتظار پرداخت',
  refunded: 'بازگشت وجه',
};

export const STOCK_STATUS_FA: Record<StockStatus, string> = {
  critical: 'بحرانی',
  low: 'کم‌موجود',
  healthy: 'متعادل',
};

export const PURCHASE_STATUS_FA: Record<PurchaseRequestStatus, string> = {
  recommendation: 'پیشنهاد خرید',
  prepared: 'درخواست تنظیم‌شده',
  approved: 'تأییدشده',
  dismissed: 'رد‌شده',
};

export const INVENTORY_TX_FA: Record<InventoryTransactionKind, string> = {
  opening: 'موجودی ابتدای روز',
  deduction: 'کسر مصرف',
  replenishment: 'شارژ مجدد',
  adjustment: 'اصلاح موجودی',
};

export const PERIOD_FA: Record<AnalyticsPeriod, string> = {
  day: 'امروز',
  week: '۷ روز',
  month: '۳۰ روز',
  year: 'یک سال',
};

export const PERIOD_LONG_FA: Record<AnalyticsPeriod, string> = {
  day: 'گزارش روزانه',
  week: 'گزارش هفتگی',
  month: 'گزارش ماهانه',
  year: 'گزارش سالانه',
};

export const EVENT_LABEL_FA: Record<SimulationEventType, string> = {
  ORDER_RECEIVED: 'دریافت سفارش',
  ORDER_CONFIRMED: 'تأیید صندوق',
  KITCHEN_NOTIFIED: 'اطلاع آشپزخانه',
  ORDER_PREPARING: 'شروع آماده‌سازی',
  ORDER_READY: 'آماده تحویل',
  ORDER_COMPLETED: 'تکمیل سفارش',
  ORDER_CANCELLED: 'لغو سفارش',
  INVENTORY_DEDUCTED: 'کسر انبار',
  STOCK_THRESHOLD_CHECKED: 'بررسی حد سفارش',
  PURCHASE_RECOMMENDATION_CREATED: 'پیشنهاد خرید',
  PURCHASE_REQUEST_PREPARED: 'تنظیم درخواست',
  PURCHASE_REQUEST_APPROVED: 'تأیید درخواست',
  ANALYTICS_UPDATED: 'به‌روزرسانی تحلیل',
};

/** Short demo-control copy used by the simulation dock. */
export const DEMO_COPY_FA = {
  badge: 'محیط نمایشی',
  title: 'کنترل شبیه‌سازی',
  reset: 'بازنشانی',
  submitOrder: 'ثبت سفارش نمونه',
  nextEvent: 'رویداد بعدی',
  play: 'پخش کامل',
  pause: 'توقف',
  replay: 'بازپخش',
  speed: 'سرعت',
  disclaimer: 'داده‌ها ساختگی است؛ هیچ سفارش یا خریدی در دنیای واقعی ثبت نمی‌شود.',
  log: 'گزارش رویدادها',
  clock: 'ساعت شبیه‌سازی',
} as const;

export const SECTIONS_FA = {
  livePipeline: 'مسیر زندهٔ سفارش',
  activeOrders: 'سفارش‌های فعال',
  stockAlerts: 'هشدارهای انبار',
  revenue7d: 'روند فروش',
  kitchenBoard: 'نمایشگر آشپزخانه',
  supplierRecommendations: 'پیشنهادهای تأمین',
  pnl: 'صورت سود و زیان',
  topItems: 'پرفروش‌ترین اقلام',
  channels: 'کانال‌های سفارش',
  campaigns: 'عملکرد کمپین‌ها',
  funnel: 'قیف تبدیل',
  costBreakdown: 'ترکیب هزینه',
} as const;
