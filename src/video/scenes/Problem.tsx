import type { ReactNode } from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import {
  Act,
  Chip,
  CrystalText,
  Glitch,
  GoldText,
  Panel,
  Ring,
  Spark,
  Streaks,
  Wipe,
} from '../components/kit';
import { SCRIPT } from '../script';
import { C, FONT, clamp, decay, ramp } from '../theme';

const BEAT = 60;

function Beat({
  index,
  children,
  align = 'center',
}: {
  index: number;
  children: ReactNode;
  align?: 'center' | 'right';
}) {
  const frame = useCurrentFrame();
  const local = frame - index * BEAT;
  const enter = ramp(local, 0, 12, Easing.out(Easing.exp));
  const out = decay(local, BEAT - 12, 12, Easing.in(Easing.cubic));
  if (local < -1 || local > BEAT + 2) return null;

  return (
    <AbsoluteFill
      style={{
        opacity: clamp(enter * 1.2) * out,
        transform: `translateX(${(1 - enter) * 90 - (1 - out) * 160}px) scale(${0.96 + enter * 0.04 - (1 - out) * 0.06})`,
        filter: (1 - out) * 8 > 0.4 ? `blur(${(1 - out) * 8}px)` : undefined,
        alignItems: align === 'center' ? 'center' : 'flex-end',
        justifyContent: 'center',
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

function Ticket({ rotate, x, y, delay }: { rotate: number; x: number; y: number; delay: number }) {
  const frame = useCurrentFrame();
  const drift = Math.sin((frame + delay) / 22) * 12;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 250,
        height: 160,
        transform: `translate(${drift}px, ${Math.cos((frame + delay) / 26) * 8}px) rotate(${rotate}deg)`,
      }}
    >
      <Panel pad={16} glow={0.25} radius={12} style={{ borderColor: 'rgba(255,111,125,0.22)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, direction: 'rtl' }}>
          <div
            style={{
              height: 8,
              width: '62%',
              background: 'rgba(255,111,125,0.55)',
              borderRadius: 4,
            }}
          />
          <div
            style={{
              height: 5,
              width: '88%',
              background: 'rgba(255,255,255,0.14)',
              borderRadius: 4,
            }}
          />
          <div
            style={{
              height: 5,
              width: '72%',
              background: 'rgba(255,255,255,0.10)',
              borderRadius: 4,
            }}
          />
          <div
            style={{
              height: 5,
              width: '80%',
              background: 'rgba(255,255,255,0.10)',
              borderRadius: 4,
            }}
          />
        </div>
      </Panel>
    </div>
  );
}

export function Problem() {
  const frame = useCurrentFrame();
  const beat = Math.min(3, Math.floor(frame / BEAT));

  return (
    <Act
      seed={21}
      shards={7}
      streak={beat < 3 ? 1 : 0.3}
      caption={SCRIPT.problem.caption}
      captionStart={8}
    >
      <AbsoluteFill>
        <Beat index={0}>
          <div style={{ position: 'absolute', left: 120, top: 300, width: 620, height: 460 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Ticket key={i} rotate={-16 + i * 9} x={40 + i * 46} y={60 + i * 38} delay={i * 17} />
            ))}
          </div>
          <div style={{ position: 'absolute', right: 130, top: 390, width: 780, direction: 'rtl' }}>
            <Glitch at={2}>
              <CrystalText size={96} weight={800}>
                {SCRIPT.problem.beats[0]}
              </CrystalText>
            </Glitch>
            <div style={{ marginTop: 26 }}>
              <Chip tone="danger">۳ سفارش، سه کاغذ</Chip>
            </div>
          </div>
        </Beat>

        <Beat index={1}>
          <div style={{ position: 'absolute', left: 150, top: 360, width: 560 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                direction: 'rtl',
                marginBottom: 14,
              }}
            >
              <span style={{ fontFamily: FONT, fontSize: 22, color: C.mist }}>گوشت چرخ‌کرده</span>
              <GoldText size={26}>۰ گرم</GoldText>
            </div>
            <div
              style={{
                height: 18,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.07)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.max(0, 34 - ramp(frame, 66, 34) * 34)}%`,
                  background: 'linear-gradient(90deg, #ff6f7d, #e8b45c)',
                  boxShadow: '0 0 26px rgba(255,111,125,0.6)',
                }}
              />
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
              <Chip tone="danger">کسری</Chip>
              <Chip tone="crystal">آستانه ۴٬۰۰۰</Chip>
            </div>
          </div>
          <div style={{ position: 'absolute', right: 130, top: 390, width: 780, direction: 'rtl' }}>
            <Glitch at={62}>
              <CrystalText size={96} weight={800}>
                {SCRIPT.problem.beats[1]}
              </CrystalText>
            </Glitch>
            <div style={{ marginTop: 26 }}>
              <Chip tone="danger">بدون هشدار، بدون خرید</Chip>
            </div>
          </div>
        </Beat>

        <Beat index={2}>
          <div style={{ position: 'absolute', left: 120, top: 330, opacity: 0.95 }}>
            <Spark
              points={[0.78, 0.7, 0.74, 0.55, 0.6, 0.4, 0.44, 0.24, 0.3, 0.12]}
              start={120}
              duration={52}
              width={620}
              height={300}
              color="#ff6f7d"
            />
          </div>
          <div style={{ position: 'absolute', right: 130, top: 390, width: 780, direction: 'rtl' }}>
            <Glitch at={122}>
              <CrystalText size={96} weight={800}>
                {SCRIPT.problem.beats[2]}
              </CrystalText>
            </Glitch>
            <div style={{ marginTop: 26 }}>
              <Chip tone="danger">سود فقط در گزارش ماه بعد</Chip>
            </div>
          </div>
        </Beat>

        <Beat index={3}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${1 + (1 - ramp(frame, 180, 22)) * 0.12})`,
            }}
          >
            <Ring value={1} start={182} duration={26} size={360} stroke={3} color="gold" />
            <div style={{ position: 'absolute', direction: 'rtl' }}>
              <GoldText size={112} weight={850}>
                {SCRIPT.problem.beats[3]}
              </GoldText>
            </div>
          </div>
        </Beat>

        <Streaks power={beat === 3 ? 2.2 : 1} color="rgba(232,180,92,0.35)" />
        <Wipe at={228} />
      </AbsoluteFill>
    </Act>
  );
}
