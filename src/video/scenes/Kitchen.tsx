import { Flame, TimerReset } from 'lucide-react';
import { interpolate, useCurrentFrame } from 'remotion';
import { Reveal } from '../components/motion';
import { Caption, Frame, Kicker, Stage } from '../components/stage';
import { faClockDuration, faNumber } from '../../lib/fa';
import { SCRIPT } from '../script';

const TICKETS = [
  { ref: '۱۰۸۲', table: 'میز ۷', item: 'ACorp Classic + پنیر', seconds: 134, accent: '#e3a854' },
  { ref: '۱۰۸۱', table: 'بیرون‌بر', item: 'دوبل چدار', seconds: 340, accent: '#d96b33' },
  { ref: '۱۰۷۹', table: 'میز ۳', item: 'چف‌برگر', seconds: 512, accent: '#8fb98c' },
];

export function Kitchen() {
  const frame = useCurrentFrame();
  const script = SCRIPT.Kitchen;

  return (
    <Stage bloom="left">
      <Frame align="top">
        <div style={{ marginTop: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <Reveal start={0}>
              <Kicker>{script.kicker}</Kicker>
            </Reveal>
            <Reveal start={5} y={20}>
              <h1 lang="fa" style={{ fontSize: 68, fontWeight: 750, margin: 0, letterSpacing: '-0.03em' }}>
                {script.title}
              </h1>
            </Reveal>
          </div>
          <Reveal start={12} y={10}>
            <div style={{ display: 'flex', gap: 26, fontSize: 18, color: 'rgba(242,238,231,0.45)' }}>
              <span lang="fa">۳ تیکت فعال</span>
              <span style={{ color: 'rgba(242,238,231,0.22)' }}>|</span>
              <span lang="fa">میانگین آماده‌سازی ۱۴ دقیقه</span>
            </div>
          </Reveal>
        </div>

        <div style={{ display: 'flex', gap: 24, marginTop: 54 }}>
          {TICKETS.map((ticket, index) => {
            const start = 22 + index * 12;
            const readyAt = 168 + index * 10;
            const isReady = frame >= readyAt;
            const seconds = ticket.seconds + Math.round(interpolate(frame, [0, 300], [0, 46], { extrapolateRight: 'clamp' }));
            const pulse = isReady
              ? interpolate(frame, [readyAt, readyAt + 6, readyAt + 22], [0, 1, 0.35], { extrapolateRight: 'clamp' })
              : 0;

            return (
              <Reveal key={ticket.ref} start={start} y={34} style={{ flex: 1 }}>
                <div
                  style={{
                    borderRadius: 20,
                    border: `1px solid ${isReady ? 'rgba(143,185,140,0.55)' : 'rgba(255,255,255,0.09)'}`,
                    background: isReady
                      ? 'linear-gradient(180deg, rgba(143,185,140,0.13), rgba(143,185,140,0.03))'
                      : 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))',
                    padding: '26px 26px 22px',
                    boxShadow: isReady ? `0 0 ${40 + pulse * 40}px rgba(143,185,140,0.18)` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 15,
                        color: isReady ? '#b6d8b2' : 'rgba(242,238,231,0.42)',
                      }}
                    >
                      {isReady ? <TimerReset size={15} /> : <Flame size={15} />}
                      <span lang="fa">{isReady ? 'آمادهٔ تحویل' : 'در حال پخت'}</span>
                    </span>
                    <span style={{ fontSize: 15, color: 'rgba(242,238,231,0.35)', fontVariantNumeric: 'tabular-nums' }}>
                      #{ticket.ref}
                    </span>
                  </div>

                  <div lang="fa" style={{ fontSize: 27, fontWeight: 700, marginTop: 20 }}>
                    {ticket.item}
                  </div>
                  <div lang="fa" style={{ fontSize: 17, color: 'rgba(242,238,231,0.42)', marginTop: 6 }}>
                    {ticket.table} · اولویت {faNumber(index + 1)}
                  </div>

                  <div
                    style={{
                      marginTop: 28,
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 40,
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        color: isReady ? '#b6d8b2' : '#f2eee7',
                      }}
                    >
                      {faClockDuration(seconds * 1000)}
                    </span>
                    <span style={{ width: 46, height: 2, background: isReady ? '#8fb98c' : ticket.accent, opacity: 0.6 }} />
                  </div>

                  <div style={{ marginTop: 18, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.07)' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 99,
                        width: `${Math.min(100, (seconds / 620) * 100)}%`,
                        background: isReady ? '#8fb98c' : ticket.accent,
                        opacity: 0.85,
                      }}
                    />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal start={200} y={18} style={{ marginTop: 44 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 22px',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(242,238,231,0.62)',
              fontSize: 19,
            }}
            lang="fa"
          >
            <span style={{ width: 8, height: 8, borderRadius: 99, background: '#8fb98c' }} />
            تیکت آماده، خودکار به صندوق اطلاع می‌دهد — بدون تلفن، بدون فریاد.
          </div>
        </Reveal>
      </Frame>

      <Caption
        text={script.caption}
        opacity={interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
    </Stage>
  );
}
