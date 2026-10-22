import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { CrystalText, Kinetic, Particles, Slam, Wipe, Act } from '../components/kit';
import { SCRIPT } from '../script';
import { C, FONT, GRAD, ramp } from '../theme';

export function ColdOpen() {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, 180], [1.03, 1.09]);

  return (
    <Act seed={7} shards={11} impactAt={12} impactAmp={24} flashAt={12} flashFrames={4}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '47%',
            transform: 'translate(-50%, -50%)',
            width: 1200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Slam start={2} from={4.4} duration={16} blur={26}>
            <CrystalText size={252} weight={900} style={{ letterSpacing: '-0.055em' }}>
              {SCRIPT.brand}
            </CrystalText>
          </Slam>

          <div
            style={{
              width: 440,
              height: 3,
              marginTop: 6,
              background: GRAD.gold,
              boxShadow: '0 0 30px rgba(232,180,92,0.9)',
              transformOrigin: '50% 50%',
              transform: `scaleX(${ramp(frame, 14, 20, Easing.out(Easing.exp))})`,
              opacity: ramp(frame, 14, 6),
            }}
          />

          <div style={{ direction: 'rtl', marginTop: 42 }}>
            <Kinetic
              text={SCRIPT.cold.line}
              start={24}
              per={3}
              size={46}
              weight={600}
              color={C.crystal}
              align="center"
            />
          </div>

          <div
            style={{
              marginTop: 22,
              fontFamily: FONT,
              fontSize: 19,
              letterSpacing: '0.3em',
              color: C.mist,
              opacity: ramp(frame, 50, 20),
            }}
          >
            {SCRIPT.cold.sub}
          </div>
        </div>
      </AbsoluteFill>
      <Particles at={12} count={46} x={50} y={45} />
      <Wipe at={162} />
    </Act>
  );
}
