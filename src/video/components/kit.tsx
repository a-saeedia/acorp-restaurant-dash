/**
 * Motion kit for the ACorp film.
 *
 * Everything here is frame-driven and deterministic: no CSS transitions, no
 * timers, no Math.random. A scene composes these primitives; the primitives
 * know nothing about the restaurant, only about the world (void, crystal,
 * ultraviolet, gold) and the motion grammar.
 */
import type { CSSProperties, ReactNode } from 'react';
import { useId } from 'react';
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { C, FONT, GRAD, chroma, clamp, decay, glass, ramp, shakeAt } from '../theme';

/* -------------------------------------------------------------------------- */
/* World                                                                      */
/* -------------------------------------------------------------------------- */

export function Shard({
  x,
  y,
  size,
  rotate,
  delay = 0,
  opacity = 0.5,
  drift = 18,
}: {
  x: number;
  y: number;
  size: number;
  rotate: number;
  delay?: number;
  opacity?: number;
  drift?: number;
}) {
  const frame = useCurrentFrame();
  const id = useId().replace(/[:]/g, '');
  const t = frame + delay;
  const bobY = Math.sin(t / 34) * drift;
  const bobX = Math.cos(t / 47) * drift * 0.5;
  const spin = rotate + Math.sin(t / 90) * 6;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size * 1.45,
        transform: `translate(-50%, -50%) translate(${bobX}px, ${bobY}px) rotate(${spin}deg)`,
        opacity,
        filter: 'drop-shadow(0 0 26px rgba(124,58,237,0.35))',
      }}
    >
      <svg viewBox="0 0 100 145" width="100%" height="100%">
        <defs>
          <linearGradient id={`s${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
            <stop offset="34%" stopColor="rgba(196,181,253,0.36)" />
            <stop offset="66%" stopColor="rgba(124,58,237,0.22)" />
            <stop offset="100%" stopColor="rgba(232,180,92,0.20)" />
          </linearGradient>
        </defs>
        <polygon
          points="50,2 94,42 76,138 24,138 6,42"
          fill={`url(#s${id})`}
          stroke="rgba(255,255,255,0.42)"
          strokeWidth="0.9"
        />
        <polyline
          points="50,2 46,60 24,138"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="0.7"
        />
        <polyline
          points="50,2 62,54 76,138"
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="0.6"
        />
      </svg>
    </div>
  );
}

/** Void, aurora, perspective floor, crystal debris, grain, vignette. */
export function Backdrop({
  seed = 1,
  shards = 7,
  grid = true,
  gold = 0.5,
  purple = 0.8,
}: {
  seed?: number;
  shards?: number;
  grid?: boolean;
  gold?: number;
  purple?: number;
}) {
  const frame = useCurrentFrame();
  const breath = 0.82 + Math.sin(frame / 46) * 0.08;

  return (
    <AbsoluteFill style={{ backgroundColor: C.void, overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 52% at 18% 8%, rgba(124,58,237,${0.38 * purple}) 0%, transparent 62%),
            radial-gradient(48% 44% at 88% 92%, rgba(232,180,92,${0.16 * gold}) 0%, transparent 60%),
            radial-gradient(70% 70% at 60% 45%, rgba(88,28,180,0.20) 0%, transparent 70%),
            linear-gradient(180deg, #07030f 0%, #050208 55%, #0a0614 100%)`,
          opacity: breath,
        }}
      />

      {Array.from({ length: shards }).map((_, index) => {
        const r = (n: number) => random(`back-${seed}-${index}-${n}`);
        return (
          <Shard
            key={index}
            x={6 + r(1) * 88}
            y={4 + r(2) * 92}
            size={70 + r(3) * 190}
            rotate={r(4) * 360}
            delay={r(5) * 120}
            opacity={(0.1 + r(6) * 0.22) * (index % 3 === 0 ? 1 : 0.7)}
            drift={10 + r(7) * 18}
          />
        );
      })}

      {grid ? (
        <div
          style={{
            position: 'absolute',
            left: '-25%',
            right: '-25%',
            bottom: '-6%',
            height: '58%',
            perspective: '620px',
            opacity: 0.5,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: 'rotateX(64deg)',
              transformOrigin: '50% 100%',
              backgroundImage: `linear-gradient(rgba(168,85,247,0.22) 1px, transparent 1px),
                linear-gradient(90deg, rgba(196,181,253,0.14) 1px, transparent 1px)`,
              backgroundSize: '86px 86px',
              maskImage:
                'linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0.15) 62%, transparent 92%)',
              WebkitMaskImage:
                'linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0.15) 62%, transparent 92%)',
              transformStyle: 'preserve-3d',
            }}
          />
        </div>
      ) : null}

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 90% at 50% 46%, transparent 52%, rgba(3,1,6,0.82) 100%)',
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.055) 0.7px, transparent 0.7px), radial-gradient(rgba(196,181,253,0.05) 0.7px, transparent 0.7px)',
          backgroundSize: '3px 3px, 5px 5px',
          backgroundPosition: '0 0, 1px 2px',
          opacity: 0.55,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
}

/** A shaft of light crossing the frame. */
export function Beam({
  at = 0,
  x = 50,
  angle = -18,
  width = 220,
  color = 'rgba(232,180,92,0.16)',
}: {
  at?: number;
  x?: number;
  angle?: number;
  width?: number;
  color?: string;
}) {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [at, at + 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x + sweep * 18 - 9}%`,
        top: '-20%',
        width,
        height: '140%',
        transform: `rotate(${angle}deg)`,
        background: `linear-gradient(90deg, transparent, ${color} 45%, rgba(255,255,255,0.12) 50%, ${color} 55%, transparent)`,
        filter: 'blur(18px)',
        opacity: 0.9,
        pointerEvents: 'none',
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Type                                                                       */
/* -------------------------------------------------------------------------- */

export function CrystalText({
  children,
  size = 120,
  weight = 800,
  style,
}: {
  children: ReactNode;
  size?: number;
  weight?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: '-0.035em',
        lineHeight: 1.06,
        backgroundImage: GRAD.crystal,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: 'drop-shadow(0 0 34px rgba(196,181,253,0.30))',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function GoldText({
  children,
  size = 40,
  weight = 750,
  style,
}: {
  children: ReactNode;
  size?: number;
  weight?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        backgroundImage: GRAD.gold,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: 'drop-shadow(0 0 22px rgba(232,180,92,0.28))',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** Arrival from oversize with a long decelerating tail. Never from zero. */
export function Slam({
  children,
  start = 0,
  duration = 14,
  from = 3.4,
  blur = 16,
  style,
}: {
  children: ReactNode;
  start?: number;
  duration?: number;
  from?: number;
  blur?: number;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const t = ramp(frame, start, duration, Easing.out(Easing.exp));
  const scale = interpolate(t, [0, 1], [from, 1]);
  const b = interpolate(t, [0, 1], [blur, 0]);

  return (
    <div
      style={{
        opacity: clamp(t * 1.6),
        transform: `scale(${scale})`,
        filter: b > 0.3 ? `blur(${b}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Word-by-word kinetic line. Persian stays RTL; Latin runs LTR. */
export function Kinetic({
  text,
  start = 0,
  per = 3,
  size = 64,
  weight = 700,
  color,
  gold = false,
  rtl = true,
  align = 'right',
  style,
}: {
  text: string;
  start?: number;
  per?: number;
  size?: number;
  weight?: number;
  color?: string;
  gold?: boolean;
  rtl?: boolean;
  align?: 'right' | 'left' | 'center';
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const words = text.split(' ');

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      lang={rtl ? 'fa' : undefined}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: `0 ${size * 0.24}px`,
        justifyContent:
          align === 'center' ? 'center' : align === 'left' ? 'flex-start' : 'flex-end',
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.24,
        letterSpacing: '-0.02em',
        ...style,
      }}
    >
      {words.map((word, index) => {
        const at = start + index * per;
        const t = ramp(frame, at, 12, Easing.out(Easing.exp));
        const y = interpolate(t, [0, 1], [size * 0.55, 0]);
        const b = interpolate(t, [0, 1], [14, 0]);
        return (
          <span
            key={`${word}-${index}`}
            style={{
              display: 'inline-block',
              color: gold ? undefined : (color ?? C.crystal),
              backgroundImage: gold ? GRAD.gold : undefined,
              WebkitBackgroundClip: gold ? 'text' : undefined,
              backgroundClip: gold ? 'text' : undefined,
              opacity: clamp(t * 1.35),
              transform: `translateY(${y}px)`,
              filter: b > 0.4 ? `blur(${b}px)` : undefined,
              textShadow: gold ? undefined : '0 0 30px rgba(124,58,237,0.30)',
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}

/** Tabular number that steps every frame and lands on a round value. */
export function Counter({
  value,
  start = 0,
  duration = 30,
  format,
  size = 96,
  color = C.crystal,
  weight = 800,
}: {
  value: number;
  start?: number;
  duration?: number;
  format: (n: number) => string;
  size?: number;
  color?: string;
  weight?: number;
}) {
  const frame = useCurrentFrame();
  const t = ramp(frame, start, duration, Easing.out(Easing.cubic));
  const eased = 1 - Math.pow(1 - t, 3);

  return (
    <span
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.03em',
        color,
        textShadow: '0 0 44px rgba(232,180,92,0.22)',
      }}
    >
      {format(Math.round(value * eased))}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Surfaces                                                                   */
/* -------------------------------------------------------------------------- */

export function Panel({
  children,
  style,
  glow = 0.5,
  pad = 26,
  radius = 22,
}: {
  children: ReactNode;
  style?: CSSProperties;
  glow?: number;
  pad?: number;
  radius?: number;
}) {
  return (
    <div
      style={{
        ...glass,
        borderRadius: radius,
        padding: pad,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `${glass.boxShadow}, 0 0 70px -28px rgba(124,58,237,${glow})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Chip({
  children,
  tone = 'violet',
  size = 17,
}: {
  children: ReactNode;
  tone?: 'violet' | 'gold' | 'crystal' | 'danger';
  size?: number;
}) {
  const map = {
    violet: { c: C.lilac, b: 'rgba(168,85,247,0.4)', bg: 'rgba(124,58,237,0.16)' },
    gold: { c: C.goldHi, b: 'rgba(232,180,92,0.42)', bg: 'rgba(232,180,92,0.13)' },
    crystal: { c: C.crystal, b: 'rgba(255,255,255,0.25)', bg: 'rgba(255,255,255,0.06)' },
    danger: { c: '#ffb3ba', b: 'rgba(255,111,125,0.45)', bg: 'rgba(255,111,125,0.14)' },
  }[tone];

  return (
    <span
      lang="fa"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: FONT,
        fontSize: size,
        padding: '5px 13px',
        borderRadius: 999,
        color: map.c,
        border: `1px solid ${map.b}`,
        background: map.bg,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Data graphics                                                              */
/* -------------------------------------------------------------------------- */

export function Ring({
  value,
  start = 0,
  duration = 34,
  size = 290,
  stroke = 16,
  color = 'gold',
  children,
}: {
  value: number;
  start?: number;
  duration?: number;
  size?: number;
  stroke?: number;
  color?: 'gold' | 'violet';
  children?: ReactNode;
}) {
  const frame = useCurrentFrame();
  const t = ramp(frame, start, duration, Easing.out(Easing.cubic));
  const id = useId().replace(/[:]/g, '');
  const r = (size - stroke * 2) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r * 0.75; // 270° arc
  const from = 135;

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(0deg)' }}>
        <defs>
          <linearGradient id={`r${id}`} x1="0" y1="0" x2="1" y2="1">
            {color === 'gold' ? (
              <>
                <stop offset="0%" stopColor="#fff3cf" />
                <stop offset="50%" stopColor="#e8b45c" />
                <stop offset="100%" stopColor="#a855f7" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#c4b5fd" />
                <stop offset="60%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#e8b45c" />
              </>
            )}
          </linearGradient>
        </defs>
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${2 * Math.PI * r}`}
          transform={`rotate(${from} ${cx} ${cx})`}
        />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={`url(#r${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${2 * Math.PI * r}`}
          strokeDashoffset={circumference * (1 - clamp(value * t))}
          transform={`rotate(${from} ${cx} ${cx})`}
          style={{ filter: 'drop-shadow(0 0 12px rgba(232,180,92,0.55))' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Meter({
  value,
  start = 0,
  duration = 26,
  color = C.gold,
  height = 10,
  delay = 0,
}: {
  value: number;
  start?: number;
  duration?: number;
  color?: string;
  height?: number;
  delay?: number;
}) {
  const frame = useCurrentFrame();
  const t = ramp(frame, start + delay, duration, Easing.out(Easing.cubic));

  return (
    <div
      style={{
        height,
        borderRadius: 999,
        background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: `${clamp(value * t) * 100}%`,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${color}, ${C.goldHi})`,
          boxShadow: `0 0 24px ${color}88`,
        }}
      />
    </div>
  );
}

/** Glowing line chart with a travelling head. Points are 0…1, oldest first. */
export function Spark({
  points,
  start = 0,
  duration = 40,
  width = 900,
  height = 320,
  color = C.gold,
  area = true,
}: {
  points: number[];
  start?: number;
  duration?: number;
  width?: number;
  height?: number;
  color?: string;
  area?: boolean;
}) {
  const frame = useCurrentFrame();
  const id = useId().replace(/[:]/g, '');
  const t = ramp(frame, start, duration, Easing.inOut(Easing.cubic));
  const pad = 18;
  const step = (width - pad * 2) / Math.max(1, points.length - 1);
  const xy = points.map((value, index) => {
    const x = width - pad - index * step; // RTL: newest at the left edge
    const y = pad + (1 - clamp(value)) * (height - pad * 2);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const headIndex = Math.max(0, Math.min(points.length - 1, Math.floor(t * (points.length - 1))));
  const head = points[headIndex] ?? 0;
  const headX = width - pad - headIndex * step;
  const headY = pad + (1 - clamp(head)) * (height - pad * 2);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`l${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={C.violet} />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor={C.goldHi} />
        </linearGradient>
        <linearGradient id={`a${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.42" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.2, 0.4, 0.6, 0.8].map((g) => (
        <line
          key={g}
          x1={pad}
          x2={width - pad}
          y1={pad + g * (height - pad * 2)}
          y2={pad + g * (height - pad * 2)}
          stroke="rgba(255,255,255,0.07)"
          strokeDasharray="2 8"
        />
      ))}
      {area ? (
        <polygon
          points={`${width - pad},${height - pad} ${xy.join(' ')} ${pad},${height - pad}`}
          fill={`url(#a${id})`}
          opacity={t}
        />
      ) : null}
      <polyline
        points={xy.join(' ')}
        fill="none"
        stroke={`url(#l${id})`}
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - t}
        style={{ filter: `drop-shadow(0 0 10px ${color}aa)` }}
      />
      {t > 0.02 && t < 0.995 ? (
        <>
          <circle cx={headX} cy={headY} r="16" fill={`${color}22`} />
          <circle cx={headX} cy={headY} r="5" fill={C.crystal} />
        </>
      ) : null}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Transitions and impact                                                     */
/* -------------------------------------------------------------------------- */

/** Radial speed lines; `power` drives opacity and travel. */
export function Streaks({
  power = 1,
  color = 'rgba(196,181,253,0.5)',
}: {
  power?: number;
  color?: string;
}) {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden', opacity: 0.55 * power }}>
      {Array.from({ length: 26 }).map((_, index) => {
        const r = (n: number) => random(`streak-${index}-${n}`);
        const top = r(1) * 100;
        const len = 80 + r(2) * 320;
        const speed = 18 + r(3) * 40;
        const offset = (frame * speed + r(4) * 1400) % 1600;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: `${top}%`,
              left: `${offset - 400}px`,
              width: len,
              height: 1 + r(5) * 2,
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              transform: `rotate(${-4 + r(6) * 8}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

/** One- or two-frame light hit, like a flashbulb off the crystal. */
export function Flash({
  at,
  frames = 3,
  color = 'rgba(255,248,235,0.85)',
}: {
  at: number;
  frames?: number;
  color?: string;
}) {
  const frame = useCurrentFrame();
  const k = decay(frame, at, frames, Easing.out(Easing.quad));
  if (k <= 0) return null;
  return <AbsoluteFill style={{ background: color, opacity: k * 0.75, mixBlendMode: 'screen' }} />;
}

/** Gold seam that crosses the frame just before a cut. */
export function Wipe({ at = 0, duration = 14 }: { at?: number; duration?: number }) {
  const frame = useCurrentFrame();
  const t = ramp(frame, at, duration, Easing.inOut(Easing.cubic));
  if (t <= 0 || t >= 1) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: `${-30 + t * 130}%`,
          width: 220,
          height: '140%',
          transform: 'rotate(14deg)',
          background:
            'linear-gradient(90deg, transparent, rgba(232,180,92,0.10) 30%, rgba(255,217,138,0.85) 50%, rgba(232,180,92,0.10) 70%, transparent)',
          filter: 'blur(2px)',
          boxShadow: '0 0 120px rgba(232,180,92,0.5)',
        }}
      />
    </AbsoluteFill>
  );
}

/** Deterministic sparks thrown from a point. */
export function Particles({
  at,
  count = 26,
  x = 50,
  y = 50,
  color = C.gold,
  spread = 1,
}: {
  at: number;
  count?: number;
  x?: number;
  y?: number;
  color?: string;
  spread?: number;
}) {
  const frame = useCurrentFrame();
  const t = clamp((frame - at) / 34);
  if (t <= 0 || t >= 1) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: count }).map((_, index) => {
        const r = (n: number) => random(`spark-${at}-${index}-${n}`);
        const angle = r(1) * Math.PI * 2;
        const dist = (90 + r(2) * 420) * spread * (1 - Math.pow(1 - t, 2));
        const px = x + (Math.cos(angle) * dist) / 19.2;
        const py = y + (Math.sin(angle) * dist) / 10.8 + t * 60;
        const size = 2 + r(3) * 5;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${px}%`,
              top: `${py}%`,
              width: size,
              height: size,
              borderRadius: '50%',
              background: index % 4 === 0 ? C.crystal : color,
              opacity: (1 - t) * 0.95,
              boxShadow: `0 0 12px ${color}`,
              transform: `scale(${1 - t * 0.6})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

/** Camera jolt wrapper; impact at `at`. */
export function Impact({
  at,
  amp = 16,
  duration = 20,
  children,
}: {
  at: number;
  amp?: number;
  duration?: number;
  children: ReactNode;
}) {
  const frame = useCurrentFrame();
  const s = shakeAt(frame, at, amp, duration);
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rotate}deg)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

/** Chronographic split on type for a few frames. */
export function Glitch({
  at,
  frames = 4,
  children,
}: {
  at: number;
  frames?: number;
  children: ReactNode;
}) {
  const frame = useCurrentFrame();
  const k = decay(frame, at, frames, Easing.out(Easing.quad));
  return (
    <div
      style={{
        textShadow: k > 0.05 ? chroma(k * 2.4) : undefined,
        transform:
          k > 0.05
            ? `translateX(${noiseLocal(at, frame) * 6 * k}px) skewX(${noiseLocal(at + 9, frame) * 2 * k}deg)`
            : undefined,
      }}
    >
      {children}
    </div>
  );
}

const noiseLocal = (seed: number, t: number) => random(`glitch-${seed}-${t}`) * 2 - 1;

/* -------------------------------------------------------------------------- */
/* Frame furniture                                                            */
/* -------------------------------------------------------------------------- */

export function Caption({
  text,
  start = 8,
  width = 1180,
}: {
  text: string;
  start?: number;
  width?: number;
}) {
  const frame = useCurrentFrame();
  const t = ramp(frame, start, 16, Easing.out(Easing.cubic));

  return (
    <div
      dir="rtl"
      lang="fa"
      style={{
        position: 'absolute',
        right: 118,
        bottom: 74,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        maxWidth: width,
        opacity: t,
        transform: `translateX(${(1 - t) * 26}px)`,
      }}
    >
      <div
        style={{ width: 54 * t, height: 2, background: C.gold, boxShadow: `0 0 12px ${C.gold}` }}
      />
      <div
        style={{
          fontFamily: FONT,
          fontSize: 25,
          lineHeight: 1.5,
          color: 'rgba(244,241,255,0.72)',
          letterSpacing: '-0.01em',
        }}
      >
        {text}
      </div>
    </div>
  );
}

/** Scene canvas: world + optional jolt + caption + light hits. */
export function Act({
  children,
  seed = 1,
  shards = 6,
  grid = true,
  caption,
  captionStart = 10,
  impactAt,
  impactAmp = 14,
  flashAt,
  flashFrames = 3,
  streak = 0,
}: {
  children: ReactNode;
  seed?: number;
  shards?: number;
  grid?: boolean;
  caption?: string;
  captionStart?: number;
  impactAt?: number;
  impactAmp?: number;
  flashAt?: number;
  flashFrames?: number;
  streak?: number;
}) {
  const content = (
    <>
      <Backdrop seed={seed} shards={shards} grid={grid} />
      {streak > 0 ? <Streaks power={streak} /> : null}
      {children}
      {caption ? <Caption text={caption} start={captionStart} /> : null}
      {flashAt !== undefined ? <Flash at={flashAt} frames={flashFrames} /> : null}
    </>
  );

  return (
    <AbsoluteFill>
      {impactAt !== undefined ? (
        <Impact at={impactAt} amp={impactAmp}>
          {content}
        </Impact>
      ) : (
        content
      )}
    </AbsoluteFill>
  );
}
