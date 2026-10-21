import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Hairline, Reveal } from '../components/motion';
import { Caption, Frame, Kicker, Stage } from '../components/stage';
import { SCRIPT } from '../script';
import { sceneFrames } from '../timeline';

export function ColdOpen() {
  const frame = useCurrentFrame();
  const total = sceneFrames('ColdOpen');
  const script = SCRIPT.ColdOpen;

  const push = interpolate(frame, [0, total], [1, 1.035]);
  const fadeOut = interpolate(frame, [total - 16, total], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Stage bloom="center">
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Frame>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              transform: `scale(${push})`,
            }}
          >
            <Reveal start={10} y={0}>
              <Kicker>{script.kicker}</Kicker>
            </Reveal>

            <Reveal start={22} y={30} duration={26}>
              <div
                style={{
                  fontSize: 196,
                  fontWeight: 800,
                  letterSpacing: '-0.055em',
                  lineHeight: 1,
                  color: '#f6f1e7',
                  textShadow: '0 30px 90px rgba(227,168,84,0.18)',
                }}
              >
                ACorp
              </div>
            </Reveal>

            <div style={{ marginTop: 26, marginBottom: 26 }}>
              <Hairline start={46} duration={30} width={420} />
            </div>

            <Reveal start={58} y={16}>
              <div
                lang="fa"
                style={{ fontSize: 40, fontWeight: 600, color: 'rgba(242,238,231,0.92)' }}
              >
                سامانهٔ هوشمند مدیریت رستوران
              </div>
            </Reveal>

            <Reveal start={74} y={12}>
              <div
                lang="fa"
                style={{ fontSize: 23, color: 'rgba(242,238,231,0.45)', marginTop: 14 }}
              >
                شعبه ونک · تهران · نسخهٔ ۱٫۰
              </div>
            </Reveal>
          </div>
        </Frame>

        <Caption
          text={script.caption}
          opacity={interpolate(frame, [96, 112], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })}
        />
      </AbsoluteFill>
    </Stage>
  );
}
