import type { ReactNode } from 'react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * Frame-driven reveal. Every transition in the film uses this so motion stays
 * deterministic: same frame in, same pixels out.
 */
export function Reveal({
  children,
  start = 0,
  duration = 18,
  y = 22,
  x = 0,
  scale = 1,
  blur = 0,
  style,
}: {
  children: ReactNode;
  start?: number;
  duration?: number;
  y?: number;
  x?: number;
  scale?: number;
  blur?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - start,
    fps,
    durationInFrames: duration,
    config: { damping: 200, mass: 0.6 },
  });

  return (
    <div
      style={{
        opacity: progress,
        transform: `translate3d(${x * (1 - progress)}px, ${y * (1 - progress)}px, 0) scale(${
          1 + (scale - 1) * (1 - progress)
        })`,
        filter: blur > 0 ? `blur(${blur * (1 - progress)}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Linear 0→1 ramp, clamped, used for line draws and bar fills. */
export function useRamp(start: number, duration: number, easing = Easing.out(Easing.cubic)) {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
}

export function useFadeOut(startAt: number, duration = 14): number {
  const frame = useCurrentFrame();
  return interpolate(frame, [startAt, startAt + duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

export function CountUp({
  to,
  start,
  duration = 40,
  format,
  style,
}: {
  to: number;
  start: number;
  duration?: number;
  format: (value: number) => string;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const value = interpolate(frame, [start, start + duration], [0, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return <span style={style}>{format(value)}</span>;
}

/** Horizontal rule that draws itself. */
export function Hairline({
  start = 0,
  duration = 24,
  width = 520,
  color = '#e3a854',
  thickness = 2,
}: {
  start?: number;
  duration?: number;
  width?: number;
  color?: string;
  thickness?: number;
}) {
  const progress = useRamp(start, duration);
  return (
    <div
      style={{
        width,
        height: thickness,
        background: `linear-gradient(90deg, ${color}, rgba(227,168,84,0.05))`,
        transform: `scaleX(${progress})`,
        transformOrigin: 'right center',
        borderRadius: 2,
      }}
    />
  );
}
