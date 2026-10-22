import { interpolate, useCurrentFrame } from 'remotion';
import { AbsoluteFill } from 'remotion';
import { Caption, Frame, SceneShell, Slug, Stage } from '../components/stage';
import { Brackets, Kinetic, Kicker, Rail, Shine } from '../components/kit';
import { faMoneyCompact, faNumber, faPercent } from '../../lib/fa';
import { analyticsFor } from '../../simulation/selectors';
import { SCRIPT } from '../script';
import { FILM } from '../data';
import { T, rgba } from '../theme';

const NAV = ['نمای کلی', 'سفارش‌ها', 'آشپزخانه', 'موجودی', 'تأمین‌کنندگان', 'تحلیل', 'بازاریابی'];

/** Cursor path: [frame, x, y] in device-local pixels. */
const CURSOR: [number, number, number][] = [
  [10, 980, 520],
  [46, 1092, 246],
  [62, 1092, 246],
  [96, 1040, 330],
  [132, 1092, 414],
  [150, 1092, 414],
  [190, 820, 470],
  [230, 640, 430],
];

function cursorAt(frame: number) {
  for (let index = 1; index < CURSOR.length; index += 1) {
    const previous = CURSOR[index - 1];
    const current = CURSOR[index];
    if (!previous || !current) continue;
    if (frame <= current[0]) {
      const [from, fromX, fromY] = previous;
      const [to, toX, toY] = current;
      const progress = interpolate(frame, [from, to], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: (t) => t * t * (3 - 2 * t),
      });
      return { x: fromX + (toX - fromX) * progress, y: fromY + (toY - fromY) * progress };
    }
  }
  const last = CURSOR[CURSOR.length - 1];
  return { x: last?.[1] ?? 0, y: last?.[2] ?? 0 };
}

export function Product() {
  const frame = useCurrentFrame();
  const script = SCRIPT.Product;
  const snapshot = analyticsFor(FILM.base, 'day');
  const { pnl } = snapshot;

  const enter = interpolate(frame, [8, 48], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const activeNav = frame < 120 ? 0 : frame < 210 ? 5 : 1;
  const click = frame > 58 && frame < 78 ? interpolate(frame, [58, 78], [1, 0]) : 0;
  const click2 = frame > 146 && frame < 166 ? interpolate(frame, [146, 166], [1, 0]) : 0;
  const cursor = cursorAt(frame);

  const metrics = [
    { label: 'فروش خالص امروز', value: faMoneyCompact(pnl.netSales) },
    { label: 'سفارش', value: faNumber(snapshot.orderCount) },
    { label: 'میانگین سفارش', value: faMoneyCompact(snapshot.averageOrderValue) },
    { label: 'حاشیهٔ سود', value: faPercent(Math.round(pnl.netMarginPct * 10) / 10) },
  ];

  const bars = [0.62, 0.78, 0.54, 0.9, 0.72, 0.83, 0.66, 0.95, 0.74, 0.88, 0.69, 0.81];

  return (
    <SceneShell id="Product" enter={16} exit={10}>
      <Stage tone="mixed" gridOpacity={0.28}>
        <Slug label="Product" index="07" />

        <Frame align="top">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: 0,
            }}
          >
            <div>
              <Kicker start={0}>{script.kicker}</Kicker>
              <div style={{ marginTop: 6 }}>
                <Kinetic text={script.title} start={4} stagger={5} size={58} weight={760} />
              </div>
            </div>
            <span
              lang="fa"
              style={{
                fontSize: 16,
                color: rgba(T.cream, 0.38),
                opacity: interpolate(frame, [12, 30], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              Persian-first · RTL · بدون وابستگی به ابر
            </span>
          </div>

          <div
            style={{
              marginTop: 26,
              perspective: '1800px',
              transformStyle: 'preserve-3d',
            }}
          >
            <div
              style={{
                opacity: enter,
                transform: `rotateX(${8 - enter * 5}deg) rotateY(${-10 + enter * 3}deg) translateY(${
                  (1 - enter) * 90
                }px) scale(${0.94 + enter * 0.06})`,
                transformStyle: 'preserve-3d',
                borderRadius: 18,
                border: `1px solid ${rgba(T.gold, 0.28)}`,
                background: 'linear-gradient(170deg, #150c24 0%, #08050f 68%)',
                overflow: 'hidden',
                boxShadow: `0 80px 160px -60px ${rgba(T.violet, 0.9)}, 0 0 0 1px rgba(255,255,255,0.04)`,
                position: 'relative',
              }}
            >
              {/* chrome */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 18px',
                  borderBottom: `1px solid ${rgba(T.cream, 0.07)}`,
                  background: 'rgba(255,255,255,0.022)',
                }}
              >
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: 99,
                      background: dot === 0 ? rgba(T.gold, 0.8) : 'rgba(255,255,255,0.14)',
                    }}
                  />
                ))}
                <div
                  style={{
                    marginInlineStart: 14,
                    flex: 1,
                    height: 24,
                    borderRadius: 7,
                    background: 'rgba(255,255,255,0.035)',
                    display: 'flex',
                    alignItems: 'center',
                    paddingInline: 12,
                    fontSize: 12,
                    color: rgba(T.cream, 0.32),
                    gap: 8,
                    direction: 'ltr',
                  }}
                >
                  <span style={{ color: T.gold }}>●</span> acorp.ir/dashboard
                </div>
                <span style={{ fontSize: 13, letterSpacing: '0.05em', fontWeight: 700 }}>
                  ACorp
                </span>
              </div>

              <div style={{ display: 'flex', height: 648, position: 'relative' }}>
                {/* sidebar (right in RTL) */}
                <div
                  style={{
                    width: 196,
                    borderInlineStart: `1px solid ${rgba(T.cream, 0.06)}`,
                    padding: '20px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 5,
                    background: 'rgba(255,255,255,0.012)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      paddingInline: 8,
                      marginBottom: 14,
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: `linear-gradient(160deg, ${T.goldHi}, ${T.gold})`,
                        display: 'grid',
                        placeItems: 'center',
                        color: '#120b1e',
                        fontWeight: 800,
                        fontSize: 14,
                      }}
                    >
                      A
                    </span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>ACorp</div>
                      <div lang="fa" style={{ fontSize: 10.5, color: rgba(T.cream, 0.32) }}>
                        شعبه ونک
                      </div>
                    </div>
                  </div>

                  {NAV.map((item, index) => (
                    <div
                      key={item}
                      lang="fa"
                      style={{
                        padding: '8px 11px',
                        borderRadius: 8,
                        fontSize: 13,
                        color: index === activeNav ? T.goldHi : rgba(T.cream, 0.42),
                        background: index === activeNav ? rgba(T.gold, 0.12) : 'transparent',
                        border: `1px solid ${
                          index === activeNav ? rgba(T.gold, 0.25) : 'transparent'
                        }`,
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                {/* content */}
                <div
                  style={{
                    flex: 1,
                    padding: '20px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    background: `radial-gradient(ellipse at 30% 0%, ${rgba(T.violet, 0.14)}, transparent 55%)`,
                  }}
                >
                  <div style={{ display: 'flex', gap: 10 }}>
                    {metrics.map((metric, index) => (
                      <div
                        key={metric.label}
                        style={{
                          flex: 1,
                          border: `1px solid ${rgba(T.cream, 0.07)}`,
                          borderRadius: 10,
                          padding: '12px 14px',
                          background: 'rgba(255,255,255,0.02)',
                          opacity: interpolate(frame, [22 + index * 6, 40 + index * 6], [0, 1], {
                            extrapolateRight: 'clamp',
                          }),
                        }}
                      >
                        <div lang="fa" style={{ fontSize: 11, color: rgba(T.cream, 0.38) }}>
                          {metric.label}
                        </div>
                        <div
                          style={{
                            fontSize: 21,
                            fontWeight: 720,
                            marginTop: 4,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {metric.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        flex: 1.6,
                        border: `1px solid ${rgba(T.cream, 0.07)}`,
                        borderRadius: 12,
                        padding: '14px 16px',
                        background: 'rgba(255,255,255,0.018)',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div
                        lang="fa"
                        style={{ fontSize: 12, color: rgba(T.cream, 0.4), marginBottom: 10 }}
                      >
                        فروش ۱۴ روز
                      </div>
                      <div
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'flex-end',
                          gap: 7,
                        }}
                      >
                        {bars.map((value, index) => {
                          const grow = interpolate(
                            frame,
                            [40 + index * 3, 70 + index * 3],
                            [0, 1],
                            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
                          );
                          return (
                            <div
                              key={index}
                              style={{
                                flex: 1,
                                height: `${value * 100 * grow}%`,
                                borderRadius: 3,
                                background: `linear-gradient(180deg, ${T.gold}, ${rgba(T.violet, 0.5)})`,
                                opacity: 0.85,
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div
                      style={{
                        flex: 1,
                        border: `1px solid ${rgba(T.cream, 0.07)}`,
                        borderRadius: 12,
                        padding: '14px 16px',
                        background: 'rgba(255,255,255,0.018)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      <div lang="fa" style={{ fontSize: 12, color: rgba(T.cream, 0.4) }}>
                        سفارش‌های زنده
                      </div>
                      {[
                        { ref: '۱۰۸۲', label: 'در حال پخت', tone: T.gold },
                        { ref: '۱۰۸۱', label: 'آماده', tone: T.goldHi },
                        { ref: '۱۰۸۰', label: 'تحویل', tone: rgba(T.cream, 0.4) },
                      ].map((row, index) => (
                        <div
                          key={row.ref}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: 12,
                            opacity: interpolate(frame, [60 + index * 8, 76 + index * 8], [0, 1], {
                              extrapolateRight: 'clamp',
                            }),
                          }}
                        >
                          <span
                            style={{
                              fontVariantNumeric: 'tabular-nums',
                              color: rgba(T.cream, 0.5),
                            }}
                          >
                            #{row.ref}
                          </span>
                          <span lang="fa" style={{ color: row.tone }}>
                            {row.label}
                          </span>
                        </div>
                      ))}
                      <div style={{ marginTop: 'auto' }}>
                        <Rail
                          progress={interpolate(frame, [80, 150], [0.1, 0.86], {
                            extrapolateRight: 'clamp',
                          })}
                          height={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* cursor */}
                <div
                  style={{
                    position: 'absolute',
                    left: cursor.x,
                    top: cursor.y,
                    width: 26,
                    height: 26,
                    pointerEvents: 'none',
                    opacity: interpolate(frame, [10, 20], [0, 1], { extrapolateRight: 'clamp' }),
                    filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))',
                  }}
                >
                  <svg width={22} height={26} viewBox="0 0 22 26">
                    <path
                      d="M2 1 L2 20 L7.6 15.2 L11.4 23.6 L15 21.8 L11.2 13.6 L18.4 13.2 Z"
                      fill={T.cream}
                      stroke="#120b1e"
                      strokeWidth={1.4}
                    />
                  </svg>
                  <span
                    style={{
                      position: 'absolute',
                      left: -14,
                      top: -14,
                      width: 54,
                      height: 54,
                      borderRadius: '50%',
                      border: `1.5px solid ${rgba(T.gold, 0.7)}`,
                      transform: `scale(${1 + (1 - click) * 0.6})`,
                      opacity: click * 0.8,
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      left: -14,
                      top: -14,
                      width: 54,
                      height: 54,
                      borderRadius: '50%',
                      border: `1.5px solid ${rgba(T.lilac, 0.7)}`,
                      transform: `scale(${1 + (1 - click2) * 0.6})`,
                      opacity: click2 * 0.8,
                    }}
                  />
                </div>

                <Shine at={214} duration={30} opacity={0.16} angle={14} />
                <Brackets size={20} color={rgba(T.gold, 0.34)} inset={8} />
              </div>
            </div>
          </div>
        </Frame>

        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            background: `radial-gradient(ellipse at 50% 78%, ${rgba(T.violet, 0.22)} 0%, transparent 52%)`,
          }}
        />

        <Caption
          text={script.caption}
          opacity={interpolate(frame, [164, 188], [0, 1], { extrapolateRight: 'clamp' })}
        />
      </Stage>
    </SceneShell>
  );
}
