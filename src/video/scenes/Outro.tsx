import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Hairline, Reveal } from '../components/motion';
import { Frame, Stage } from '../components/stage';
import { SCRIPT } from '../script';
import { sceneFrames } from '../timeline';

const PILLS = ['متن‌باز · MIT', 'Remotion', 'فارسی · RTL', 'شبیه‌سازی قطعی'];

export function Outro() {
  const frame = useCurrentFrame();
  const total = sceneFrames('Outro');
  const script = SCRIPT.Outro;
  const fadeOut = interpolate(frame, [total - 30, total], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Stage bloom="center">
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Frame>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Reveal start={0} y={0}>
              <div
                style={{
                  fontSize: 128,
                  fontWeight: 800,
                  letterSpacing: '-0.055em',
                  lineHeight: 1,
                  marginBottom: 22,
                }}
              >
                ACorp
              </div>
            </Reveal>

            <Hairline start={14} duration={26} width={360} />

            <Reveal start={24} y={14}>
              <div lang="fa" style={{ fontSize: 36, fontWeight: 600, marginTop: 26 }}>
                {script.title}
              </div>
            </Reveal>

            <Reveal start={38} y={12}>
              <div lang="fa" style={{ fontSize: 20, color: 'rgba(242,238,231,0.45)', marginTop: 12 }}>
                {script.caption}
              </div>
            </Reveal>

            <div style={{ display: 'flex', gap: 10, marginTop: 40 }}>
              {PILLS.map((pill, index) => (
                <Reveal key={pill} start={56 + index * 8} y={10}>
                  <span
                    lang="fa"
                    style={{
                      display: 'inline-block',
                      padding: '9px 18px',
                      borderRadius: 999,
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'rgba(242,238,231,0.6)',
                      fontSize: 15,
                    }}
                  >
                    {pill}
                  </span>
                </Reveal>
              ))}
            </div>

            <Reveal start={96} y={10}>
              <div
                style={{
                  marginTop: 40,
                  fontSize: 15,
                  letterSpacing: '0.08em',
                  color: 'rgba(242,238,231,0.32)',
                  direction: 'ltr',
                }}
              >
                github.com/a-saeedia · 2026
              </div>
            </Reveal>
          </div>
        </Frame>
      </AbsoluteFill>
    </Stage>
  );
}
