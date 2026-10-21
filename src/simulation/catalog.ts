/**
 * Fictional A-Corp catalogue: restaurant identity, menu, recipes, ingredients,
 * suppliers, fixed costs and simulated marketing campaigns.
 *
 * All values are invented for the demonstration. They are internally
 * consistent and documented — see docs/architecture.md#fictional-data.
 */

import type {
  Customization,
  Expense,
  Ingredient,
  MarketingCampaign,
  MenuItem,
  RecipeLine,
  RestaurantProfile,
  Supplier,
} from './types';

export const RESTAURANT: RestaurantProfile = {
  nameFa: 'ACorp',
  brandFa: 'ACorp',
  branchFa: 'شعبه ونک',
  cityFa: 'تهران',
  phoneFa: '۰۲۱-۸۸۷۴۲۲۱۰',
  sloganFa: 'هر سفارش، یک زنجیره دقیق',
};

export const INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-beef',
    nameFa: 'گوشت چرخ‌کرده ممتاز',
    unit: 'g',
    unitLabelFa: 'گرم',
    unitCost: 320,
    reorderThreshold: 4000,
    reorderQuantity: 12000,
    supplierId: 'sup-meat',
  },
  {
    id: 'ing-bun',
    nameFa: 'نان برگر کنجدی',
    unit: 'piece',
    unitLabelFa: 'عدد',
    unitCost: 9500,
    reorderThreshold: 40,
    reorderQuantity: 120,
    supplierId: 'sup-bun',
  },
  {
    id: 'ing-cheese',
    nameFa: 'پنیر چدار',
    unit: 'piece',
    unitLabelFa: 'ورقه',
    unitCost: 6800,
    reorderThreshold: 30,
    reorderQuantity: 100,
    supplierId: 'sup-dairy',
  },
  {
    id: 'ing-onion',
    nameFa: 'پیاز',
    unit: 'g',
    unitLabelFa: 'گرم',
    unitCost: 45,
    reorderThreshold: 1200,
    reorderQuantity: 5000,
    supplierId: 'sup-produce',
  },
  {
    id: 'ing-lettuce',
    nameFa: 'کاهو',
    unit: 'g',
    unitLabelFa: 'گرم',
    unitCost: 60,
    reorderThreshold: 800,
    reorderQuantity: 3000,
    supplierId: 'sup-produce',
  },
  {
    id: 'ing-tomato',
    nameFa: 'گوجه‌فرنگی',
    unit: 'g',
    unitLabelFa: 'گرم',
    unitCost: 55,
    reorderThreshold: 1000,
    reorderQuantity: 4000,
    supplierId: 'sup-produce',
  },
  {
    id: 'ing-sauce',
    nameFa: 'سس مخصوص ACorp',
    unit: 'g',
    unitLabelFa: 'گرم',
    unitCost: 110,
    reorderThreshold: 700,
    reorderQuantity: 2500,
    supplierId: 'sup-sauce',
  },
  {
    id: 'ing-pack',
    nameFa: 'بسته‌بندی سفارشی',
    unit: 'piece',
    unitLabelFa: 'عدد',
    unitCost: 4200,
    reorderThreshold: 35,
    reorderQuantity: 150,
    supplierId: 'sup-pack',
  },
];

export const SUPPLIERS: Supplier[] = [
  {
    id: 'sup-meat',
    nameFa: 'پروتئین پارس',
    contactFa: '۰۲۱-۵۵۴۹۸۲۱۰',
    leadTimeDays: 1,
    ingredientIds: ['ing-beef'],
  },
  {
    id: 'sup-bun',
    nameFa: 'نان‌آوران تهران',
    contactFa: '۰۲۱-۶۶۳۴۱۱۷۸',
    leadTimeDays: 1,
    ingredientIds: ['ing-bun'],
  },
  {
    id: 'sup-dairy',
    nameFa: 'لبنیات دشت سبز',
    contactFa: '۰۲۱-۷۷۹۲۳۴۵۱',
    leadTimeDays: 2,
    ingredientIds: ['ing-cheese'],
  },
  {
    id: 'sup-produce',
    nameFa: 'سبزی‌رسان شمال',
    contactFa: '۰۹۱۲-۴۴۸۷۲۳۹',
    leadTimeDays: 1,
    ingredientIds: ['ing-onion', 'ing-lettuce', 'ing-tomato'],
  },
  {
    id: 'sup-sauce',
    nameFa: 'سس‌خانه آفتاب',
    contactFa: '۰۲۱-۸۸۳۴۵۵۹۰',
    leadTimeDays: 3,
    ingredientIds: ['ing-sauce'],
  },
  {
    id: 'sup-pack',
    nameFa: 'بسته‌بندی نوین',
    contactFa: '۰۲۱-۹۱۰۰۲۲۴۴',
    leadTimeDays: 2,
    ingredientIds: ['ing-pack'],
  },
];

const recipe = (lines: Array<[string, number]>): RecipeLine[] =>
  lines.map(([ingredientId, quantity]) => ({ ingredientId, quantity }));

export const MENU: MenuItem[] = [
  {
    id: 'menu-classic',
    nameFa: 'برگر کلاسیک ACorp',
    descriptionFa: 'پتی گوشت ۱۲۰ گرمی، چدار، پیاز، کاهو، گوجه و سس مخصوص',
    price: 285_000,
    categoryFa: 'برگر گوشت',
    prepMinutes: 7,
    popularity: 34,
    recipe: recipe([
      ['ing-beef', 120],
      ['ing-bun', 1],
      ['ing-cheese', 1],
      ['ing-onion', 18],
      ['ing-lettuce', 22],
      ['ing-tomato', 30],
      ['ing-sauce', 28],
      ['ing-pack', 1],
    ]),
  },
  {
    id: 'menu-double',
    nameFa: 'برگر دوبل چدار',
    descriptionFa: 'دو پتی ۱۱۰ گرمی، دو ورقه چدار، سس مخصوص',
    price: 395_000,
    categoryFa: 'برگر گوشت',
    prepMinutes: 10,
    popularity: 22,
    recipe: recipe([
      ['ing-beef', 220],
      ['ing-bun', 1],
      ['ing-cheese', 2],
      ['ing-onion', 22],
      ['ing-lettuce', 26],
      ['ing-tomato', 34],
      ['ing-sauce', 34],
      ['ing-pack', 1],
    ]),
  },
  {
    id: 'menu-chef',
    nameFa: 'برگر مخصوص سرآشپز',
    descriptionFa: 'پتی ۱۸۰ گرمی، چدار، پیاز کاراملی و سس ویژه سرآشپز',
    price: 445_000,
    categoryFa: 'برگر گوشت',
    prepMinutes: 12,
    popularity: 14,
    recipe: recipe([
      ['ing-beef', 180],
      ['ing-bun', 1],
      ['ing-cheese', 1],
      ['ing-onion', 26],
      ['ing-lettuce', 32],
      ['ing-tomato', 38],
      ['ing-sauce', 45],
      ['ing-pack', 1],
    ]),
  },
  {
    id: 'menu-mini',
    nameFa: 'برگر مینی',
    descriptionFa: 'پتی ۸۰ گرمی با چدار و سس مخصوص، مناسب کودکان',
    price: 185_000,
    categoryFa: 'برگر گوشت',
    prepMinutes: 5,
    popularity: 11,
    recipe: recipe([
      ['ing-beef', 80],
      ['ing-bun', 1],
      ['ing-cheese', 1],
      ['ing-onion', 12],
      ['ing-lettuce', 14],
      ['ing-tomato', 18],
      ['ing-sauce', 16],
      ['ing-pack', 1],
    ]),
  },
  {
    id: 'menu-onion',
    nameFa: 'برگر پیاز کاراملی',
    descriptionFa: 'پتی ۱۵۰ گرمی با پیاز کاراملی فراوان و سس مخصوص',
    price: 335_000,
    categoryFa: 'برگر گوشت',
    prepMinutes: 9,
    popularity: 19,
    recipe: recipe([
      ['ing-beef', 150],
      ['ing-bun', 1],
      ['ing-cheese', 1],
      ['ing-onion', 55],
      ['ing-lettuce', 20],
      ['ing-tomato', 26],
      ['ing-sauce', 40],
      ['ing-pack', 1],
    ]),
  },
];

export const CUSTOMIZATIONS: Customization[] = [
  {
    id: 'c-extra-cheese',
    nameFa: 'پنیر اضافه',
    priceDelta: 25_000,
    recipeDelta: [{ ingredientId: 'ing-cheese', quantity: 1 }],
  },
  {
    id: 'c-extra-patty',
    nameFa: 'پتی اضافه',
    priceDelta: 95_000,
    recipeDelta: [{ ingredientId: 'ing-beef', quantity: 120 }],
  },
  {
    id: 'c-extra-sauce',
    nameFa: 'سس اضافه',
    priceDelta: 8_000,
    recipeDelta: [{ ingredientId: 'ing-sauce', quantity: 20 }],
  },
  {
    id: 'c-no-onion',
    nameFa: 'بدون پیاز',
    priceDelta: 0,
    recipeDelta: [{ ingredientId: 'ing-onion', quantity: -18 }],
  },
  {
    id: 'c-no-sauce',
    nameFa: 'بدون سس',
    priceDelta: 0,
    recipeDelta: [{ ingredientId: 'ing-sauce', quantity: -28 }],
  },
  {
    id: 'c-spicy',
    nameFa: 'سس تند',
    priceDelta: 9_000,
    recipeDelta: [{ ingredientId: 'ing-sauce', quantity: 12 }],
  },
];

/**
 * Fixed monthly operating costs. They are prorated straight-line over a 30-day
 * month. Marketing spend is NOT listed here — it is derived from the campaign
 * dataset so the two never double count.
 */
export const EXPENSES: Expense[] = [
  { id: 'exp-rent', categoryFa: 'اجاره', labelFa: 'اجارهٔ مکان — ونک', monthlyAmount: 165_000_000 },
  { id: 'exp-staff', categoryFa: 'نیروی انسانی', labelFa: 'حقوق و بیمهٔ ۱۴ نفر', monthlyAmount: 395_000_000 },
  { id: 'exp-utilities', categoryFa: 'انرژی', labelFa: 'برق، آب، گاز و اینترنت', monthlyAmount: 78_000_000 },
  { id: 'exp-misc', categoryFa: 'سایر', labelFa: 'نگهداری، نظافت و ملزومات', monthlyAmount: 47_000_000 },
];

/**
 * Marketing campaigns inside the 30-day reporting window. Revenue attribution
 * is first-touch and simulated — it is never presented as verified ad revenue.
 */
export const CAMPAIGNS: MarketingCampaign[] = [
  {
    id: 'cmp-instagram',
    nameFa: 'کمپین اینستاگرام — برگر شب',
    channel: 'instagram',
    channelLabelFa: 'اینستاگرام',
    spend: 38_000_000,
    impressions: 412_000,
    clicks: 9_840,
    conversions: 1_180,
    revenueAttributed: 386_000_000,
    startedOn: '2026-10-01',
    endedOn: '2026-10-21',
    active: true,
  },
  {
    id: 'cmp-maps',
    nameFa: 'تبلیغات نقشه و جست‌وجوی محلی',
    channel: 'google-maps',
    channelLabelFa: 'جست‌وجوی محلی',
    spend: 24_000_000,
    impressions: 186_000,
    clicks: 5_220,
    conversions: 760,
    revenueAttributed: 241_000_000,
    startedOn: '2026-10-01',
    endedOn: '2026-10-21',
    active: true,
  },
  {
    id: 'cmp-referral',
    nameFa: 'باشگاه معرفی مشتری',
    channel: 'referral',
    channelLabelFa: 'معرفی مشتری',
    spend: 12_000_000,
    impressions: 21_400,
    clicks: 3_100,
    conversions: 540,
    revenueAttributed: 168_000_000,
    startedOn: '2026-10-01',
    endedOn: '2026-10-21',
    active: true,
  },
  {
    id: 'cmp-delivery',
    nameFa: 'کمپین اپلیکیشن‌های ارسال',
    channel: 'delivery-app',
    channelLabelFa: 'اپلیکیشن ارسال',
    spend: 21_000_000,
    impressions: 96_000,
    clicks: 4_180,
    conversions: 690,
    revenueAttributed: 205_000_000,
    startedOn: '2026-10-01',
    endedOn: '2026-10-21',
    active: true,
  },
  {
    id: 'cmp-qr',
    nameFa: 'منوی QR روی میز',
    channel: 'in-store-qr',
    channelLabelFa: 'QR داخل رستوران',
    spend: 4_000_000,
    impressions: 33_800,
    clicks: 12_900,
    conversions: 1_640,
    revenueAttributed: 132_000_000,
    startedOn: '2026-10-01',
    endedOn: '2026-10-21',
    active: true,
  },
];

/** Deterministic pool of fictional customer names for seeded orders. */
export const CUSTOMER_NAMES_FA = [
  'سارا محمدی',
  'امیر رضایی',
  'نگار کاظمی',
  'حسین صادقی',
  'مریم احمدی',
  'پویا نیک‌نام',
  'الهام موسوی',
  'رضا شریفی',
  'آیدا کریمی',
  'بابک تهرانی',
  'شیدا فراهانی',
  'مهدی قاسمی',
  'لیلا اکبری',
  'کیان مرادی',
  'فرزانه یوسفی',
  'سینا بهرامی',
] as const;

/** Table labels used by QR orders. */
export const TABLE_LABELS_FA = [
  'میز ۱',
  'میز ۲',
  'میز ۳',
  'میز ۴',
  'میز ۵',
  'میز ۶',
  'میز ۷',
  'میز ۸',
  'میز ۹',
  'میز ۱۰',
  'میز ۱۱',
  'میز ۱۲',
] as const;

export const INGREDIENT_BY_ID = new Map(INGREDIENTS.map((item) => [item.id, item]));
export const MENU_BY_ID = new Map(MENU.map((item) => [item.id, item]));
export const CUSTOMIZATION_BY_ID = new Map(CUSTOMIZATIONS.map((item) => [item.id, item]));
export const SUPPLIER_BY_ID = new Map(SUPPLIERS.map((item) => [item.id, item]));
