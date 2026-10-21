import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '../lib/cn';
import { faDelta } from '../lib/fa';
import { PersianText } from './primitives';

/* -------------------------------------------------------------------------- */
/* Sparkline                                                                 */
/* -------------------------------------------------------------------------- */

export interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  /** 0…1 reveal used by the video. */
  progress?: number;
}

export function Sparkline({
  values,
  width = 84,
  height = 26,
  color = '#e3a854',
  fill = true,
  progress = 1,
}: SparklineProps) {
  if (values.length < 2) return <svg className="spark" width={width} height={height} />;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values.map((value, index) => {
    const x = index * stepX;
    const y = height - 2 - ((value - min) / span) * (height - 4);
    return [x, y] as const;
  });

  const visible = Math.max(1, Math.ceil(points.length * Math.min(1, Math.max(0, progress))));
  const drawn = points.slice(0, visible);
  const path = drawn.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const area = `${path} L${(drawn[drawn.length - 1]?.[0] ?? 0).toFixed(2)},${height} L0,${height} Z`;
  const last = drawn[drawn.length - 1];

  return (
    <svg className="spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      {fill ? <path d={area} fill={color} opacity={0.1} /> : null}
      <path d={path} fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      {last ? <circle cx={last[0]} cy={last[1]} r={1.8} fill={color} /> : null}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* MetricCard                                                                */
/* -------------------------------------------------------------------------- */

export interface MetricCardProps {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  /** Percentage change; `null` hides the delta row. */
  delta?: number | null;
  deltaCaption?: ReactNode;
  caption?: ReactNode;
  icon?: ReactNode;
  spark?: number[];
  sparkColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function MetricCard({
  label,
  value,
  unit,
  delta = null,
  deltaCaption,
  caption,
  icon,
  spark,
  sparkColor = '#e3a854',
  className,
  style,
}: MetricCardProps) {
  const direction = delta === null ? 'flat' : delta > 0.05 ? 'up' : delta < -0.05 ? 'down' : 'flat';
  const DeltaIcon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus;

  return (
    <article className={cn('metric', className)} style={style}>
      <div className="metric__top">
        <span className="metric__label">{label}</span>
        {icon ? <span className="metric__icon">{icon}</span> : null}
      </div>
      <div className="metric__value">
        {value}
        {unit ? <span className="metric__unit">{unit}</span> : null}
      </div>
      <div className="metric__bottom">
        {delta === null ? (
          <span className="metric__caption">{caption}</span>
        ) : (
          <span className="row" style={{ gap: 8 }}>
            <span className={cn('metric__delta', `metric__delta--${direction}`)}>
              <DeltaIcon size={13} strokeWidth={2.2} />
              <span>{faDelta(delta)}</span>
            </span>
            <PersianText className="metric__caption" size={11} tone="dim">
              {deltaCaption ?? 'نسبت به دوره قبل'}
            </PersianText>
          </span>
        )}
        {spark ? <Sparkline values={spark} width={84} height={26} color={sparkColor} /> : null}
      </div>
    </article>
  );
}
