/**
 * On-screen copy for the crystal cut.
 *
 * Written as speech, not as UI labels: short, concrete, one claim per beat.
 * Persian is the voice; the wordmark stays Latin.
 */
export const SCRIPT = {
  brand: 'ACorp',
  tagline: 'سامانهٔ هوشمند مدیریت رستوران',
  cold: {
    line: 'از سفارش تا سود، یک سیستم.',
    sub: 'نسخهٔ ۱٫۰ — تهران',
  },
  problem: {
    beats: ['سفارش گم می‌شود.', 'موجودی تمام می‌شود.', 'سود، آخر ماه.', 'بس است.'],
    caption: 'هر روز همین سه اتفاق، در هر رستوران.',
  },
  order: {
    title: 'از QR تا آشپزخانه',
    caption: 'یک اسکن، یازده رویداد، صفر تماس تلفنی.',
    receipt: 'سفارش تأیید شد',
    steps: 11,
  },
  kitchen: {
    title: 'آشپزخانه، هم‌زمان.',
    caption: 'هر تیکت یک ساعت دارد؛ عقب نمان.',
  },
  inventory: {
    title: 'قبل از تمام شدن.',
    caption: 'کسری را سیستم می‌بیند، نه وقتی غذا تمام شد.',
    request: 'درخواست خرید خودکار',
  },
  analytics: {
    title: 'سود، نه فروش.',
    caption: 'هر عدد از همان رویدادهایی می‌آید که امروز ثبت شد.',
  },
  marketing: {
    title: 'هر تومان، برمی‌گردد.',
    caption: 'هزینه، تبدیل، درآمد — روی یک خط.',
  },
  product: {
    title: 'یک صفحه. کل عملیات.',
    caption: 'فارسی، راست‌به‌چپ، ساخته‌شده برای سرویس شب.',
  },
  outro: {
    line: 'داده، سرِ میز.',
    url: 'acorp.ir/dashboard',
    meta: 'متن‌باز · MIT · ساخته‌شده با Remotion',
  },
} as const;
