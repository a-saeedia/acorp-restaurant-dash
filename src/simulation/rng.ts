/**
 * Deterministic pseudo-random numbers.
 *
 * The generator is a 32-bit mulberry32 PRNG. It is seeded per call site so that
 * adding a new random consumer never shifts previously generated data.
 */

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Stable 32-bit hash of a string, used to derive per-entity seeds. */
export function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Seed derived from a namespace plus a key, so streams never collide. */
export function seedFrom(namespace: string, key: string | number): number {
  return hashString(`${namespace}:${key}`);
}

/** Integer in [min, max] inclusive. */
export function randomInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Float in [min, max). */
export function randomFloat(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min);
}

/** Weighted pick. Weights must be positive; falls back to the last entry. */
export function weightedPick<T>(rng: Rng, items: readonly T[], weights: readonly number[]): T {
  const total = weights.reduce((sum, w) => sum + Math.max(0, w), 0);
  if (total <= 0 || items.length === 0) {
    throw new Error('weightedPick requires at least one item with a positive weight');
  }
  let ticket = rng() * total;
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const weight = weights[i];
    if (item === undefined || weight === undefined) continue;
    ticket -= Math.max(0, weight);
    if (ticket <= 0) return item;
  }
  const last = items[items.length - 1];
  if (last === undefined) throw new Error('weightedPick: empty list');
  return last;
}

/** Picks `count` distinct entries while preserving a seeded order. */
export function sampleWithoutReplacement<T>(rng: Rng, items: readonly T[], count: number): T[] {
  const pool = [...items];
  const picked: T[] = [];
  const target = Math.min(count, pool.length);
  for (let i = 0; i < target; i += 1) {
    const index = Math.floor(rng() * pool.length);
    const [value] = pool.splice(index, 1);
    if (value !== undefined) picked.push(value);
  }
  return picked;
}
