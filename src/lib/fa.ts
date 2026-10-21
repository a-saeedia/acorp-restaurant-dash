/**
 * Persian (fa-IR) presentation helpers.
 *
 * Single place that decides how numbers, money, dates and durations are shown.
 * Everything renders Persian-Indic digits (۰۱۲۳۴۵۶۷۸۹) and the Jalali calendar,
 * while identifiers can opt into Latin digits with `latinDigits`.
 */

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;

export const CURRENCY_LABEL_FA = 'تومان';

/** Converts every ASCII digit in a string to its Persian counterpart. */
export function toFaDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (digit) => FA_DIGITS[Number(digit)] ?? digit);
}

/** Keeps Latin digits — used for technical identifiers such as `AC-1062`. */
export function latinDigits(input: string | number): string {
  return String(input);
}

/** Grouped integer with Persian digits. */
export function faNumber(value: number, options: { decimals?: number } = {}): string {
  const decimals = options.decimals ?? 0;
  return new Intl.NumberFormat('fa-IR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Percentage with a Persian percent sign. */
export function faPercent(value: number, decimals = 1): string {
  return `${faNumber(value, { decimals })}٪`;
}

/** Signed percentage for deltas, e.g. ‎+۴٫۲٪. */
export function faDelta(value: number, decimals = 1): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${faNumber(Math.abs(value), { decimals })}٪`;
}

/** Money in Toman with Persian digits. */
export function faMoney(value: number, options: { suffix?: boolean; decimals?: number } = {}): string {
  const suffix = options.suffix ?? true;
  const rounded = options.decimals ? value : Math.round(value);
  const sign = rounded < 0 ? '−' : '';
  const formatted = faNumber(Math.abs(rounded), { decimals: options.decimals ?? 0 });
  return suffix ? `${sign}${formatted} ${CURRENCY_LABEL_FA}` : `${sign}${formatted}`;
}

/** Compact money for chart axes: ۱۲٫۴ م / ۱٫۲ میلیارد. */
export function faMoneyCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}${faNumber(abs / 1_000_000_000, { decimals: 1 })} میلیارد`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${faNumber(abs / 1_000_000, { decimals: 1 })} م`;
  }
  if (abs >= 1_000) {
    return `${sign}${faNumber(abs / 1_000, { decimals: 0 })} هزار`;
  }
  return `${sign}${faNumber(abs)}`;
}

/* -------------------------------------------------------------------------- */
/* Dates — Jalali calendar via Intl                                          */
/* -------------------------------------------------------------------------- */

const TIMEZONE = 'Asia/Tehran';

const timeFormatter = new Intl.DateTimeFormat('fa-IR', {
  timeZone: TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const longDateFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: TIMEZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: TIMEZONE,
  day: 'numeric',
  month: 'long',
});

const weekdayFormatter = new Intl.DateTimeFormat('fa-IR', {
  timeZone: TIMEZONE,
  weekday: 'long',
});

/** ۲۰:۱۵ */
export function faTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

/** ۲۹ مهر ۱۴۰۵ */
export function faDate(iso: string): string {
  return longDateFormatter.format(new Date(iso));
}

/** ۲۹ مهر */
export function faDateShort(iso: string): string {
  return shortDateFormatter.format(new Date(iso));
}

/** چهارشنبه */
export function faWeekday(iso: string): string {
  return weekdayFormatter.format(new Date(iso));
}

/** Human duration: ۱۴ دقیقه / ۱ ساعت و ۵ دقیقه */
export function faDuration(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  if (minutes < 60) return `${faNumber(minutes)} دقیقه`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0
    ? `${faNumber(hours)} ساعت`
    : `${faNumber(hours)} ساعت و ${faNumber(rest)} دقیقه`;
}

/** «۳ دقیقه پیش» / «همین حالا» from a millisecond difference. */
export function faElapsed(milliseconds: number): string {
  const seconds = Math.max(0, Math.round(milliseconds / 1000));
  if (seconds < 20) return 'همین حالا';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${faNumber(minutes)} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${faNumber(hours)} ساعت پیش`;
  return `${faNumber(Math.floor(hours / 24))} روز پیش`;
}

/** Live kitchen timer: ۰۳:۴۲ */
export function faClockDuration(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return toFaDigits(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
}

/** Persian weekday index labels, Saturday-first (Iranian week). */
export const WEEKDAY_LABELS_FA = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
] as const;

/** ISO timestamp at local noon for a YYYY-MM-DD day key. */
export function isoFromDayKey(dayKey: string): string {
  return `${dayKey}T12:00:00+03:30`;
}

export function faDayKeyShort(dayKey: string): string {
  return faDateShort(isoFromDayKey(dayKey));
}

export function faDayKey(dayKey: string): string {
  return faDate(isoFromDayKey(dayKey));
}
