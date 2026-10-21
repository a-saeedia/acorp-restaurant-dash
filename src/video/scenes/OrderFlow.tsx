import { Check } from 'lucide-react';
import { interpolate, useCurrentFrame } from 'remotion';
import { Reveal } from '../components/motion';
import { Caption, Frame, Kicker, Stage } from '../components/stage';
import { faMoney, faNumber } from '../../lib/fa';
import { SCRIPT } from '../script';
import { FILM } from '../data';

const STEP_START = 40;
const STEP_GAP = 27;

export function OrderFlow() {
  const frame = useCurrentFrame();
  const script = SCRIPT.OrderFlow;
  const { sample, events } = FILM;

  const visible = events.filter((_, index) => frame >= STEP_START + index * STEP_GAP).length;
  const current = events[Math.max(0, visible - 1)];

  return (
    <Stage bloom="right">
      <Frame align="top">
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <Reveal start={0}>
              <Kicker>{script.kicker}</Kicker>
            </Reveal>
            <Reveal start={4} y={22}>
              <h1
                lang="fa"
                style={{ fontSize: 66, fontWeight: 750, margin: 0, letterSpacing: '-0.03em' }}
              >
                {script.title}
              </h1>
            </Reveal>
          </div>
          <Reveal start={10} y={14}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                border: '1px solid rgba(227,168,84,0.28)',
                background: 'rgba(227,168,84,0.07)',
                color: '#f0c98c',
                borderRadius: 999,
                padding: '12px 22px',
                fontSize: 21,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 99, background: '#e3a854' }} />
              <span lang="fa">{current?.titleFa ?? 'در انتظار ثبت'}</span>
            </div>
          </Reveal>
        </div>

        <div style={{ display: 'flex', gap: 44, marginTop: 48, alignItems: 'flex-start' }}>
          {/* Receipt */}
          <Reveal start={18} y={26} style={{ flex: '0 0 470px' }}>
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.10)',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))',
                borderRadius: 22,
                padding: '30px 30px 26px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 17,
                  color: 'rgba(242,238,231,0.42)',
                }}
              >
                <span>سفارش</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>#{sample.reference}</span>
              </div>

              <div style={{ marginTop: 22, fontSize: 30, fontWeight: 700 }} lang="fa">
                {sample.customerNameFa}
              </div>
              <div
                style={{ marginTop: 6, fontSize: 18, color: 'rgba(242,238,231,0.45)' }}
                lang="fa"
              >
                {sample.tableFa} · QR
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.10)', margin: '24px 0' }} />

              {sample.items.map((item) => (
                <div
                  key={item.id}
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}
                  lang="fa"
                >
                  <span style={{ fontSize: 21 }}>
                    {faNumber(item.quantity)} × {item.nameFa}
                  </span>
                  <span
                    style={{
                      fontSize: 21,
                      color: 'rgba(242,238,231,0.72)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {faMoney(item.lineSubtotal)}
                  </span>
                </div>
              ))}

              <div style={{ height: 1, background: 'rgba(255,255,255,0.10)', margin: '22px 0' }} />

              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
              >
                <span style={{ fontSize: 19, color: 'rgba(242,238,231,0.45)' }}>مبلغ کل</span>
                <span style={{ fontSize: 34, fontWeight: 750, color: '#f0c98c' }}>
                  {faMoney(sample.total)}
                </span>
              </div>

              <div
                style={{
                  marginTop: 24,
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                {sample.items.flatMap((item) =>
                  item.customizationLabelsFa.map((label) => (
                    <span
                      key={`${item.id}:${label}`}
                      lang="fa"
                      style={{
                        fontSize: 15,
                        padding: '6px 12px',
                        borderRadius: 999,
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(242,238,231,0.62)',
                      }}
                    >
                      {label}
                    </span>
                  )),
                )}
              </div>
            </div>
          </Reveal>

          {/* Event rail */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {events.map((event, index) => {
              const at = STEP_START + index * STEP_GAP;
              const revealed = frame >= at;
              if (!revealed) return null;
              const isLast = index === events.length - 1 || frame < at + STEP_GAP;
              return (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '9px 18px',
                    borderRadius: 12,
                    border: `1px solid ${
                      isLast
                        ? 'rgba(227,168,84,0.42)'
                        : revealed
                          ? 'rgba(255,255,255,0.09)'
                          : 'rgba(255,255,255,0.04)'
                    }`,
                    background: isLast
                      ? 'rgba(227,168,84,0.09)'
                      : revealed
                        ? 'rgba(255,255,255,0.028)'
                        : 'transparent',
                    opacity: interpolate(frame, [at - 8, at + 10], [0, 1], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    }),
                    transform: `translateX(${interpolate(frame, [at - 8, at + 10], [18, 0], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    })}px)`,
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      display: 'grid',
                      placeItems: 'center',
                      flex: 'none',
                      background: revealed ? 'rgba(227,168,84,0.16)' : 'rgba(255,255,255,0.05)',
                      color: revealed ? '#f0c98c' : 'rgba(242,238,231,0.28)',
                    }}
                  >
                    {revealed ? (
                      <Check size={15} strokeWidth={2.6} />
                    ) : (
                      <span style={{ fontSize: 13 }}>{faNumber(index + 1)}</span>
                    )}
                  </span>
                  <span
                    lang="fa"
                    style={{
                      fontSize: 18,
                      color: revealed ? 'rgba(242,238,231,0.9)' : 'rgba(242,238,231,0.3)',
                      flex: 1,
                    }}
                  >
                    {event.titleFa}
                  </span>
                  <span
                    style={{
                      fontSize: 15,
                      color: 'rgba(242,238,231,0.30)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {faNumber(index + 1)}/{faNumber(events.length)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Frame>

      <Caption
        text={script.caption}
        opacity={interpolate(frame, [STEP_START, STEP_START + 18], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}
      />
    </Stage>
  );
}
