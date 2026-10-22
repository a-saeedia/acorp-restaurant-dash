import type { CSSProperties, ReactNode } from 'react';
import { useMemo } from 'react';
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { T, rgba } from '../theme';

/* -------------------------------------------------------------------------- */
/*  Deterministic helpers                                                     */
/* -------------------------------------------------------------------------- */

/** Tiny LCG: identical sequence on every render, no Math.random in the film. */
export function rng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function useEnter(start: number, duration = 20, damping = 180) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - start,
    fps,
    durationInFrames: duration,
    config: { damping, mass: 0.7 },
  });
}

/* -------------------------------------------------------------------------- */
/*  Atmosphere                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Slow violet/gold nebulae. Position is a function of the frame, so the
 * background breathes instead of sitting still under the motion.
 */
export function Aurora({
  intensity = 1,
  drift = 1,
  tone = 'violet',
}: {
  intensity?: number;
  drift?: number;
  tone?: 'violet' | 'gold' | 'mixed';
}) {
  const frame = useCurrentFrame();
  const t = frame / 30;

  const blobs = [
    {
      x: 18 + Math.sin(t * 0.21) * 7 * drift,
      y: 22 + Math.cos(t * 0.17) * 5 * drift,
      size: 1180,
      color: tone === 'gold' ? rgba(T.gold, 0.3) : rgba(T.violet, 0.5),
    },
    {
      x: 76 + Math.cos(t * 0.15) * 6 * drift,
      y: 16 + Math.sin(t * 0.19) * 6 * drift,
      size: 980,
      color: tone === 'gold' ? rgba(T.goldDeep, 0.26) : rgba(T.magenta, 0.24),
    },
    {
      x: 52 + Math.sin(t * 0.11 + 1.7) * 9 * drift,
      y: 88 + Math.cos(t * 0.13 + 0.6) * 4 * drift,
      size: 1320,
      color: tone === 'violet' ? rgba(T.lilac, 0.26) : rgba(T.gold, 0.22),
    },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: intensity }}>
      {blobs.map((blob, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            width: blob.size,
            height: blob.size,
            marginLeft: -blob.size / 2,
            marginTop: -blob.size / 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 66%)`,
            filter: 'blur(90px)',
          }}
        />
      ))}
    </div>
  );
}

/** Perspective floor grid that scrolls toward the camera. */
export function GridFloor({
  opacity = 0.5,
  speed = 1.2,
  cell = 96,
  color = T.violetLine,
  horizon = 58,
}: {
  opacity?: number;
  speed?: number;
  cell?: number;
  color?: string;
  horizon?: number;
}) {
  const frame = useCurrentFrame();
  const shift = (frame * speed) % cell;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity }}>
      <div
        style={{
          position: 'absolute',
          left: '-40%',
          right: '-40%',
          top: `${horizon}%`,
          bottom: '-30%',
          perspective: '820px',
          perspectiveOrigin: '50% 0%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'rotateX(72deg)',
            transformOrigin: '50% 0%',
            backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
            backgroundSize: `${cell}px ${cell}px`,
            backgroundPosition: `0px ${shift}px`,
            maskImage:
              'linear-gradient(to bottom, transparent 0%, black 22%, black 68%, transparent 96%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 22%, black 68%, transparent 96%)',
          }}
        />
      </div>
    </div>
  );
}

/** Floating dust / embers. Deterministic layout, frame-driven vertical drift. */
export function Particles({
  count = 42,
  seed = 7,
  color = T.gold,
  size = 3,
  rise = 0.55,
  opacity = 0.7,
  spread = 100,
}: {
  count?: number;
  seed?: number;
  color?: string;
  size?: number;
  rise?: number;
  opacity?: number;
  spread?: number;
}) {
  const frame = useCurrentFrame();
  const dots = useMemo(() => {
    const rand = rng(seed);
    return Array.from({ length: count }, () => ({
      x: rand() * 100,
      y: rand() * 100,
      r: 0.35 + rand() * 1,
      speed: 0.35 + rand() * 1.1,
      phase: rand() * Math.PI * 2,
      twinkle: 0.4 + rand() * 0.6,
    }));
  }, [count, seed]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity }}>
      {dots.map((dot, index) => {
        const y = (((dot.y - (frame * rise * dot.speed) / 30) % 110) + 110) % 110;
        const x = dot.x + Math.sin(frame / 26 + dot.phase) * 1.6;
        const twinkle = 0.45 + 0.55 * Math.abs(Math.sin(frame / 22 + dot.phase));
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${(x / 100) * spread}%`,
              top: `${y}%`,
              width: size * dot.r * 2,
              height: size * dot.r * 2,
              borderRadius: '50%',
              background: color,
              opacity: twinkle * dot.twinkle,
              boxShadow: `0 0 ${size * 4}px ${rgba(color, 0.7)}`,
            }}
          />
        );
      })}
    </div>
  );
}

/** Animated orbit rings — the film's recurring "system" motif. */
export function Orbits({
  cx = 50,
  cy = 50,
  rings = 3,
  base = 320,
  stroke = T.goldLine,
  speed = 0.5,
  opacity = 0.8,
  tilt = 0,
}: {
  cx?: number;
  cy?: number;
  rings?: number;
  base?: number;
  stroke?: string;
  speed?: number;
  opacity?: number;
  tilt?: number;
}) {
  const frame = useCurrentFrame();

  return (
    <svg
      viewBox="-600 -600 1200 1200"
      style={{
        position: 'absolute',
        left: `${cx}%`,
        top: `${cy}%`,
        width: base * 3,
        height: base * 3,
        transform: `translate(-50%, -50%) rotate(${tilt}deg)`,
        opacity,
        overflow: 'visible',
      }}
    >
      {Array.from({ length: rings }, (_, index) => {
        const radius = base * (0.55 + index * 0.28);
        return (
          <g key={index} transform={`rotate(${frame * speed + index * 34} 0 0)`}>
            <circle
              r={radius}
              fill="none"
              stroke={stroke}
              strokeWidth={index === 0 ? 1.6 : 1}
              strokeDasharray={index % 2 === 0 ? `${radius * 0.5} ${radius * 2}` : undefined}
              opacity={1 - index * 0.22}
            />
          </g>
        );
      })}
      <circle r={base * 0.16} fill="none" stroke={rgba(T.gold, 0.5)} strokeWidth={2} />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Texture layers                                                            */
/* -------------------------------------------------------------------------- */

const GRAIN_URI =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="180" height="180" filter="url(#n)" opacity="0.55"/></svg>`,
  );

export function Grain({ opacity = 0.16, scale = 1 }: { opacity?: number; scale?: number }) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity,
        mixBlendMode: 'overlay',
        backgroundImage: `url("${GRAIN_URI}")`,
        backgroundSize: `${180 * scale}px ${180 * scale}px`,
        backgroundPosition: `${(frame * 7) % 180}px ${(frame * 13) % 180}px`,
      }}
    />
  );
}

export function Scanlines({ opacity = 0.06 }: { opacity?: number }) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity,
        backgroundImage:
          'repeating-linear-gradient(to bottom, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 4px)',
        backgroundPosition: `0 ${frame % 4}px`,
        mixBlendMode: 'overlay',
      }}
    />
  );
}

export function Vignette({ strength = 0.78 }: { strength?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `radial-gradient(ellipse at 50% 46%, transparent 38%, rgba(2,1,6,${strength}) 100%)`,
      }}
    />
  );
}

/** Diagonal specular sweep. `at` is the frame the highlight crosses the frame. */
export function Shine({
  at,
  duration = 26,
  width = 460,
  angle = 18,
  opacity = 0.5,
}: {
  at: number;
  duration?: number;
  width?: number;
  angle?: number;
  opacity?: number;
}) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [at, at + duration], [-0.5, 1.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  if (frame < at || frame > at + duration) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: -200,
        pointerEvents: 'none',
        opacity,
        transform: `translateX(${progress * 2200 - 1100}px) rotate(${angle}deg)`,
        background: `linear-gradient(90deg, transparent, ${rgba(T.cream, 0.06)} 30%, ${rgba(T.cream, 0.34)} 50%, ${rgba(T.cream, 0.06)} 70%, transparent)`,
        width,
        filter: 'blur(14px)',
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Layout + type                                                             */
/* -------------------------------------------------------------------------- */

export function Halo({
  x = 50,
  y = 50,
  size = 700,
  color = T.gold,
  intensity = 0.5,
}: {
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  intensity?: number;
}) {
  const frame = useCurrentFrame();
  const breathe = 0.9 + 0.1 * Math.sin(frame / 34);
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${rgba(color, 0.55 * intensity)} 0%, ${rgba(color, 0.12 * intensity)} 42%, transparent 68%)`,
        filter: 'blur(60px)',
        transform: `scale(${breathe})`,
        pointerEvents: 'none',
      }}
    />
  );
}

/** Corner brackets, the HUD tell that makes a card feel instrumented. */
export function Brackets({
  size = 16,
  color = T.goldLine,
  inset = -1,
  thickness = 1.5,
}: {
  size?: number;
  color?: string;
  inset?: number;
  thickness?: number;
}) {
  const corners = [
    { top: inset, left: inset, borderTop: true, borderLeft: true },
    { top: inset, right: inset, borderTop: true, borderRight: true },
    { bottom: inset, left: inset, borderBottom: true, borderLeft: true },
    { bottom: inset, right: inset, borderBottom: true, borderRight: true },
  ];
  return (
    <>
      {corners.map((corner, index) => (
        <span
          key={index}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderTop: corner.borderTop ? `${thickness}px solid ${color}` : undefined,
            borderBottom: corner.borderBottom ? `${thickness}px solid ${color}` : undefined,
            borderLeft: corner.borderLeft ? `${thickness}px solid ${color}` : undefined,
            borderRight: corner.borderRight ? `${thickness}px solid ${color}` : undefined,
            top: corner.top,
            left: corner.left,
            right: corner.right,
            bottom: corner.bottom,
            opacity: 0.85,
          }}
        />
      ))}
    </>
  );
}

export function GlowCard({
  children,
  tint = 'neutral',
  radius = 20,
  padding = '28px 30px',
  style,
  brackets = true,
}: {
  children: ReactNode;
  tint?: 'gold' | 'violet' | 'neutral';
  radius?: number;
  padding?: string;
  style?: CSSProperties;
  brackets?: boolean;
}) {
  const edge =
    tint === 'gold'
      ? rgba(T.gold, 0.24)
      : tint === 'violet'
        ? rgba(T.lilac, 0.26)
        : 'rgba(255,255,255,0.085)';

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: radius,
        padding,
        border: `1px solid ${edge}`,
        background:
          'linear-gradient(158deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.022) 44%, rgba(255,255,255,0.006) 100%)',
        boxShadow: `0 40px 90px -60px ${rgba(T.violet, 0.9)}, inset 0 1px 0 rgba(255,255,255,0.08)`,
        overflow: 'hidden',
        ...style,
      }}
    >
      {brackets ? (
        <Brackets color={tint === 'gold' ? rgba(T.gold, 0.4) : rgba(T.lilac, 0.4)} />
      ) : null}
      {children}
    </div>
  );
}

/** Word-by-word reveal with blur + 3D lift. Persian-safe (splits on spaces). */
export function Kinetic({
  text,
  start = 0,
  stagger = 4,
  size = 72,
  weight = 800,
  color = T.cream,
  align = 'right',
  lineHeight = 1.18,
  letterSpacing = '-0.03em',
  style,
}: {
  text: string;
  start?: number;
  stagger?: number;
  size?: number;
  weight?: number;
  color?: string;
  align?: 'right' | 'center' | 'left';
  lineHeight?: number;
  letterSpacing?: string;
  style?: CSSProperties;
}) {
  const words = text.split(' ');
  return (
    <div
      lang="fa"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: `0 ${size * 0.26}px`,
        justifyContent:
          align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end',
        lineHeight,
        letterSpacing,
        fontSize: size,
        fontWeight: weight,
        color,
        ...style,
      }}
    >
      {words.map((word, index) => (
        <KineticWord key={`${word}-${index}`} start={start + index * stagger} size={size}>
          {word}
        </KineticWord>
      ))}
    </div>
  );
}

function KineticWord({
  children,
  start,
  size,
}: {
  children: ReactNode;
  start: number;
  size: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - start,
    fps,
    durationInFrames: 26,
    config: { damping: 200, mass: 0.65 },
  });

  return (
    <span
      style={{
        display: 'inline-block',
        opacity: progress,
        transform: `translateY(${(1 - progress) * size * 0.42}px) rotateX(${(1 - progress) * 42}deg)`,
        filter: `blur(${(1 - progress) * 10}px)`,
        transformOrigin: '50% 100%',
        willChange: 'transform, opacity, filter',
      }}
    >
      {children}
    </span>
  );
}

/** Thin animated underline. */
export function Rule({
  start = 0,
  duration = 22,
  width = 320,
  color = T.gold,
  thickness = 1.5,
  align = 'right',
}: {
  start?: number;
  duration?: number;
  width?: number;
  color?: string;
  thickness?: number;
  align?: 'right' | 'left' | 'center';
}) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        width,
        height: thickness,
        background: `linear-gradient(90deg, ${rgba(color, 0.05)}, ${color})`,
        transform: `scaleX(${progress})`,
        transformOrigin:
          align === 'left' ? 'left center' : align === 'center' ? 'center' : 'right center',
        boxShadow: `0 0 18px ${rgba(color, 0.5)}`,
      }}
    />
  );
}

/** Small uppercase label with a breathing dot. */
export function Kicker({
  children,
  color = T.gold,
  start = 0,
}: {
  children: ReactNode;
  color?: string;
  start?: number;
}) {
  const frame = useCurrentFrame();
  const progress = useEnter(start, 22);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 9);

  return (
    <div
      lang="fa"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 11,
        fontSize: 18,
        letterSpacing: '0.12em',
        color,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 10}px)`,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 2,
          background: color,
          boxShadow: `0 0 ${6 + pulse * 14}px ${rgba(color, 0.9)}`,
          transform: 'rotate(45deg)',
        }}
      />
      {children}
    </div>
  );
}

/** Animated progress rail with a travelling highlight. */
export function Rail({
  progress,
  height = 5,
  color = T.gold,
  track = 'rgba(255,255,255,0.07)',
  glow = true,
  rtl = false,
}: {
  progress: number;
  height?: number;
  color?: string;
  track?: string;
  glow?: boolean;
  /** Fill from the right edge — correct for Persian value bars. */
  rtl?: boolean;
}) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'relative',
        height,
        borderRadius: 99,
        background: track,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
          marginLeft: rtl ? 'auto' : undefined,
          borderRadius: 99,
          background: `linear-gradient(${rtl ? '270deg' : '90deg'}, ${rgba(color, 0.55)}, ${color})`,
          boxShadow: glow ? `0 0 16px ${rgba(color, 0.65)}` : undefined,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
          backgroundSize: '40% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: `${((frame * 2.2) % 160) - 40}% 0`,
          opacity: 0.7,
        }}
      />
    </div>
  );
}
