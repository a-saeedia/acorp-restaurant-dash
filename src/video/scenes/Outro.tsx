import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { Act, Chip, CrystalText, Kinetic, Particles, Slam } from '../components/kit';
import { SCRIPT } from '../script';
import { C, FONT, GRAD, ramp } from '../theme';

export function Outro() {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 120], [1.06, 1.0]);
  const seam = ramp(frame, 18, 26, Easing.out(Easing.exp));

  return (
    <Act seed={124} shards={8} impactAt={6} impactAmp={10} flashAt={6} flashFrames={2}>
      <AbsoluteFill style={{ transform: `scale(${drift})` }}>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '44%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Slam start={2} from={2.2} duration={14} blur={18}>
            <CrystalText size={148} weight={900} style={{ letterSpacing: '-0.055em' }}>
              {SCRIPT.brand}
            </CrystalText>
          </Slam>

          <div
            style={{
              width: 300,
              height: 2,
              marginTop: 4,
              background: GRAD.gold,
              transform: `scaleX(${seam})`,
              boxShadow: `0 0 24px ${C.gold}`,
            }}
          />

          <div style={{ direction: 'rtl', marginTop: 30 }}>
            <Kinetic
              text={SCRIPT.outro.line}
              start={16}
              per={3}
              size={38}
              weight={600}
              align="center"
            />
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 10, opacity: ramp(frame, 40, 18) }}>
            <Chip tone="gold">{SCRIPT.outro.url}</Chip>
            <Chip tone="crystal">{SCRIPT.tagline}</Chip>
          </div>

          <div
            style={{
              marginTop: 30,
              fontFamily: FONT,
              fontSize: 14,
              letterSpacing: '0.16em',
              color: C.dim,
              opacity: ramp(frame, 56, 20),
            }}
          >
            {SCRIPT.outro.meta}
          </div>
        </div>
      </AbsoluteFill>
      <Particles at={6} count={30} x={50} y={42} spread={1.4} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 3,
          background: GRAD.gold,
          opacity: 0.5,
        }}
      />
    </Act>
  );
}
