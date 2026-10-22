/**
 * The film's visual language: void black, ultraviolet, gold, crystal.
 *
 * One palette, one light logic (purple key, gold accent, crystal specular),
 * one motion grammar (arrivals decelerate from oversize, exits accelerate,
 * cuts land on motion). Scenes import tokens and helpers from here only.
 */
import { Easing, interpolate, random } from 'remotion';

export const C = {
  void: '#050208',
  ink: '#0a0614',
  ink2: '#140b26',
  purple: '#7c3aed',
  violet: '#a855f7',
  lilac: '#c4b5fd',
  gold: '#e8b45c',
  goldHi: '#ffd98a',
  crystal: '#f8f6ff',
  mist: 'rgba(244,241,255,0.62)',
  dim: 'rgba(244,241,255,0.34)',
  line: 'rgba(196,181,253,0.16)',
  danger: '#ff6f7d',
} as const;

export const GRAD = {
  crystal: 'linear-gradient(180deg, #ffffff 0%, #ece7ff 38%, #b9a6f2 72%, #f8f6ff 100%)',
  gold: 'linear-gradient(180deg, #fff3cf 0%, #ffd98a 34%, #e8b45c 70%, #fff3cf 100%)',
  violet: 'linear-gradient(140deg, #c4b5fd 0%, #a855f7 40%, #6d28d9 100%)',
} as const;

export const FONT =
  "'Vazirmatn', 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', sans-serif";

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 0→1 over [start, start+duration], decelerating. */
export function ramp(
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = Easing.out(Easing.cubic),
): number {
  return interpolate(frame, [start, start + Math.max(1, duration)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
}

/** 1→0 over [start, start+duration]. */
export function decay(
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = Easing.in(Easing.cubic),
): number {
  return 1 - ramp(frame, start, duration, easing);
}

/** Deterministic signed noise in [-1, 1]. */
export const noise = (seed: string | number, t: number) => random(`${seed}:${t}`) * 2 - 1;

export interface CameraShake {
  x: number;
  y: number;
  rotate: number;
}

/** Handheld jolt that decays — used on impacts, never continuously. */
export function shakeAt(frame: number, start: number, amp = 14, duration = 18): CameraShake {
  const k = decay(frame, start, duration, Easing.out(Easing.quad));
  if (frame < start || k <= 0) return { x: 0, y: 0, rotate: 0 };
  return {
    x: noise(`sx${start}`, frame) * amp * k,
    y: noise(`sy${start}`, frame) * amp * 0.7 * k,
    rotate: noise(`sr${start}`, frame) * amp * 0.06 * k,
  };
}

/** Purple/gold split-light shadow for kinetic type. */
export const chroma = (amount = 1) =>
  `${amount * 1.5}px 0 rgba(168,85,247,0.55), ${-amount * 1.5}px 0 rgba(232,180,92,0.45)`;

export const glass = {
  background:
    'linear-gradient(158deg, rgba(255,255,255,0.075) 0%, rgba(124,58,237,0.06) 46%, rgba(5,2,8,0.55) 100%)',
  border: `1px solid ${C.line}`,
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -30px 60px -30px rgba(124,58,237,0.35), 0 30px 80px -40px rgba(0,0,0,0.9)',
} as const;
