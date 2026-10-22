import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';

/**
 * Shared stage treatment for every scene: graphite void, a faint technical
 * grid, two warm light blooms and a vignette. Keeping it in one component is
 * what makes nine scenes feel like one film.
 */
export function Stage({
  children,
  bloom = 'right',
  dim = 1,
}: {
  children: ReactNode;
  bloom?: 'right' | 'left' | 'center';
  dim?: number;
}) {
  const bloomPosition: CSSProperties =
    bloom === 'left'
      ? { left: '-18%', top: '-10%' }
      : bloom === 'center'
        ? { left: '30%', top: '-24%' }
        : { right: '-14%', top: '-16%' };

  return (
    <AbsoluteFill style={{ backgroundColor: '#08090b', overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(circle at 50% 45%, black 10%, transparent 78%)',
          opacity: 0.7 * dim,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 1100,
          height: 1100,
          borderRadius: '50%',
          filter: 'blur(140px)',
          opacity: 0.5 * dim,
          background:
            'radial-gradient(circle, rgba(227,168,84,0.30) 0%, rgba(227,168,84,0.06) 45%, transparent 70%)',
          ...bloomPosition,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '-12%',
          bottom: '-28%',
          width: 900,
          height: 900,
          borderRadius: '50%',
          filter: 'blur(160px)',
          opacity: 0.32 * dim,
          background:
            'radial-gradient(circle, rgba(217,107,51,0.24) 0%, rgba(217,107,51,0.04) 50%, transparent 72%)',
        }}
      />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(0,0,0,0.62) 100%)',
        }}
      />
      {children}
    </AbsoluteFill>
  );
}

/** Safe-area wrapper: 96px gutters, content vertically centred. */
export function Frame({
  children,
  align = 'center',
}: {
  children: ReactNode;
  align?: 'center' | 'top';
}) {
  return (
    <AbsoluteFill
      style={{
        padding: '88px 96px 104px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        gap: 0,
        color: '#f2eee7',
        direction: 'rtl',
        fontFamily: 'Vazirmatn, system-ui, sans-serif',
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

/** Bottom-third caption used as the film's narration line. */
export function Caption({ text, opacity = 1 }: { text: string; opacity?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        insetInline: 96,
        bottom: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        opacity,
      }}
    >
      <span
        style={{
          width: 42,
          height: 2,
          background: 'linear-gradient(90deg, #e3a854, rgba(227,168,84,0))',
          flex: 'none',
        }}
      />
      <span
        lang="fa"
        style={{
          fontSize: 27,
          lineHeight: 1.55,
          color: 'rgba(242,238,231,0.78)',
          letterSpacing: '-0.01em',
        }}
      >
        {text}
      </span>
    </div>
  );
}

/** Small monospace-ish eyebrow above a headline. */
export function Kicker({ children, color = '#e3a854' }: { children: ReactNode; color?: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 19,
        letterSpacing: '0.16em',
        color,
        textTransform: 'uppercase',
        marginBottom: 18,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: 2, background: color }} />
      {children}
    </div>
  );
}
