import { Clock3, EyeOff, Network } from 'lucide-react';
import { interpolate, useCurrentFrame } from 'remotion';
import { Reveal } from '../components/motion';
import { Caption, Frame, Kicker, Stage } from '../components/stage';
import { SCRIPT } from '../script';

const CARDS = [
  {
    index: '۰۱',
    title: 'سفارش پراکنده',
    body: 'QR، تلفن، پیک — هر کدام در یک جزیرهٔ جدا.',
    icon: Network,
  },
  {
    index: '۰۲',
    title: 'موجودی کور',
    body: 'کسری وقتی دیده می‌شود که دیگر دیر شده.',
    icon: EyeOff,
  },
  {
    index: '۰۳',
    title: 'تحلیل دیروز',
    body: 'گزارش دیشب، تصمیم امروز را نمی‌سازد.',
    icon: Clock3,
  },
];

export function Problem() {
  const frame = useCurrentFrame();
  const script = SCRIPT.Problem;

  return (
    <Stage bloom="left">
      <Frame align="top">
        <div style={{ marginTop: 40 }}>
          <Reveal start={0}>
            <Kicker>{script.kicker}</Kicker>
          </Reveal>
          <Reveal start={6} y={24}>
            <h1
              lang="fa"
              style={{
                fontSize: 82,
                fontWeight: 750,
                letterSpacing: '-0.03em',
                lineHeight: 1.18,
                margin: 0,
                maxWidth: 1100,
              }}
            >
              رستوران‌ها با داده می‌جنگند،
              <br />
              <span style={{ color: 'rgba(242,238,231,0.42)' }}>نه با غذا.</span>
            </h1>
          </Reveal>
        </div>

        <div style={{ display: 'flex', gap: 22, marginTop: 72 }}>
          {CARDS.map((card, index) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.index} start={44 + index * 16} y={30} style={{ flex: 1 }}>
                <div
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012))',
                    borderRadius: 20,
                    padding: '30px 28px 34px',
                    minHeight: 260,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      insetInlineStart: 0,
                      top: 0,
                      height: 2,
                      width: `${30 + index * 22}%`,
                      background: 'linear-gradient(90deg, #e3a854, transparent)',
                      opacity: 0.7,
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        display: 'grid',
                        placeItems: 'center',
                        background: 'rgba(227,168,84,0.10)',
                        color: '#e3a854',
                      }}
                    >
                      <Icon size={21} strokeWidth={1.7} />
                    </span>
                    <span
                      lang="fa"
                      style={{
                        fontSize: 15,
                        color: 'rgba(242,238,231,0.28)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {card.index}
                    </span>
                  </div>
                  <div lang="fa" style={{ fontSize: 30, fontWeight: 650, marginTop: 6 }}>
                    {card.title}
                  </div>
                  <div
                    lang="fa"
                    style={{ fontSize: 20, lineHeight: 1.7, color: 'rgba(242,238,231,0.52)' }}
                  >
                    {card.body}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Frame>

      <Caption
        text={script.caption}
        opacity={interpolate(frame, [120, 140], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}
      />
    </Stage>
  );
}
