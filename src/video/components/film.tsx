import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { SCENES, TOTAL_FRAMES } from '../timeline';
import { T, rgba } from '../theme';

/** Absolute frame index of every scene boundary, including 0 and the end. */
const CUTS = SCENES.reduce<number[]>(
  (acc, scene) => [...acc, (acc[acc.length - 1] ?? 0) + scene.frames],
  [0],
);

/**
 * Film-level treatment that sits above every scene: letterbox, cut flashes and
 * a light streak at each boundary. This is what makes nine separate sequences
 * feel like one continuous cut instead of nine slides.
 */
export function FilmOverlay() {
  const frame = useCurrentFrame();

  const barsIn = interpolate(frame, [0, 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const barsOut = interpolate(frame, [TOTAL_FRAMES - 34, TOTAL_FRAMES - 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bars = 46 * (1 - barsOut);
  const barOffset = -bars + barsIn * bars;

  const cut = CUTS.reduce<{ distance: number; index: number }>(
    (best, value, index) => {
      const distance = frame - value;
      if (distance < 0) return best;
      return distance < best.distance ? { distance, index } : best;
    },
    { distance: Number.POSITIVE_INFINITY, index: 0 },
  );

  const isTransition = frame > 22 && cut.distance >= 0 && cut.distance < 14 && cut.index > 0;
  const flash = isTransition
    ? interpolate(cut.distance, [0, 2, 7, 14], [0, 0.5, 0.16, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;
  const streak = isTransition
    ? interpolate(cut.distance, [0, 4, 12], [0, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;
  const streakX = interpolate(cut.distance, [0, 12], [-20, 120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: barOffset,
          height: bars,
          background: T.void,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: barOffset,
          height: bars,
          background: T.void,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${rgba(T.cream, 0.9)} 0%, ${rgba(T.gold, 0.55)} 40%, transparent 72%)`,
          opacity: flash * 0.5,
          mixBlendMode: 'screen',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '18%',
          bottom: '18%',
          left: `${streakX}%`,
          width: 240,
          opacity: streak * 0.55,
          transform: 'rotate(9deg)',
          background: `linear-gradient(90deg, transparent, ${rgba(T.cream, 0.4)} 42%, ${rgba(T.gold, 0.5)} 50%, transparent)`,
          filter: 'blur(22px)',
          mixBlendMode: 'screen',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 220px rgba(0,0,0,0.75)',
        }}
      />
    </AbsoluteFill>
  );
}
