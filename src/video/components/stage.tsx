import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Aurora, Grain, GridFloor, Particles, Scanlines, Vignette } from './kit';
import { T, rgba } from '../theme';
import { sceneFrames } from '../timeline';

/**
 * Shared stage. Every scene sits on the same violet void so nine different
 * layouts still read as one film: aurora, perspective grid, dust, grain,
 * scanlines, vignette — then content on top.
 */
export function Stage({
  children,
  tone = 'violet',
  grid = true,
  dust = true,
  intensity = 1,
  gridOpacity = 0.34,
}: {
  children: ReactNode;
  tone?: 'violet' | 'gold' | 'mixed';
  grid?: boolean;
  dust?: boolean;
  intensity?: number;
  gridOpacity?: number;
}) {
  return (
    <AbsoluteFill style={{ backgroundColor: T.void, overflow: 'hidden' }}>
      <Aurora tone={tone} intensity={intensity} />
      {grid ? (
        <GridFloor
          opacity={gridOpacity * intensity}
          color={tone === 'gold' ? rgba(T.gold, 0.2) : rgba(T.lilac, 0.24)}
          speed={0.9}
          horizon={tone === 'gold' ? 62 : 58}
        />
      ) : null}
      {dust ? (
        <Particles
          count={54}
          seed={tone === 'gold' ? 31 : 17}
          color={tone === 'gold' ? T.gold : T.lilac}
          opacity={0.5 * intensity}
          size={2.4}
          rise={0.44}
        />
      ) : null}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 44%, ${rgba(T.plum, 0.28)} 0%, transparent 58%)`,
        }}
      />
      {children}
      <Scanlines opacity={0.055} />
      <Grain opacity={0.13} />
      <Vignette strength={0.82} />
    </AbsoluteFill>
  );
}

/** Safe area: 92px gutters, RTL, Vazirmatn. */
export function Frame({
  children,
  align = 'center',
  style,
}: {
  children: ReactNode;
  align?: 'center' | 'top';
  style?: CSSProperties;
}) {
  return (
    <AbsoluteFill
      style={{
        padding: '86px 92px 108px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        color: T.cream,
        direction: 'rtl',
        fontFamily: 'Vazirmatn, system-ui, sans-serif',
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

/**
 * Per-scene in/out. `useVideoConfig().durationInFrames` reports the *film*
 * length inside a Sequence, so the scene length comes from the timeline table.
 */
export function SceneShell({
  id,
  children,
  enter = 14,
  exit = 10,
  zoom = 0.045,
  blur = 16,
}: {
  id: string;
  children: ReactNode;
  enter?: number;
  exit?: number;
  zoom?: number;
  blur?: number;
}) {
  const frame = useCurrentFrame();
  const total = sceneFrames(id);

  const inProgress = interpolate(frame, [0, enter], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const outProgress = interpolate(frame, [total - exit, total], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        opacity: inProgress * (1 - outProgress * 0.9),
        transform: `scale(${1 + (1 - inProgress) * zoom + outProgress * zoom * 0.6}) translateY(${(1 - inProgress) * 22}px)`,
        filter: `blur(${(1 - inProgress) * blur + outProgress * blur * 0.7}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

/** Bottom-third narration line with a drawing gold rule. */
export function Caption({ text, opacity = 1 }: { text: string; opacity?: number }) {
  const frame = useCurrentFrame();
  const settle = interpolate(frame, [0, 40], [0.02, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        insetInline: 92,
        bottom: 62,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        opacity,
      }}
    >
      <span
        style={{
          width: 54,
          height: 1.5,
          flex: 'none',
          background: `linear-gradient(90deg, ${T.gold}, ${rgba(T.gold, 0)})`,
          boxShadow: `0 0 14px ${rgba(T.gold, 0.6)}`,
        }}
      />
      <span
        lang="fa"
        style={{
          fontSize: 25,
          lineHeight: 1.6,
          color: 'rgba(247,242,232,0.72)',
          letterSpacing: `${settle}em`,
          textShadow: '0 8px 30px rgba(0,0,0,0.8)',
        }}
      >
        {text}
      </span>
    </div>
  );
}

/** Top-left running slug, like a broadcast lower-third. */
export function Slug({ label, index }: { label: string; index: string }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 54,
        left: 92,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 14,
        letterSpacing: '0.18em',
        color: rgba(T.cream, 0.34),
        fontVariantNumeric: 'tabular-nums',
        direction: 'ltr',
      }}
    >
      <span style={{ color: rgba(T.gold, 0.8) }}>{index}</span>
      <span>{label.toUpperCase()}</span>
      <span
        style={{
          width: 90,
          height: 1,
          background: `linear-gradient(90deg, ${rgba(T.cream, 0.35)}, transparent)`,
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: -1,
            left: `${progress * 100}%`,
            width: 22,
            height: 3,
            background: T.gold,
            boxShadow: `0 0 12px ${T.gold}`,
          }}
        />
      </span>
    </div>
  );
}
