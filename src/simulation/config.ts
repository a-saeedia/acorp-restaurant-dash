/**
 * Simulation configuration and the documented assumptions behind every number
 * in the product. Keep this file in sync with `docs/architecture.md`.
 */

import type { AnalyticsPeriod, DayKey } from './types';

/**
 * The demo clock is FIXED. Every render, every reset and every replay starts
 * from this instant, which is what makes video frames reproducible.
 */
export const DEMO_NOW_ISO = '2026-10-21T20:15:00+03:30';
export const DEMO_NOW_MS = Date.parse(DEMO_NOW_ISO);

/** Restaurant-local day keys are computed in this timezone. */
export const DEMO_TIMEZONE = 'Asia/Tehran';
/** Fixed UTC offset for Tehran (Iran abolished DST in 2022), in minutes. */
export const DEMO_UTC_OFFSET_MINUTES = 210;

export const SIMULATION_SEED = 20261021;
export const SIMULATION_VERSION = '1.0.0';

/** How many days of synthetic sales history are generated before the demo day. */
export const HISTORY_DAYS = 365;

/** Service window of a normal day, in local hours. */
export const SERVICE_START_HOUR = 11;
export const SERVICE_END_HOUR = 23;

/** A 30-day month is used to prorate fixed monthly operating costs. */
export const OPEX_DAYS_PER_MONTH = 30;

/**
 * Currency: Iranian Toman (تومان), integer values only.
 * 1 Toman = 10 Rial. The product never displays Rial.
 */
export const CURRENCY_LABEL_FA = 'تومان';
export const CURRENCY_CODE = 'IRT';

/** Period window sizes in days, used by the analytics selector. */
export const PERIOD_DAYS: Record<AnalyticsPeriod, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
};

/* -------------------------------------------------------------------------- */
/* Day keys (no external date library — Intl is available in V8 and Chromium)  */
/* -------------------------------------------------------------------------- */

const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: DEMO_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Local calendar day of an ISO timestamp, e.g. 2026-10-21. */
export function dayKeyOf(iso: string): DayKey {
  const parts = dayKeyFormatter.formatToParts(new Date(iso));
  const year = parts.find((p) => p.type === 'year')?.value ?? '1970';
  const month = parts.find((p) => p.type === 'month')?.value ?? '01';
  const day = parts.find((p) => p.type === 'day')?.value ?? '01';
  return `${year}-${month}-${day}`;
}

/** The local day boundary (00:00) of a day key, as epoch milliseconds. */
export function startOfDayMs(dayKey: DayKey): number {
  const [year, month, day] = dayKey.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Invalid day key: ${dayKey}`);
  }
  return Date.UTC(year, month - 1, day) - DEMO_UTC_OFFSET_MINUTES * 60_000;
}

/** Shifts a day key by a whole number of days. */
export function addDays(dayKey: DayKey, days: number): DayKey {
  const shifted = new Date(startOfDayMs(dayKey) + days * 86_400_000);
  return dayKeyFormatter.format(shifted);
}

/** List of day keys, oldest first, ending at (and including) `endDayKey`. */
export function dayKeyRange(endDayKey: DayKey, days: number): DayKey[] {
  const out: DayKey[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    out.push(addDays(endDayKey, -i));
  }
  return out;
}

/** 0 = Sunday … 6 = Saturday (JS convention), in restaurant-local time. */
export function weekdayOf(dayKey: DayKey): number {
  // Local noon avoids any DST/offset edge cases at the day boundary.
  return new Date(`${dayKey}T12:00:00+03:30`).getUTCDay();
}

export const DEMO_DAY_KEY = dayKeyOf(DEMO_NOW_ISO);
