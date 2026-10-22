import { TrendingUp } from 'lucide-react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { Caption, Frame, SceneShell, Slug, Stage } from '../components/stage';
import { Brackets, Kinetic, Kicker, Particles, Shine } from '../components/kit';
import { CountUp } from '../components/motion';
import { faDayKeyShort, faMoney, faMoneyCompact, faNumber, faPercent } from '../../lib/fa';
import { analyticsFor } from '../../simulation/selectors';
import { SCRIPT } from '../script';
import { FILM } from '../data';
import { T, rgba } from '../theme';

const W = 1080;
const H = 320;

export function Analytics() {
  const frame = useCurrentFrame();
  const script = SCRIPT.Analytics;
  const snapshot = analyticsFor(FILM.base, 'month');
  const { pnl, daily } = snapshot;

  // The demo day is still in service — charting it would draw a fake collapse.
  const trend = daily.slice(0, -1);
  const values = trend.map((day) => day.netSales);
  const max = Math.max(...values, 1) * 1.14;
  const step = values.length > 1 ? W / (values.length - 1) : W;

  const points = values.map((value, index) => ({
    x: W - index * step,
    y: H - (value / max) * H,
  }));

  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(' ');

  const firstX = points[0]?.x ?? W;
  const lastX = points[points.length - 1]?.x ?? 0;
  const area = `M${firstX.toFixed(2)},${H} ${line.replace(/^M/, 'L')} L${lastX.toFixed(2)},${H} Z`;

  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    if (!previous || !current) continue;
    length += Math.hypot(current.x - previous.x, current.y - previous.y);
  }

  const draw = interpolate(frame, [26, 128], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const tip = points[Math.min(points.length - 1, Math.floor(draw * (points.length - 1)))];
  const peakIndex = values.indexOf(Math.max(...values));
  const peak = points[peakIndex];

  const rows = [
    { label: 'فروش خالص', value: pnl.netSales },
    { label: 'بهای تمام‌شده', value: pnl.cogs },
    { label: 'سود ناخالص', value: pnl.grossProfit },
    { label: 'هزینهٔ عملیاتی', value: pnl.operatingExpenses },
    { label: 'بازاریابی', value: pnl.marketingSpend },
    { label: 'سود عملیاتی خالص', value: pnl.netOperatingProfit },
  ];

  return (
    <SceneShell id="Analytics" enter={14} exit={10}>
      <Stage tone="mixed" gridOpacity={0.22}>
        <Slug label="Analytics" index="05" />
        <Particles count={34} seed={53} color={T.gold} opacity={0.45} size={2.2} />

        <Frame align="top">
          <div
            style={{
              marginTop: 4,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <div>
              <Kicker start={0}>{script.kicker}</Kicker>
              <div style={{ marginTop: 8 }}>
                <Kinetic text={script.title} start={4} stagger={5} size={66} weight={760} />
              </div>
            </div>

            <div
              lang="fa"
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 14,
                opacity: interpolate(frame, [14, 30], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              <span style={{ fontSize: 16, color: rgba(T.cream, 0.42) }}>حاشیهٔ سود خالص</span>
              <CountUp
                to={pnl.netMarginPct}
                start={30}
                duration={80}
                format={(value) => faPercent(Math.round(value * 10) / 10)}
                style={{
                  fontSize: 48,
                  fontWeight: 780,
                  color: T.goldHi,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.03em',
                  textShadow: `0 0 34px ${rgba(T.gold, 0.5)}`,
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 30, marginTop: 34, alignItems: 'stretch' }}>
            {/* Chart */}
            <div
              style={{
                flex: 1,
                position: 'relative',
                borderRadius: 22,
                border: `1px solid ${rgba(T.cream, 0.09)}`,
                background:
                  'linear-gradient(170deg, rgba(255,255,255,0.055), rgba(255,255,255,0.008) 58%)',
                padding: '24px 26px 18px',
                overflow: 'hidden',
                boxShadow: `0 60px 120px -70px ${rgba(T.violet, 0.95)}`,
                opacity: interpolate(frame, [16, 34], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              <Brackets color={rgba(T.lilac, 0.32)} />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  fontSize: 16,
                }}
              >
                <span lang="fa" style={{ color: rgba(T.cream, 0.52) }}>
                  فروش خالص · {faNumber(trend.length)} روز کامل
                </span>
                <span style={{ color: T.goldHi, fontWeight: 650 }}>
                  {faMoneyCompact(pnl.netSales)}
                </span>
              </div>

              <svg
                width="100%"
                viewBox={`0 0 ${W} ${H}`}
                style={{ display: 'block', overflow: 'visible' }}
              >
                <defs>
                  <linearGradient id="anArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.gold} stopOpacity="0.42" />
                    <stop offset="55%" stopColor={T.violet} stopOpacity="0.16" />
                    <stop offset="100%" stopColor={T.violet} stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="anLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={T.lilac} />
                    <stop offset="55%" stopColor={T.gold} />
                    <stop offset="100%" stopColor={T.goldHi} />
                  </linearGradient>
                  <linearGradient id="anBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.gold} stopOpacity="0.5" />
                    <stop offset="100%" stopColor={T.violet} stopOpacity="0.05" />
                  </linearGradient>
                  <filter id="anGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="5" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {[0.25, 0.5, 0.75, 1].map((ratio) => (
                  <line
                    key={ratio}
                    x1={0}
                    x2={W}
                    y1={H - H * ratio}
                    y2={H - H * ratio}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={1}
                  />
                ))}

                {/* bars behind the line */}
                {values.map((value, index) => {
                  const grow = interpolate(frame, [30 + index * 2, 54 + index * 2], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  });
                  const height = (value / max) * H * grow;
                  const x = W - index * step - 9;
                  return (
                    <rect
                      key={index}
                      x={x}
                      y={H - height}
                      width={10}
                      height={height}
                      rx={3}
                      fill="url(#anBar)"
                      opacity={0.55}
                    />
                  );
                })}

                <path
                  d={area}
                  fill="url(#anArea)"
                  opacity={interpolate(frame, [60, 140], [0, 1], { extrapolateRight: 'clamp' })}
                />
                <path
                  d={line}
                  fill="none"
                  stroke="url(#anLine)"
                  strokeWidth={3.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={length}
                  strokeDashoffset={length * (1 - draw)}
                  filter="url(#anGlow)"
                />

                {peak ? (
                  <g
                    opacity={interpolate(frame, [150, 176], [0, 1], { extrapolateRight: 'clamp' })}
                  >
                    <line
                      x1={peak.x}
                      y1={peak.y}
                      x2={peak.x}
                      y2={H}
                      stroke={rgba(T.gold, 0.35)}
                      strokeDasharray="3 7"
                    />
                    <circle cx={peak.x} cy={peak.y} r={4.5} fill={T.goldHi} />
                  </g>
                ) : null}

                {tip ? (
                  <g opacity={draw > 0.02 ? 1 : 0}>
                    <circle cx={tip.x} cy={tip.y} r={16} fill={rgba(T.gold, 0.16)} />
                    <circle cx={tip.x} cy={tip.y} r={6} fill={T.goldHi} filter="url(#anGlow)" />
                  </g>
                ) : null}

                {trend.map((day, index) => {
                  if (index % 7 !== 0) return null;
                  const point = points[index];
                  if (!point) return null;
                  return (
                    <text
                      key={day.dayKey}
                      x={point.x}
                      y={H + 26}
                      fill="rgba(247,242,232,0.3)"
                      fontSize={13}
                      textAnchor="middle"
                      direction="rtl"
                    >
                      {faDayKeyShort(day.dayKey)}
                    </text>
                  );
                })}
              </svg>

              <Shine at={142} duration={26} opacity={0.22} />
            </div>

            {/* P&L column */}
            <div
              style={{
                flex: '0 0 400px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                opacity: interpolate(frame, [24, 44], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              <div
                style={{
                  borderRadius: 18,
                  border: `1px solid ${rgba(T.gold, 0.22)}`,
                  background: `linear-gradient(168deg, ${rgba(T.gold, 0.12)}, rgba(20,12,34,0.7))`,
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <TrendingUp size={18} color={T.gold} />
                <div>
                  <div lang="fa" style={{ fontSize: 13, color: rgba(T.cream, 0.45) }}>
                    سود عملیاتی خالص
                  </div>
                  <div
                    style={{
                      fontSize: 30,
                      fontWeight: 760,
                      color: T.goldHi,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {faMoney(pnl.netOperatingProfit)}
                  </div>
                </div>
              </div>

              {rows.map((row, index) => {
                const appear = interpolate(frame, [40 + index * 8, 58 + index * 8], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                const emphasize = row.label === 'سود عملیاتی خالص';
                return (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      paddingBottom: 10,
                      borderBottom: `1px solid ${rgba(T.cream, 0.06)}`,
                      opacity: appear,
                      transform: `translateX(${(1 - appear) * 26}px)`,
                    }}
                    lang="fa"
                  >
                    <span
                      style={{
                        fontSize: 16,
                        color: emphasize ? T.cream : rgba(T.cream, 0.5),
                        fontWeight: emphasize ? 650 : 400,
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontSize: emphasize ? 20 : 17,
                        fontWeight: emphasize ? 720 : 550,
                        color: emphasize ? T.goldHi : rgba(T.cream, 0.8),
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {faMoney(row.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Frame>

        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            background: `radial-gradient(ellipse at 34% 62%, ${rgba(T.gold, 0.1)} 0%, transparent 46%)`,
          }}
        />

        <Caption
          text={script.caption}
          opacity={interpolate(frame, [196, 220], [0, 1], { extrapolateRight: 'clamp' })}
        />
      </Stage>
    </SceneShell>
  );
}
