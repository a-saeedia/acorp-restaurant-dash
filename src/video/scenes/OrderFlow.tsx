import { Check, QrCode } from 'lucide-react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Caption, Frame, SceneShell, Slug, Stage } from '../components/stage';
import { Brackets, Kinetic, Kicker, Rail, Shine, rng } from '../components/kit';
import { faMoney, faNumber } from '../../lib/fa';
import { SCRIPT } from '../script';
import { FILM } from '../data';
import { T, rgba } from '../theme';

const STEP_START = 42;
const STEP_GAP = 24;

/** Decorative QR field. Generated once, deterministic. */
const QR = (() => {
  const rand = rng(91);
  const cells: { x: number; y: number; on: boolean }[] = [];
  const size = 21;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const corner = (x < 7 && y < 7) || (x > size - 8 && y < 7) || (x < 7 && y > size - 8);
      cells.push({ x, y, on: corner ? (x + y) % 3 !== 0 : rand() > 0.55 });
    }
  }
  return { cells, size };
})();

function QrGlyph({ opacity }: { opacity: number }) {
  const frame = useCurrentFrame();
  const cell = 9;
  return (
    <svg
      width={QR.size * cell}
      height={QR.size * cell}
      style={{ opacity, transform: `rotate(${Math.sin(frame / 90) * 3}deg)` }}
    >
      {QR.cells.map((module, index) =>
        module.on ? (
          <rect
            key={index}
            x={module.x * cell}
            y={module.y * cell}
            width={cell - 1.6}
            height={cell - 1.6}
            rx={1.4}
            fill={T.gold}
            opacity={0.55}
          />
        ) : null,
      )}
    </svg>
  );
}

export function OrderFlow() {
  const frame = useCurrentFrame();
  const script = SCRIPT.OrderFlow;
  const { sample, events } = FILM;

  const visible = events.filter((_, index) => frame >= STEP_START + index * STEP_GAP).length;
  const current = events[Math.max(0, visible - 1)];
  const comet = interpolate(
    frame,
    [STEP_START, STEP_START + (events.length - 1) * STEP_GAP],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );
  const done = interpolate(frame, [318, 350], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <SceneShell id="OrderFlow" enter={14} exit={10}>
      <Stage tone="violet" gridOpacity={0.3}>
        <Slug label="Order flow" index="02" />

        <div style={{ position: 'absolute', left: 40, bottom: 120, opacity: 0.16 }}>
          <QrGlyph opacity={1} />
        </div>

        <Frame align="top">
          <div
            style={{
              marginTop: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <div>
              <Kicker start={0}>{script.kicker}</Kicker>
              <div style={{ marginTop: 8 }}>
                <Kinetic text={script.title} start={4} stagger={6} size={70} weight={760} />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity: interpolate(frame, [10, 26], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              <div
                lang="fa"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: `1px solid ${rgba(T.gold, 0.3)}`,
                  background: `linear-gradient(180deg, ${rgba(T.gold, 0.12)}, ${rgba(T.gold, 0.03)})`,
                  color: T.goldHi,
                  borderRadius: 999,
                  padding: '11px 20px',
                  fontSize: 20,
                  boxShadow: `0 0 40px -12px ${rgba(T.gold, 0.7)}`,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 99,
                    background: T.gold,
                    boxShadow: `0 0 12px ${T.gold}`,
                  }}
                />
                {current?.titleFa ?? 'در انتظار ثبت'}
              </div>
              <span
                style={{
                  fontSize: 15,
                  color: rgba(T.cream, 0.35),
                  fontVariantNumeric: 'tabular-nums',
                  direction: 'ltr',
                }}
              >
                {String(Math.min(visible, events.length)).padStart(2, '0')} / {events.length}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 38, marginTop: 40, alignItems: 'flex-start' }}>
            {/* Receipt */}
            <div
              style={{
                flex: '0 0 456px',
                transform: `translateY(${interpolate(frame, [16, 44], [40, 0], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                  easing: (t) => 1 - Math.pow(1 - t, 3),
                })}px) rotate(${interpolate(frame, [16, 44], [-2.4, -0.4], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })}deg)`,
                opacity: interpolate(frame, [16, 34], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              <div
                style={{
                  position: 'relative',
                  borderRadius: 8,
                  background: 'linear-gradient(180deg, #16101f 0%, #0e0916 100%)',
                  border: `1px solid ${rgba(T.gold, 0.22)}`,
                  boxShadow: `0 60px 120px -50px ${rgba(T.violet, 0.9)}, 0 0 0 1px rgba(255,255,255,0.03)`,
                  padding: '26px 28px 30px',
                  overflow: 'hidden',
                }}
              >
                {/* perforated tear edge */}
                <div
                  style={{
                    position: 'absolute',
                    top: -6,
                    left: 0,
                    right: 0,
                    height: 12,
                    backgroundImage: `radial-gradient(circle at 6px 6px, transparent 5px, ${T.void} 5.5px)`,
                    backgroundSize: '12px 12px',
                    opacity: 0.9,
                  }}
                />
                <Brackets color={rgba(T.gold, 0.35)} />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 15,
                    color: rgba(T.cream, 0.4),
                    marginTop: 6,
                  }}
                >
                  <span lang="fa">سفارش</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>#{sample.reference}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
                  <QrCode size={18} color={T.gold} />
                  <span lang="fa" style={{ fontSize: 28, fontWeight: 700 }}>
                    {sample.customerNameFa}
                  </span>
                </div>
                <div lang="fa" style={{ fontSize: 17, color: rgba(T.cream, 0.42), marginTop: 4 }}>
                  {sample.tableFa} · اسکن QR
                </div>

                <div
                  style={{
                    height: 1,
                    background: `linear-gradient(90deg, ${rgba(T.gold, 0.35)}, transparent)`,
                    margin: '20px 0',
                  }}
                />

                {sample.items.map((item, index) => {
                  const at = 26 + index * 6;
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                        opacity: interpolate(frame, [at, at + 12], [0, 1], {
                          extrapolateRight: 'clamp',
                        }),
                      }}
                      lang="fa"
                    >
                      <span style={{ fontSize: 19 }}>
                        {faNumber(item.quantity)} × {item.nameFa}
                      </span>
                      <span
                        style={{
                          fontSize: 19,
                          color: rgba(T.cream, 0.66),
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {faMoney(item.lineSubtotal)}
                      </span>
                    </div>
                  );
                })}

                <div
                  style={{
                    height: 1,
                    background: `linear-gradient(90deg, ${rgba(T.gold, 0.35)}, transparent)`,
                    margin: '18px 0',
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span lang="fa" style={{ fontSize: 18, color: rgba(T.cream, 0.45) }}>
                    مبلغ کل
                  </span>
                  <span
                    style={{
                      fontSize: 36,
                      fontWeight: 780,
                      color: T.goldHi,
                      fontVariantNumeric: 'tabular-nums',
                      textShadow: `0 0 40px ${rgba(T.gold, 0.45)}`,
                    }}
                  >
                    {faMoney(sample.total)}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 20,
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
                          fontSize: 14,
                          padding: '5px 11px',
                          borderRadius: 999,
                          border: `1px solid ${rgba(T.cream, 0.12)}`,
                          color: rgba(T.cream, 0.55),
                        }}
                      >
                        {label}
                      </span>
                    )),
                  )}
                </div>

                <Shine at={322} duration={30} opacity={0.35} angle={12} />

                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 8,
                    boxShadow: `inset 0 0 60px ${rgba(T.gold, 0.14 * done)}`,
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>

            {/* Event spine */}
            <div style={{ flex: 1, position: 'relative', paddingInlineStart: 34 }}>
              <div
                style={{
                  position: 'absolute',
                  insetInlineStart: 0,
                  top: 8,
                  bottom: 8,
                  width: 2,
                  background: `linear-gradient(180deg, ${rgba(T.gold, 0.08)}, ${rgba(T.gold, 0.35)} 30%, ${rgba(T.gold, 0.08)})`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  insetInlineStart: -6,
                  top: 8,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: T.gold,
                  boxShadow: `0 0 24px 6px ${rgba(T.gold, 0.6)}`,
                  transform: `translateY(${comet * (events.length * 52 - 16)}px)`,
                  opacity: frame > STEP_START ? 1 : 0,
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {events.map((event, index) => {
                  const at = STEP_START + index * STEP_GAP;
                  const revealed = frame >= at;
                  if (!revealed) return null;
                  const isLast = index === Math.min(visible, events.length) - 1;
                  const enter = interpolate(frame, [at - 6, at + 12], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                    easing: (t) => 1 - Math.pow(1 - t, 3),
                  });

                  return (
                    <div
                      key={event.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '8px 18px',
                        borderRadius: 11,
                        border: `1px solid ${
                          isLast ? rgba(T.gold, 0.5) : 'rgba(255,255,255,0.075)'
                        }`,
                        background: isLast
                          ? `linear-gradient(90deg, ${rgba(T.gold, 0.14)}, ${rgba(T.gold, 0.02)})`
                          : 'rgba(255,255,255,0.025)',
                        opacity: enter,
                        transform: `translateX(${(1 - enter) * -42}px)`,
                        boxShadow: isLast ? `0 0 40px -14px ${rgba(T.gold, 0.8)}` : undefined,
                      }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          display: 'grid',
                          placeItems: 'center',
                          flex: 'none',
                          background: isLast ? T.gold : rgba(T.gold, 0.14),
                          color: isLast ? T.void : T.gold,
                        }}
                      >
                        <Check size={13} strokeWidth={3} />
                      </span>
                      <span
                        lang="fa"
                        style={{
                          fontSize: 19,
                          color: isLast ? T.cream : rgba(T.cream, 0.62),
                          flex: 1,
                        }}
                      >
                        {event.titleFa}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          color: rgba(T.cream, 0.28),
                          fontVariantNumeric: 'tabular-nums',
                          direction: 'ltr',
                        }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  opacity: done,
                }}
              >
                <div style={{ flex: 1 }}>
                  <Rail progress={done} height={4} />
                </div>
                <span
                  lang="fa"
                  style={{ fontSize: 17, color: rgba(T.cream, 0.5), whiteSpace: 'nowrap' }}
                >
                  {faNumber(events.length)} رویداد ثبت‌شده
                </span>
              </div>
            </div>
          </div>
        </Frame>

        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at 28% 52%, ${rgba(T.gold, 0.16)} 0%, transparent 52%)`,
              opacity: done,
            }}
          />
        </AbsoluteFill>

        <Caption
          text={script.caption}
          opacity={interpolate(frame, [268, 292], [0, 1], { extrapolateRight: 'clamp' })}
        />
      </Stage>
    </SceneShell>
  );
}
