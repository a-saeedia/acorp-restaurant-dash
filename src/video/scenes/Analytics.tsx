import { interpolate, useCurrentFrame } from 'remotion';
import { CountUp, Reveal, useRamp } from '../components/motion';
import { Caption, Frame, Kicker, Stage } from '../components/stage';
import { faDayKeyShort, faMoney, faMoneyCompact, faNumber, faPercent } from '../../lib/fa';
import { analyticsFor } from '../../simulation/selectors';
import { SCRIPT } from '../script';
import { FILM } from '../data';

const W = 1000;
const H = 330;

function buildGeometry(values: number[]) {
  const max = Math.max(...values, 1) * 1.12;
  const step = values.length > 1 ? W / (values.length - 1) : W;
  const points = values.map((value, index) => ({
    // RTL time axis: the oldest day sits on the right, the newest on the left.
    x: W - index * step,
    y: H - (value / max) * H,
    value,
  }));
  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(' ');
  // The axis runs right→left, so the area closes from the last point back along
  // the baseline instead of assuming x=0 is the start.
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
  return { line, area, length, max };
}

export function Analytics() {
  const frame = useCurrentFrame();
  const script = SCRIPT.Analytics;
  const snapshot = analyticsFor(FILM.base, 'month');
  const { pnl, daily } = snapshot;

  // The demo day is still in service, so its totals are partial. Charting it
  // would draw a fake collapse at the end of the trend — plot completed days.
  const trend = daily.slice(0, -1);
  const values = trend.map((day) => day.netSales);
  const geometry = buildGeometry(values.length > 0 ? values : [1]);
  const draw = useRamp(26, 78);
  const areaOpacity = interpolate(frame, [60, 120], [0, 0.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const rows = [
    { label: 'فروش خالص', value: pnl.netSales, tone: '#f2eee7' },
    { label: 'بهای تمام‌شده', value: pnl.cogs, tone: 'rgba(242,238,231,0.55)' },
    { label: 'سود ناخالص', value: pnl.grossProfit, tone: '#f2eee7' },
    { label: 'هزینهٔ عملیاتی', value: pnl.operatingExpenses, tone: 'rgba(242,238,231,0.55)' },
    { label: 'بازاریابی', value: pnl.marketingSpend, tone: 'rgba(242,238,231,0.55)' },
    { label: 'سود عملیاتی خالص', value: pnl.netOperatingProfit, tone: '#f0c98c' },
  ];

  return (
    <Stage bloom="center">
      <Frame align="top">
        <div
          style={{
            marginTop: 6,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <Reveal start={0}>
              <Kicker>{script.kicker}</Kicker>
            </Reveal>
            <Reveal start={4} y={20}>
              <h1
                lang="fa"
                style={{ fontSize: 66, fontWeight: 750, margin: 0, letterSpacing: '-0.03em' }}
              >
                {script.title}
              </h1>
            </Reveal>
          </div>
          <Reveal start={14} y={12}>
            <div lang="fa" style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: 17, color: 'rgba(242,238,231,0.42)' }}>حاشیهٔ سود خالص</span>
              <CountUp
                to={pnl.netMarginPct}
                start={30}
                duration={70}
                format={(value) => faPercent(Math.round(value * 10) / 10)}
                style={{
                  fontSize: 52,
                  fontWeight: 750,
                  color: '#f0c98c',
                  fontVariantNumeric: 'tabular-nums',
                }}
              />
            </div>
          </Reveal>
        </div>

        <div style={{ display: 'flex', gap: 40, marginTop: 36, alignItems: 'flex-start' }}>
          <Reveal start={18} y={22} style={{ flex: 1 }}>
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.022)',
                borderRadius: 22,
                padding: '26px 26px 18px',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
                <span lang="fa" style={{ fontSize: 18, color: 'rgba(242,238,231,0.55)' }}>
                  فروش خالص · {faNumber(trend.length)} روز کامل
                </span>
                <span style={{ fontSize: 18, color: '#f0c98c', fontWeight: 650 }}>
                  {faMoneyCompact(pnl.netSales)}
                </span>
              </div>

              <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e3a854" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#e3a854" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {[0.25, 0.5, 0.75, 1].map((ratio) => (
                  <line
                    key={ratio}
                    x1={0}
                    x2={W}
                    y1={H - H * ratio}
                    y2={H - H * ratio}
                    stroke="rgba(255,255,255,0.055)"
                    strokeWidth={1}
                  />
                ))}

                <path d={geometry.area} fill="url(#areaFill)" opacity={areaOpacity} />
                <path
                  d={geometry.line}
                  fill="none"
                  stroke="#e3a854"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={geometry.length}
                  strokeDashoffset={geometry.length * (1 - draw)}
                />

                {trend.map((day, index) => {
                  const point = geometry.line.split(' ')[index];
                  if (!point) return null;
                  const [x, y] = point.slice(1).split(',').map(Number) as [number, number];
                  const pointOpacity = interpolate(
                    frame,
                    [40 + index * 2.4, 56 + index * 2.4],
                    [0, 1],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
                  );
                  if (index % 5 !== 0) return null;
                  return (
                    <circle
                      key={day.dayKey}
                      cx={x}
                      cy={y}
                      r={3.5}
                      fill="#12100d"
                      stroke="#e3a854"
                      strokeWidth={2}
                      opacity={pointOpacity}
                    />
                  );
                })}
              </svg>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 14,
                  fontSize: 14,
                  color: 'rgba(242,238,231,0.30)',
                }}
              >
                {trend
                  .filter((_, index) => index % 7 === 0 || index === trend.length - 1)
                  .map((day) => (
                    <span key={day.dayKey} lang="fa">
                      {faDayKeyShort(day.dayKey)}
                    </span>
                  ))}
              </div>
            </div>
          </Reveal>

          <div style={{ flex: '0 0 440px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {rows.map((row, index) => (
              <Reveal key={row.label} start={34 + index * 9} y={12}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    padding: '15px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.065)',
                  }}
                >
                  <span lang="fa" style={{ fontSize: 19, color: 'rgba(242,238,231,0.55)' }}>
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontSize: 21,
                      fontWeight: 600,
                      color: row.tone,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {faMoney(row.value)}
                  </span>
                </div>
              </Reveal>
            ))}

            <Reveal start={100} y={14}>
              <div
                lang="fa"
                style={{
                  marginTop: 22,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 18px',
                  borderRadius: 14,
                  border: '1px solid rgba(227,168,84,0.26)',
                  background: 'rgba(227,168,84,0.06)',
                }}
              >
                <span style={{ fontSize: 16, color: 'rgba(242,238,231,0.55)' }}>سفارش‌های ماه</span>
                <span style={{ fontSize: 24, fontWeight: 700 }}>
                  {faNumber(snapshot.orderCount)}
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </Frame>

      <Caption
        text={script.caption}
        opacity={interpolate(frame, [90, 110], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}
      />
    </Stage>
  );
}
