import { interpolate, useCurrentFrame } from 'remotion';
import { Reveal } from '../components/motion';
import { Caption, Frame, Kicker, Stage } from '../components/stage';
import { faMoneyCompact, faNumber, faPercent } from '../../lib/fa';
import { analyticsFor } from '../../simulation/selectors';
import { SCRIPT } from '../script';
import { FILM } from '../data';

const NAV = ['نمای کلی', 'سفارش‌ها', 'آشپزخانه', 'موجودی', 'تأمین‌کنندگان', 'تحلیل', 'بازاریابی'];

export function Product() {
  const frame = useCurrentFrame();
  const script = SCRIPT.Product;
  const snapshot = analyticsFor(FILM.base, 'day');
  const { pnl } = snapshot;

  const enter = interpolate(frame, [12, 52], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });

  const metrics = [
    { label: 'فروش خالص امروز', value: faMoneyCompact(pnl.netSales) },
    { label: 'سفارش', value: faNumber(snapshot.orderCount) },
    { label: 'میانگین سفارش', value: faMoneyCompact(snapshot.averageOrderValue) },
    { label: 'حاشیهٔ سود', value: faPercent(Math.round(pnl.netMarginPct * 10) / 10) },
  ];

  const bars = [0.62, 0.78, 0.54, 0.9, 0.72, 0.83, 0.66, 0.95, 0.74, 0.88, 0.69, 0.81];

  return (
    <Stage bloom="center">
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
            <Reveal start={0}>
              <Kicker>{script.kicker}</Kicker>
            </Reveal>
            <Reveal start={4} y={18}>
              <h1
                lang="fa"
                style={{ fontSize: 58, fontWeight: 750, margin: 0, letterSpacing: '-0.03em' }}
              >
                {script.title}
              </h1>
            </Reveal>
          </div>
          <Reveal start={14}>
            <span lang="fa" style={{ fontSize: 17, color: 'rgba(242,238,231,0.38)' }}>
              Persian-first · RTL · بدون وابستگی به ابر
            </span>
          </Reveal>
        </div>

        <div
          style={{
            marginTop: 30,
            opacity: enter,
            transform: `translateY(${(1 - enter) * 46}px) scale(${0.97 + enter * 0.03})`,
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.10)',
            background: '#0d0e11',
            overflow: 'hidden',
            boxShadow: '0 50px 120px rgba(0,0,0,0.55)',
          }}
        >
          {/* window chrome */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.025)',
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: 99, background: '#3a3d44' }} />
            <span style={{ width: 10, height: 10, borderRadius: 99, background: '#3a3d44' }} />
            <span style={{ width: 10, height: 10, borderRadius: 99, background: '#3a3d44' }} />
            <div
              style={{
                marginInlineStart: 16,
                flex: 1,
                height: 26,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.04)',
                display: 'flex',
                alignItems: 'center',
                paddingInline: 12,
                fontSize: 13,
                color: 'rgba(242,238,231,0.35)',
                gap: 8,
              }}
            >
              <span style={{ color: '#8fb98c' }}>●</span> acorp.ir/dashboard
            </div>
            <span style={{ fontSize: 15, letterSpacing: '0.04em', fontWeight: 700 }}>ACorp</span>
          </div>

          <div style={{ display: 'flex', height: 648 }}>
            {/* sidebar (right in RTL) */}
            <div
              style={{
                width: 208,
                borderInlineStart: '1px solid rgba(255,255,255,0.07)',
                padding: '22px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                background: 'rgba(255,255,255,0.014)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  paddingInline: 8,
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    background: '#e3a854',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#141210',
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                >
                  A
                </span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>ACorp</span>
                  <span lang="fa" style={{ fontSize: 11, color: 'rgba(242,238,231,0.34)' }}>
                    شعبه ونک
                  </span>
                </div>
              </div>

              {NAV.map((item, index) => (
                <div
                  key={item}
                  lang="fa"
                  style={{
                    padding: '9px 12px',
                    borderRadius: 9,
                    fontSize: 14,
                    color: index === 0 ? '#f0c98c' : 'rgba(242,238,231,0.45)',
                    background: index === 0 ? 'rgba(227,168,84,0.10)' : 'transparent',
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
                padding: '24px 26px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', gap: 12 }}>
                {metrics.map((metric, index) => (
                  <div
                    key={metric.label}
                    style={{
                      flex: 1,
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 12,
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.02)',
                      opacity: interpolate(frame, [40 + index * 6, 56 + index * 6], [0, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                      }),
                    }}
                  >
                    <div lang="fa" style={{ fontSize: 12, color: 'rgba(242,238,231,0.38)' }}>
                      {metric.label}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 14, flex: 1 }}>
                <div
                  style={{
                    flex: 1.6,
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 14,
                    padding: '16px 18px',
                    background: 'rgba(255,255,255,0.018)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span lang="fa" style={{ color: 'rgba(242,238,231,0.45)' }}>
                      فروش خالص · ۱۲ روز
                    </span>
                    <span style={{ color: '#f0c98c' }}>{faMoneyCompact(pnl.netSales)}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: 8,
                      height: 190,
                      marginTop: 22,
                    }}
                  >
                    {bars.map((bar, index) => {
                      const grow = interpolate(frame, [54 + index * 3, 84 + index * 3], [0, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                      });
                      return (
                        <div
                          key={`${bar}-${index}`}
                          style={{
                            flex: 1,
                            height: `${bar * grow * 100}%`,
                            borderRadius: '5px 5px 2px 2px',
                            background:
                              index === bars.length - 2
                                ? 'linear-gradient(180deg, #f0c98c, #c98f3f)'
                                : 'linear-gradient(180deg, rgba(227,168,84,0.6), rgba(227,168,84,0.14))',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 14,
                    padding: '16px 18px',
                    background: 'rgba(255,255,255,0.018)',
                  }}
                >
                  <div lang="fa" style={{ fontSize: 13, color: 'rgba(242,238,231,0.45)' }}>
                    پرفروش‌های امروز
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 16 }}>
                    {snapshot.topItems.slice(0, 5).map((item, index) => (
                      <div
                        key={item.menuItemId}
                        style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}
                      >
                        <span lang="fa" style={{ color: 'rgba(242,238,231,0.72)' }}>
                          {faNumber(index + 1)}. {item.nameFa}
                        </span>
                        <span style={{ color: 'rgba(242,238,231,0.42)' }}>
                          {faNumber(item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Frame>

      <Caption
        text={script.caption}
        opacity={interpolate(frame, [60, 80], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}
      />
    </Stage>
  );
}
