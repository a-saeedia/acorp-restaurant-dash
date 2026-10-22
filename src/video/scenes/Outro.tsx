import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption, Frame, SceneShell, Stage } from '../components/stage';
import { Halo, Kinetic, Orbits, Rule, Shine, rng } from '../components/kit';
import { SCRIPT } from '../script';
import { T, rgba } from '../theme';

const WORD = 'ACorp';

const BURST = (() => {
  const rand = rng(2026);
  return Array.from({ length: 64 }, () => ({
    angle: rand() * Math.PI * 2,
    speed: 3.4 + rand() * 7.5,
    size: 1 + rand() * 2.6,
    delay: rand() * 12,
    hue: rand() > 0.42 ? T.gold : T.lilac,
  }));
})();

function Burst() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {BURST.map((dot, index) => {
        const age = Math.max(0, frame - dot.delay);
        const distance = age * dot.speed;
        const opacity = Math.max(0, 1 - age / 74);
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: width / 2 + Math.cos(dot.angle) * distance,
              top: height / 2 + Math.sin(dot.angle) * distance * 0.62,
              width: dot.size,
              height: dot.size,
              borderRadius: '50%',
              background: dot.hue,
              opacity: opacity * 0.9,
              boxShadow: `0 0 ${dot.size * 6}px ${rgba(dot.hue, 0.9)}`,
            }}
          />
        );
      })}
    </div>
  );
}

function Letter({ char, index }: { char: string; index: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - (26 + index * 4),
    fps,
    durationInFrames: 30,
    config: { damping: 200, mass: 0.8 },
  });

  return (
    <span
      style={{
        display: 'inline-block',
        opacity: progress,
        transform: `translateY(${(1 - progress) * 80}px) scale(${0.9 + progress * 0.1})`,
        filter: `blur(${(1 - progress) * 16}px)`,
      }}
    >
      {char}
    </span>
  );
}

export function Outro() {
  const frame = useCurrentFrame();
  const script = SCRIPT.Outro;
  const fade = interpolate(frame, [206, 240], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <SceneShell id="Outro" enter={18} exit={8} blur={18}>
      <Stage tone="gold" gridOpacity={0.18} intensity={1.05}>
        <Halo x={50} y={46} size={1100} color={T.gold} intensity={0.5} />
        <Halo x={50} y={46} size={680} color={T.violet} intensity={0.5} />

        <Burst />

        <div style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
          <Orbits cx={50} cy={46} rings={3} base={300} speed={0.22} opacity={0.5} />
        </div>

        <Frame>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 136,
                fontWeight: 800,
                letterSpacing: '-0.06em',
                lineHeight: 1,
                display: 'flex',
                direction: 'ltr',
                color: T.cream,
                textShadow: `0 0 90px ${rgba(T.gold, 0.4)}`,
              }}
            >
              {WORD.split('').map((char, index) => (
                <Letter key={`${char}-${index}`} char={char} index={index} />
              ))}
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
              <Rule start={44} duration={28} width={420} align="center" />
            </div>

            <div style={{ marginTop: 26 }}>
              <Kinetic
                text={script.title}
                start={52}
                stagger={6}
                size={40}
                weight={650}
                align="center"
                color={rgba(T.cream, 0.92)}
              />
            </div>

            <div
              lang="fa"
              style={{
                marginTop: 14,
                fontSize: 19,
                color: rgba(T.cream, 0.45),
                opacity: interpolate(frame, [72, 94], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              {script.caption}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 34 }}>
              {['متن‌باز · MIT', 'Remotion', 'فارسی · RTL', 'شبیه‌سازی قطعی'].map((pill, index) => {
                const start = 84 + index * 8;
                const appear = interpolate(frame, [start, start + 18], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                return (
                  <span
                    key={pill}
                    lang="fa"
                    style={{
                      padding: '8px 17px',
                      borderRadius: 999,
                      border: `1px solid ${rgba(T.gold, 0.38)}`,
                      background: rgba(T.gold, 0.09),
                      color: rgba(T.cream, 0.82),
                      fontSize: 14,
                      opacity: appear,
                      transform: `translateY(${(1 - appear) * 12}px)`,
                    }}
                  >
                    {pill}
                  </span>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 34,
                display: 'flex',
                gap: 26,
                alignItems: 'center',
                opacity: interpolate(frame, [120, 144], [0, 1], { extrapolateRight: 'clamp' }),
                direction: 'ltr',
                fontSize: 15,
                letterSpacing: '0.08em',
                color: rgba(T.cream, 0.4),
              }}
            >
              <span style={{ color: T.goldHi }}>acorp.ir</span>
              <span
                style={{ width: 4, height: 4, borderRadius: 99, background: rgba(T.cream, 0.3) }}
              />
              <span>github.com/a-saeedia</span>
              <span
                style={{ width: 4, height: 4, borderRadius: 99, background: rgba(T.cream, 0.3) }}
              />
              <span>2026</span>
            </div>
          </div>
        </Frame>

        <Shine at={150} duration={34} opacity={0.34} angle={16} />
        <Caption
          text="ساخته‌شده برای میز کار واقعی."
          opacity={interpolate(frame, [160, 180], [0, 1], { extrapolateRight: 'clamp' })}
        />

        <AbsoluteFill
          style={{
            background: T.void,
            opacity: fade,
            pointerEvents: 'none',
          }}
        />
      </Stage>
    </SceneShell>
  );
}
