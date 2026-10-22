import { Check, Flame } from 'lucide-react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Caption, Frame, SceneShell, Slug, Stage } from '../components/stage';
import { Brackets, Kinetic, Kicker, Particles, Rail } from '../components/kit';
import { faClockDuration, faNumber } from '../../lib/fa';
import { SCRIPT } from '../script';
import { T, rgba } from '../theme';

const TICKETS = [
  { ref: '۱۰۸۲', table: 'میز ۷', item: 'ACorp Classic + پنیر', seconds: 134, readyAt: 176 },
  { ref: '۱۰۸۱', table: 'بیرون‌بر', item: 'دوبل چدار', seconds: 340, readyAt: 198 },
  { ref: '۱۰۷۹', table: 'میز ۳', item: 'چف‌برگر', seconds: 512, readyAt: 220 },
];

/** Rising heat wisps behind a ticket. */
function Steam({ seed }: { seed: number }) {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {[0, 1, 2].map((index) => {
        const phase = frame / 34 + index * 1.9 + seed;
        const rise = ((phase % 1) + 1) % 1;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${20 + index * 28 + Math.sin(phase) * 6}%`,
              bottom: `${rise * 70}%`,
              width: 90 + index * 26,
              height: 120,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${rgba(T.cream, 0.1)} 0%, transparent 68%)`,
              filter: 'blur(18px)',
              opacity: (1 - rise) * 0.55,
            }}
          />
        );
      })}
    </div>
  );
}

function Ring({ progress, ready }: { progress: number; ready: boolean }) {
  const radius = 21;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg width={54} height={54} viewBox="0 0 54 54">
      <circle
        cx={27}
        cy={27}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={3}
      />
      <circle
        cx={27}
        cy={27}
        r={radius}
        fill="none"
        stroke={ready ? T.goldHi : T.gold}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - Math.min(1, progress))}
        transform="rotate(-90 27 27)"
        style={{ filter: `drop-shadow(0 0 6px ${rgba(T.gold, 0.8)})` }}
      />
    </svg>
  );
}

export function Kitchen() {
  const frame = useCurrentFrame();
  const script = SCRIPT.Kitchen;

  return (
    <SceneShell id="Kitchen" enter={14} exit={10}>
      <Stage tone="gold" gridOpacity={0.26} intensity={0.95}>
        <Slug label="Kitchen" index="03" />
        <Particles count={48} seed={73} color={T.gold} opacity={0.55} size={2.6} rise={0.85} />

        <Frame align="top">
          <div
            style={{
              marginTop: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <div>
              <Kicker start={0} color={T.goldHi}>
                {script.kicker}
              </Kicker>
              <div style={{ marginTop: 8 }}>
                <Kinetic text={script.title} start={4} stagger={5} size={68} weight={760} />
              </div>
            </div>
            <div
              lang="fa"
              style={{
                display: 'flex',
                gap: 22,
                fontSize: 17,
                color: rgba(T.cream, 0.45),
                opacity: interpolate(frame, [10, 28], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              <span>۳ تیکت فعال</span>
              <span style={{ color: rgba(T.cream, 0.2) }}>|</span>
              <span>میانگین آماده‌سازی ۱۴ دقیقه</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, marginTop: 50 }}>
            {TICKETS.map((ticket, index) => {
              const start = 18 + index * 12;
              const enter = interpolate(frame, [start, start + 30], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: (t) => 1 - Math.pow(1 - t, 3),
              });
              const isReady = frame >= ticket.readyAt;
              const stamp = interpolate(frame, [ticket.readyAt, ticket.readyAt + 12], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              const seconds = Math.round(
                ticket.seconds +
                  interpolate(frame, [0, 300], [0, 52], { extrapolateRight: 'clamp' }),
              );
              const progress = Math.min(1, seconds / 620);
              const pulse = isReady ? 0.55 + 0.45 * Math.sin((frame - ticket.readyAt) / 4) : 0;

              return (
                <div
                  key={ticket.ref}
                  style={{
                    flex: 1,
                    opacity: enter,
                    transform: `translateY(${(1 - enter) * 70 + Math.sin(frame / 30 + index) * 4}px) rotate(${
                      (index - 1) * 1.1
                    }deg)`,
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: 452,
                      borderRadius: 6,
                      padding: '26px 26px 30px',
                      background: isReady
                        ? `linear-gradient(170deg, ${rgba(T.gold, 0.24)} 0%, rgba(20,10,34,0.96) 62%)`
                        : 'linear-gradient(170deg, rgba(38,24,58,0.96) 0%, rgba(14,8,22,0.97) 70%)',
                      border: `1px solid ${isReady ? rgba(T.gold, 0.6) : rgba(T.cream, 0.1)}`,
                      boxShadow: isReady
                        ? `0 0 ${50 + pulse * 40}px -10px ${rgba(T.gold, 0.55)}, 0 40px 80px -50px #000`
                        : '0 40px 80px -50px #000',
                      overflow: 'hidden',
                    }}
                  >
                    <Steam seed={index * 2.3} />
                    <Brackets color={isReady ? rgba(T.gold, 0.7) : rgba(T.cream, 0.14)} />

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'relative',
                      }}
                    >
                      <span
                        lang="fa"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 15,
                          color: isReady ? T.goldHi : rgba(T.cream, 0.5),
                        }}
                      >
                        <Flame size={15} />
                        {isReady ? 'آمادهٔ تحویل' : 'در حال پخت'}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          color: rgba(T.cream, 0.3),
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        #{ticket.ref}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 22 }}>
                      <div style={{ position: 'relative', width: 54, height: 54, flex: 'none' }}>
                        <Ring progress={progress} ready={isReady} />
                        <span
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 12,
                            color: isReady ? T.goldHi : rgba(T.cream, 0.5),
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {faNumber(Math.round(progress * 100))}
                        </span>
                      </div>
                      <div>
                        <div lang="fa" style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.25 }}>
                          {ticket.item}
                        </div>
                        <div
                          lang="fa"
                          style={{ fontSize: 16, color: rgba(T.cream, 0.42), marginTop: 4 }}
                        >
                          {ticket.table} · اولویت {faNumber(index + 1)}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        marginTop: 'auto',
                        paddingTop: 26,
                      }}
                    >
                      <span
                        dir="ltr"
                        style={{
                          fontSize: 44,
                          fontWeight: 700,
                          color: isReady ? T.goldHi : T.cream,
                          fontVariantNumeric: 'tabular-nums',
                          letterSpacing: '-0.02em',
                          textShadow: isReady ? `0 0 30px ${rgba(T.gold, 0.6)}` : undefined,
                        }}
                      >
                        {faClockDuration(seconds * 1000)}
                      </span>
                      <span
                        style={{
                          width: 46,
                          height: 2,
                          background: isReady ? T.goldHi : rgba(T.gold, 0.5),
                        }}
                      />
                    </div>

                    <div style={{ marginTop: 18 }}>
                      <Rail progress={progress} height={5} color={isReady ? T.goldHi : T.gold} />
                    </div>

                    {isReady ? (
                      <div
                        style={{
                          position: 'absolute',
                          insetInlineStart: 22,
                          bottom: 22,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 14px',
                          borderRadius: 999,
                          border: `1px solid ${rgba(T.goldHi, 0.6)}`,
                          background: rgba(T.gold, 0.16),
                          color: T.goldHi,
                          fontSize: 14,
                          transform: `scale(${1.4 - stamp * 0.4}) rotate(-8deg)`,
                          opacity: stamp,
                        }}
                      >
                        <Check size={14} strokeWidth={3} />
                        <span lang="fa">صندوق خبردار شد</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            lang="fa"
            style={{
              marginTop: 40,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 20px',
              borderRadius: 12,
              border: `1px solid ${rgba(T.cream, 0.1)}`,
              background: rgba(T.cream, 0.025),
              color: rgba(T.cream, 0.6),
              fontSize: 18,
              opacity: interpolate(frame, [198, 220], [0, 1], { extrapolateRight: 'clamp' }),
              alignSelf: 'flex-start',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 99,
                background: T.gold,
                boxShadow: `0 0 10px ${T.gold}`,
              }}
            />
            تیکت آماده، خودکار به صندوق اطلاع می‌دهد — بدون تلفن، بدون فریاد.
          </div>
        </Frame>

        <AbsoluteFill
          style={{
            background: `linear-gradient(0deg, ${rgba(T.gold, 0.1)} 0%, transparent 42%)`,
            pointerEvents: 'none',
          }}
        />

        <Caption
          text={script.caption}
          opacity={interpolate(frame, [206, 228], [0, 1], { extrapolateRight: 'clamp' })}
        />
      </Stage>
    </SceneShell>
  );
}
