import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption, SceneShell, Slug, Stage } from '../components/stage';
import { Halo, Kinetic, Kicker, Orbits, Rule, Shine } from '../components/kit';
import { SCRIPT } from '../script';
import { T, rgba } from '../theme';

const WORD = 'ACorp';

function Letter({ char, index }: { char: string; index: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - (34 + index * 4),
    fps,
    durationInFrames: 34,
    config: { damping: 190, mass: 0.8 },
  });

  return (
    <span
      style={{
        display: 'inline-block',
        opacity: progress,
        transform: `translateY(${(1 - progress) * 120}px) scale(${0.86 + progress * 0.14})`,
        filter: `blur(${(1 - progress) * 22}px)`,
      }}
    >
      {char}
    </span>
  );
}

export function ColdOpen() {
  const frame = useCurrentFrame();
  const script = SCRIPT.ColdOpen;

  const core = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const ringGrow = interpolate(frame, [8, 70], [0.35, 1], { extrapolateRight: 'clamp' });
  const push = interpolate(frame, [0, 210], [1, 1.045]);
  const captionIn = interpolate(frame, [92, 116], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const flare = interpolate(frame, [52, 62, 92], [0, 0.55, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <SceneShell id="ColdOpen" enter={20} exit={12} blur={22}>
      <Stage tone="violet" gridOpacity={0.22}>
        <Slug label="Cold open" index="00" />

        <Halo x={50} y={48} size={920} color={T.violet} intensity={0.55 * core} />
        <Halo x={50} y={48} size={520} color={T.gold} intensity={0.5 * core} />

        <div style={{ opacity: ringGrow, position: 'absolute', inset: 0 }}>
          <Orbits cx={50} cy={48} rings={3} base={330} speed={0.35} opacity={0.55 * core} />
        </div>

        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${push})`,
          }}
        >
          <div style={{ marginBottom: 26 }}>
            <Kicker start={14}>{script.kicker}</Kicker>
          </div>

          <div
            style={{
              position: 'relative',
              fontSize: 214,
              fontWeight: 800,
              letterSpacing: '-0.06em',
              lineHeight: 0.94,
              display: 'flex',
              direction: 'ltr',
            }}
          >
            {WORD.split('').map((char, index) => (
              <Letter key={`${char}-${index}`} char={char} index={index} />
            ))}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(105deg, transparent 34%, rgba(255,255,255,0.9) 48%, transparent 62%)`,
                backgroundSize: '260% 100%',
                backgroundPosition: `${interpolate(frame, [58, 96], [180, -60], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })}% 0`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                mixBlendMode: 'screen',
                opacity: 0.85,
              }}
            >
              {WORD}
            </div>
          </div>

          <div
            style={{ marginTop: 22, marginBottom: 24, display: 'flex', justifyContent: 'center' }}
          >
            <Rule start={52} duration={30} width={520} align="center" />
          </div>

          <Kinetic
            text="سامانهٔ هوشمند مدیریت رستوران"
            start={62}
            stagger={5}
            size={42}
            weight={600}
            align="center"
            color="rgba(247,242,232,0.9)"
            letterSpacing="-0.01em"
          />

          <div
            style={{
              marginTop: 20,
              display: 'flex',
              gap: 14,
              opacity: interpolate(frame, [86, 106], [0, 1], { extrapolateRight: 'clamp' }),
            }}
          >
            {['شعبه ونک', 'تهران', 'نسخهٔ ۱٫۰'].map((chip) => (
              <span
                key={chip}
                lang="fa"
                style={{
                  padding: '7px 16px',
                  borderRadius: 999,
                  border: `1px solid ${rgba(T.cream, 0.12)}`,
                  background: rgba(T.cream, 0.03),
                  color: rgba(T.cream, 0.5),
                  fontSize: 16,
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </AbsoluteFill>

        <Shine at={56} duration={38} opacity={0.28} />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 50% 47%, ${rgba(T.cream, 0.5)} 0%, transparent 46%)`,
            opacity: flare,
            mixBlendMode: 'screen',
          }}
        />

        <Caption text={script.caption} opacity={captionIn} />
      </Stage>
    </SceneShell>
  );
}
