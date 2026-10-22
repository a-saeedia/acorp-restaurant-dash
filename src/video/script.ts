/**
 * The commercial's script, as data.
 *
 * There is no Persian text-to-speech on this machine, so narration is carried
 * by kinetic Persian captions. Editing this file changes what the film says
 * without touching a single frame of layout.
 */

export type SceneId =
  | 'ColdOpen'
  | 'Problem'
  | 'OrderFlow'
  | 'Kitchen'
  | 'Inventory'
  | 'Analytics'
  | 'Marketing'
  | 'Product'
  | 'Outro';

export interface SceneScript {
  id: string;
  kicker: string;
  title: string;
  caption: string;
}

export const SCRIPT: Record<SceneId, SceneScript> = {
  ColdOpen: {
    id: 'ColdOpen',
    kicker: 'ACorp · Tehran',
    title: 'ACorp',
    caption: 'رستوران را از حدس‌زدن نجات می‌دهیم.',
  },
  Problem: {
    id: 'Problem',
    kicker: 'امروز',
    title: 'سه جای درز',
    caption: 'سفارش‌ها پراکنده‌اند، موجودی کور است، تحلیل دیر می‌رسد.',
  },
  OrderFlow: {
    id: 'OrderFlow',
    kicker: 'چرخهٔ سفارش',
    title: 'از QR تا سود',
    caption: 'یک سفارش، یازده رویداد قابل ردیابی — بدون یک خط کد اضافه.',
  },
  Kitchen: {
    id: 'Kitchen',
    kicker: 'آشپزخانه',
    title: 'هم‌زمان، نه بعداً',
    caption: 'تیکت همان لحظه‌ای می‌رسد که صندوق تأیید می‌کند.',
  },
  Inventory: {
    id: 'Inventory',
    kicker: 'موجودی',
    title: 'قبل از تمام‌شدن',
    caption: 'کسری موجودی، خودش پیشنهاد خرید می‌سازد — با مقدار و هزینهٔ دقیق.',
  },
  Analytics: {
    id: 'Analytics',
    kicker: 'تحلیل',
    title: 'سود، نه فروش',
    caption: 'هر عدد از همان رویدادها می‌آید؛ هزینه روزشمار می‌شود، نه تخمینی.',
  },
  Marketing: {
    id: 'Marketing',
    kicker: 'بازاریابی',
    title: 'هر تومان، قابل نسبت‌دادن',
    caption: 'هزینهٔ کمپین، تبدیل و بازگشت سرمایه — در همان صفحه.',
  },
  Product: {
    id: 'Product',
    kicker: 'محصول',
    title: 'یک صفحه، کل عملیات',
    caption: 'فارسی، راست‌به‌چپ، و سریع — ساخته‌شده برای میز کار واقعی.',
  },
  Outro: {
    id: 'Outro',
    kicker: 'ACorp',
    title: 'داده، سرِ میز',
    caption: 'متن‌باز · MIT · ساخته‌شده با Remotion · شبیه‌سازی قطعی',
  },
};
