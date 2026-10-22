/**
 * Film palette — purple / black / gold.
 *
 * Deliberately separate from the dashboard's design tokens: the dashboard keeps
 * its own graphite/amber identity, while the commercial leans into a deeper,
 * more cinematic violet-to-gold range.
 */

export const T = {
  void: '#050308',
  ink: '#08050f',
  plum: '#130a22',
  plum2: '#1c1030',

  violet: '#6d3bf5',
  lilac: '#9b6bff',
  magenta: '#b32de0',

  gold: '#e9b65b',
  goldHi: '#ffdf9e',
  goldDeep: '#b07d28',

  cream: '#f7f2e8',
  muted: 'rgba(247,242,232,0.54)',
  faint: 'rgba(247,242,232,0.3)',
  ghost: 'rgba(247,242,232,0.14)',

  line: 'rgba(247,242,232,0.085)',
  lineSoft: 'rgba(247,242,232,0.045)',
  goldLine: 'rgba(233,182,91,0.3)',
  violetLine: 'rgba(155,107,255,0.3)',
} as const;

/** #rrggbb + alpha → rgba(). Used everywhere for stateful glows. */
export function rgba(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export const goldGrad = (deg = 90) =>
  `linear-gradient(${deg}deg, ${T.goldHi} 0%, ${T.gold} 46%, ${T.goldDeep} 100%)`;

export const violetGrad = (deg = 90) =>
  `linear-gradient(${deg}deg, ${T.lilac} 0%, ${T.violet} 60%, ${rgba(T.violet, 0.35)} 100%)`;

export const glass = (tint: 'gold' | 'violet' | 'neutral' = 'neutral') => {
  const edge =
    tint === 'gold' ? rgba(T.gold, 0.22) : tint === 'violet' ? rgba(T.lilac, 0.24) : T.line;
  return {
    background:
      'linear-gradient(158deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.022) 42%, rgba(255,255,255,0.008) 100%)',
    border: `1px solid ${edge}`,
    boxShadow: `0 40px 90px -50px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.09)`,
    backdropFilter: 'blur(14px)',
  } as const;
};

export const goldText = {
  backgroundImage: `linear-gradient(178deg, ${T.cream} 0%, ${T.goldHi} 38%, ${T.gold} 72%, ${T.goldDeep} 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
} as const;
