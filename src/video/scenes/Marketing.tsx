import { interpolate, useCurrentFrame } from 'remotion';
import { CountUp, Reveal } from '../components/motion';
import { Caption, Frame, Kicker, Stage } from '../components/stage';
import { faMoneyCompact, faNumber, faPercent } from '../../lib/fa';
import { marketingFor } from '../../simulation/selectors';
import { SCRIPT } from '../script';
import { FILM } from '../data';

export function Marketing() {
  const frame = useCurrentFrame();
  const script = SCRIPT.Marketing;
  const snapshot = marketingFor(FILM.base, 'month');
  const maxRevenue = Math.max(...snapshot.channels.map((channel) => channel.revenue), 1);

  return (
    <Stage bloom="left">
      <Frame align="top">
        <div style={{ marginTop: 24 }}>
          <Reveal start={0}>
            <Kicker>{script.kicker}</Kicker>
          </Reveal>
          <Reveal start={4} y={20}>
            <h1 lang="fa" style={{ fontSize: 66, fontWeight: 750, margin: 0, letterSpacing: '-0.03em' }}>
              {script.title}
            </h1>
          </Reveal>
        </div>

        <div style={{ display: 'flex', gap: 56, marginTop: 52, alignItems: 'flex-start' }}>
          <Reveal start={18} y={28} style={{ flex: '0 0 470px' }}>
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.09)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.012))',
                borderRadius: 24,
                padding: '34px 32px 30px',
              }}
            >
              <div lang="fa" style={{ fontSize: 18, color: 'rgba(242,238,231,0.45)' }}>
                بازگشت سرمایهٔ کمپین‌ها
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
                <CountUp
                  to={snapshot.attributionRoi}
                  start={28}
                  duration={60}
                  format={(value) => faNumber(Math.round(value * 10) / 10)}
                  style={{ fontSize: 128, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em', color: '#f0c98c' }}
                />
                <span style={{ fontSize: 52, color: 'rgba(240,201,140,0.55)', fontWeight: 300 }}>×</span>
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.09)', margin: '26px 0 22px' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'هزینهٔ کمپین', value: faMoneyCompact(snapshot.spend) },
                  { label: 'درآمد نسبت‌داده‌شده', value: faMoneyCompact(snapshot.revenueAttributed) },
                  { label: 'تبدیل', value: `${faNumber(snapshot.conversions)} سفارش` },
                  { label: 'مشتری تکراری', value: faPercent(Math.round(snapshot.repeatCustomerRate * 1000) / 10) },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
                    <span lang="fa" style={{ color: 'rgba(242,238,231,0.45)' }}>
                      {row.label}
                    </span>
                    <span style={{ fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 22 }}>
            {snapshot.channels.map((channel, index) => {
              const grow = interpolate(frame, [60 + index * 12, 106 + index * 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              const width = (channel.revenue / maxRevenue) * grow;
              return (
                <Reveal key={channel.channel} start={44 + index * 10} y={16}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span lang="fa" style={{ fontSize: 20 }}>
                        {channel.labelFa}
                      </span>
                      <span style={{ fontSize: 17, color: 'rgba(242,238,231,0.48)', fontVariantNumeric: 'tabular-nums' }}>
                        {faNumber(channel.conversions)} تبدیل · {faMoneyCompact(channel.revenue)}
                      </span>
                    </div>
                    <div style={{ marginTop: 10, height: 9, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        style={{
                          height: '100%',
                          borderRadius: 99,
                          width: `${Math.min(100, width * 100)}%`,
                          background:
                            index === 0
                              ? 'linear-gradient(90deg, #e3a854, #f0cf9a)'
                              : 'linear-gradient(90deg, rgba(227,168,84,0.55), rgba(227,168,84,0.22))',
                        }}
                      />
                    </div>
                  </div>
                </Reveal>
              );
            })}

            <Reveal start={140} y={14}>
              <div
                lang="fa"
                style={{
                  marginTop: 8,
                  fontSize: 17,
                  color: 'rgba(242,238,231,0.42)',
                  lineHeight: 1.8,
                }}
              >
                هر سفارش به یک کمپین، یک کانال و یک آیتم منو نسبت داده می‌شود — پس هزینهٔ بازاریابی
                از سود کم می‌شود، نه از حدس.
              </div>
            </Reveal>
          </div>
        </div>
      </Frame>

      <Caption
        text={script.caption}
        opacity={interpolate(frame, [110, 130], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
    </Stage>
  );
}
