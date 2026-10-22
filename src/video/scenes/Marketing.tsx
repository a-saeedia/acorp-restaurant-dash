import { Coins, Target, TrendingUp } from 'lucide-react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Caption, Frame, SceneShell, Slug, Stage } from '../components/stage';
import { Brackets, Kinetic, Kicker, Orbits, Particles, Rail, Shine } from '../components/kit';
import { faMoneyCompact, faNumber, faPercent } from '../../lib/fa';
import { marketingFor } from '../../simulation/selectors';
import { SCRIPT } from '../script';
import { FILM } from '../data';
import { T, rgba } from '../theme';

export function Marketing() {
  const frame = useCurrentFrame();
  const script = SCRIPT.Marketing;
  const snapshot = marketingFor(FILM.base, 'month');
  const maxRevenue = Math.max(...snapshot.channels.map((channel) => channel.revenue), 1);
  const roi = interpolate(frame, [34, 110], [0, snapshot.attributionRoi], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const ringFill = interpolate(frame, [34, 120], [0, 0.82], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });

  return (
    <SceneShell id="Marketing" enter={14} exit={10}>
      <Stage tone="violet" gridOpacity={0.24}>
        <Slug label="Marketing" index="06" />
        <Particles count={38} seed={67} color={T.gold} opacity={0.5} size={2.4} rise={0.5} />

        <div style={{ position: 'absolute', inset: 0, opacity: 0.34 }}>
          <Orbits cx={27} cy={54} rings={4} base={300} speed={-0.25} opacity={0.5} />
        </div>

        <Frame align="top">
          <div style={{ marginTop: 28 }}>
            <Kicker start={0}>{script.kicker}</Kicker>
            <div style={{ marginTop: 8, maxWidth: 1200 }}>
              <Kinetic text={script.title} start={4} stagger={4} size={64} weight={760} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 34, marginTop: 44, alignItems: 'stretch' }}>
            {/* ROI card */}
            <div
              style={{
                flex: '0 0 540px',
                position: 'relative',
                borderRadius: 24,
                border: `1px solid ${rgba(T.gold, 0.3)}`,
                background: `linear-gradient(160deg, ${rgba(T.gold, 0.15)} 0%, rgba(20,12,34,0.86) 58%)`,
                padding: '30px 32px 28px',
                overflow: 'hidden',
                boxShadow: `0 60px 120px -60px ${rgba(T.gold, 0.45)}`,
                opacity: interpolate(frame, [16, 36], [0, 1], { extrapolateRight: 'clamp' }),
                transform: `translateY(${interpolate(frame, [16, 40], [34, 0], {
                  extrapolateRight: 'clamp',
                  easing: (t) => 1 - Math.pow(1 - t, 3),
                })}px)`,
              }}
            >
              <Brackets color={rgba(T.gold, 0.5)} />
              <Shine at={104} duration={28} opacity={0.32} />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span lang="fa" style={{ fontSize: 17, color: rgba(T.cream, 0.55) }}>
                  بازگشت سرمایهٔ کمپین‌ها
                </span>
                <Coins size={18} color={T.gold} />
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginTop: 6 }}>
                <span
                  style={{
                    fontSize: 156,
                    fontWeight: 800,
                    lineHeight: 1,
                    letterSpacing: '-0.055em',
                    color: T.cream,
                    fontVariantNumeric: 'tabular-nums',
                    textShadow: `0 0 70px ${rgba(T.gold, 0.45)}`,
                  }}
                >
                  {faNumber(Math.round(roi * 10) / 10)}
                </span>
                <span
                  style={{
                    fontSize: 58,
                    color: rgba(T.goldHi, 0.72),
                    fontWeight: 300,
                    lineHeight: 1,
                  }}
                >
                  ×
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
                <div style={{ width: 150 }}>
                  <Rail progress={ringFill} height={4} rtl />
                </div>
                <span lang="fa" style={{ fontSize: 14, color: rgba(T.cream, 0.4) }}>
                  هر ۱ تومان هزینه، {faNumber(Math.round(roi * 10) / 10)} تومان برگشت
                </span>
              </div>

              <div
                style={{
                  height: 1,
                  background: `linear-gradient(90deg, ${rgba(T.gold, 0.35)}, transparent)`,
                  margin: '22px 0 18px',
                }}
              />

              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}
              >
                <div>
                  <div lang="fa" style={{ fontSize: 13, color: rgba(T.cream, 0.4) }}>
                    هزینهٔ کمپین
                  </div>
                  <div
                    style={{ fontSize: 24, fontWeight: 650, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {faMoneyCompact(snapshot.spend)}
                  </div>
                </div>
                <div>
                  <div lang="fa" style={{ fontSize: 13, color: rgba(T.cream, 0.4) }}>
                    درآمد نسبت‌داده‌شده
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 650,
                      color: T.goldHi,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {faMoneyCompact(snapshot.revenueAttributed)}
                  </div>
                </div>
                <div>
                  <div lang="fa" style={{ fontSize: 13, color: rgba(T.cream, 0.4) }}>
                    مشتری تکراری
                  </div>
                  <div
                    style={{ fontSize: 24, fontWeight: 650, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {faPercent(Math.round(snapshot.repeatCustomerRate * 10) / 10)}
                  </div>
                </div>
              </div>
            </div>

            {/* Channels */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 16,
                  color: rgba(T.cream, 0.5),
                }}
                lang="fa"
              >
                <Target size={16} color={T.lilac} />
                درآمد به تفکیک کانال
                <span style={{ flex: 1, height: 1, background: rgba(T.cream, 0.07) }} />
                <span style={{ color: T.goldHi, fontVariantNumeric: 'tabular-nums' }}>
                  {faNumber(snapshot.conversions)} تبدیل
                </span>
              </div>

              {snapshot.channels.map((channel, index) => {
                const grow = interpolate(frame, [58 + index * 12, 110 + index * 12], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                  easing: (t) => 1 - Math.pow(1 - t, 3),
                });
                const width = (channel.revenue / maxRevenue) * grow;
                const highlight = index === 0;

                return (
                  <div
                    key={channel.channel}
                    style={{
                      opacity: interpolate(frame, [46 + index * 10, 66 + index * 10], [0, 1], {
                        extrapolateRight: 'clamp',
                      }),
                      transform: `translateX(${interpolate(
                        frame,
                        [46 + index * 10, 72 + index * 10],
                        [36, 0],
                        {
                          extrapolateRight: 'clamp',
                        },
                      )}px)`,
                      borderRadius: 16,
                      border: `1px solid ${highlight ? rgba(T.gold, 0.28) : rgba(T.cream, 0.08)}`,
                      background: highlight
                        ? `linear-gradient(90deg, ${rgba(T.gold, 0.1)}, rgba(255,255,255,0.015))`
                        : 'rgba(255,255,255,0.018)',
                      padding: '18px 22px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: 12,
                      }}
                    >
                      <span lang="fa" style={{ fontSize: 20, fontWeight: highlight ? 650 : 500 }}>
                        {channel.labelFa}
                      </span>
                      <span
                        style={{
                          fontSize: 16,
                          color: rgba(T.cream, 0.5),
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {faNumber(channel.conversions)} تبدیل · {faMoneyCompact(channel.revenue)}
                      </span>
                    </div>
                    <Rail progress={width} height={8} color={highlight ? T.goldHi : T.gold} rtl />
                  </div>
                );
              })}

              <div
                lang="fa"
                style={{
                  marginTop: 4,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: rgba(T.cream, 0.42),
                  opacity: interpolate(frame, [148, 170], [0, 1], { extrapolateRight: 'clamp' }),
                }}
              >
                <TrendingUp size={17} color={T.gold} style={{ marginTop: 5, flex: 'none' }} />
                هر سفارش به یک کمپین، یک کانال و یک آیتم منو نسبت داده می‌شود — پس هزینهٔ بازاریابی
                از سود کم می‌شود، نه از حدس.
              </div>
            </div>
          </div>
        </Frame>

        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            background: `radial-gradient(circle at 24% 52%, ${rgba(T.gold, 0.12)} 0%, transparent 42%)`,
          }}
        />

        <Caption
          text={script.caption}
          opacity={interpolate(frame, [118, 140], [0, 1], { extrapolateRight: 'clamp' })}
        />
      </Stage>
    </SceneShell>
  );
}
