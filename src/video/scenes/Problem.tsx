import { Clock3, EyeOff, Network } from 'lucide-react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Caption, Frame, SceneShell, Slug, Stage } from '../components/stage';
import { Brackets, GlowCard, Kinetic, Kicker, Particles, Rail } from '../components/kit';
import { SCRIPT } from '../script';
import { T, rgba } from '../theme';

const CARDS = [
  {
    index: '۰۱',
    title: 'سفارش پراکنده',
    body: 'QR، تلفن، پیک — هر کدام در یک جزیرهٔ جدا.',
    icon: Network,
    accent: T.lilac,
  },
  {
    index: '۰۲',
    title: 'موجودی کور',
    body: 'کسری وقتی دیده می‌شود که دیگر دیر شده.',
    icon: EyeOff,
    accent: '#d96b33',
  },
  {
    index: '۰۳',
    title: 'تحلیل دیروز',
    body: 'گزارش دیشب، تصمیم امروز را نمی‌سازد.',
    icon: Clock3,
    accent: T.gold,
  },
];

/** Broken-network sketch: four nodes, two severed links, constant jitter. */
function ScatterGraphic({ accent }: { accent: string }) {
  const frame = useCurrentFrame();
  const nodes = [
    { x: 26, y: 34 },
    { x: 118, y: 22 },
    { x: 74, y: 96 },
    { x: 158, y: 78 },
  ];
  return (
    <svg width={190} height={120} style={{ overflow: 'visible' }}>
      <path
        d="M26 34 L118 22 M74 96 L158 78"
        stroke={rgba(accent, 0.5)}
        strokeWidth={1.4}
        strokeDasharray="6 7"
        strokeDashoffset={-frame * 0.9}
      />
      <path
        d="M26 34 L74 96 M118 22 L74 96"
        stroke="rgba(247,242,232,0.09)"
        strokeWidth={1.2}
        strokeDasharray="2 6"
      />
      {nodes.map((node, index) => {
        const jitter = Math.sin(frame / 7 + index * 1.7) * 1.6;
        return (
          <g key={index} transform={`translate(${jitter}, ${jitter * 0.6})`}>
            <circle cx={node.x} cy={node.y} r={9} fill="none" stroke={rgba(accent, 0.28)} />
            <circle
              cx={node.x}
              cy={node.y}
              r={4}
              fill={accent}
              opacity={0.65 + 0.35 * Math.sin(frame / 9 + index)}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** Struck-through eye, with a slow blink. */
function BlindGraphic({ accent }: { accent: string }) {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [20, 46], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <svg width={190} height={120} viewBox="0 0 190 120" style={{ overflow: 'visible' }}>
      <path
        d="M22 60 C48 30 142 30 168 60 C142 90 48 90 22 60 Z"
        fill="none"
        stroke={rgba(accent, 0.55)}
        strokeWidth={2}
      />
      <circle cx={95} cy={60} r={14} fill="none" stroke={rgba(accent, 0.8)} strokeWidth={2} />
      <circle cx={95} cy={60} r={4} fill={accent} opacity={0.7 + 0.3 * Math.sin(frame / 8)} />
      <path
        d="M34 96 L156 24"
        stroke={T.cream}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={160}
        strokeDashoffset={160 * (1 - draw)}
        opacity={0.8}
      />
    </svg>
  );
}

/** Clock running backwards — the point is that the report is late. */
function LateGraphic({ accent }: { accent: string }) {
  const frame = useCurrentFrame();
  const spin = -frame * 2.4;
  return (
    <svg width={190} height={120} viewBox="0 0 190 120" style={{ overflow: 'visible' }}>
      <circle cx={95} cy={60} r={40} fill="none" stroke={rgba(accent, 0.4)} strokeWidth={1.6} />
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return (
          <line
            key={index}
            x1={95 + Math.cos(angle) * 34}
            y1={60 + Math.sin(angle) * 34}
            x2={95 + Math.cos(angle) * 39}
            y2={60 + Math.sin(angle) * 39}
            stroke={rgba(accent, 0.35)}
            strokeWidth={1}
          />
        );
      })}
      <line
        x1={95}
        y1={60}
        x2={95}
        y2={32}
        stroke={accent}
        strokeWidth={3}
        strokeLinecap="round"
        transform={`rotate(${spin * 0.2} 95 60)`}
      />
      <line
        x1={95}
        y1={60}
        x2={95}
        y2={40}
        stroke={T.cream}
        strokeWidth={2}
        strokeLinecap="round"
        transform={`rotate(${spin} 95 60)`}
      />
      <circle cx={95} cy={60} r={3} fill={T.cream} />
    </svg>
  );
}

/** Two-frame RGB split glitch across the headline. */
function GlitchLine({ children }: { children: string }) {
  const frame = useCurrentFrame();
  const active =
    (frame > 64 && frame < 72) || (frame > 118 && frame < 124) || (frame > 196 && frame < 200);
  const offset = active ? Math.sin(frame * 5.7) * 9 : 0;

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          color: rgba('#ff3b6b', 0.55),
          transform: `translateX(${offset}px)`,
          clipPath: 'inset(18% 0 52% 0)',
        }}
        aria-hidden
      >
        {children}
      </span>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          color: rgba(T.lilac, 0.6),
          transform: `translateX(${-offset}px)`,
          clipPath: 'inset(56% 0 14% 0)',
        }}
        aria-hidden
      >
        {children}
      </span>
      {children}
    </span>
  );
}

export function Problem() {
  const frame = useCurrentFrame();
  const script = SCRIPT.Problem;

  return (
    <SceneShell id="Problem" enter={16} exit={10}>
      <Stage tone="violet" gridOpacity={0.28}>
        <Slug label="Problem" index="01" />
        <Particles count={26} seed={41} color="#d96b33" opacity={0.4} rise={0.7} size={2} />

        <Frame align="top">
          <div style={{ marginTop: 46 }}>
            <Kicker start={2}>{script.kicker}</Kicker>

            <div style={{ marginTop: 18, maxWidth: 1180 }}>
              <Kinetic
                text="رستوران‌ها با داده می‌جنگند،"
                start={8}
                stagger={3}
                size={84}
                weight={760}
                align="right"
                lineHeight={1.16}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                <Kinetic
                  text="نه با غذا."
                  start={26}
                  stagger={4}
                  size={84}
                  weight={760}
                  color="rgba(247,242,232,0.34)"
                  align="right"
                />
              </div>
            </div>

            <div
              style={{
                marginTop: 22,
                display: 'flex',
                justifyContent: 'flex-end',
                opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              <span
                lang="fa"
                style={{ fontSize: 26, color: rgba(T.cream, 0.46), letterSpacing: '-0.01em' }}
              >
                <GlitchLine>سه جای درز، هر شب.</GlitchLine>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 22, marginTop: 54 }}>
            {CARDS.map((card, index) => {
              const Icon = card.icon;
              const start = 48 + index * 14;
              const enter = interpolate(frame, [start, start + 26], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              const float = Math.sin(frame / 26 + index * 1.6) * 5;
              const graphic =
                index === 0 ? (
                  <ScatterGraphic accent={card.accent} />
                ) : index === 1 ? (
                  <BlindGraphic accent={card.accent} />
                ) : (
                  <LateGraphic accent={card.accent} />
                );

              return (
                <div
                  key={card.index}
                  style={{
                    flex: 1,
                    opacity: enter,
                    transform: `perspective(1400px) rotateY(${(1 - enter) * -16}deg) translateY(${
                      (1 - enter) * 46 + float
                    }px)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <GlowCard
                    tint={index === 1 ? 'neutral' : 'violet'}
                    padding="26px 28px 30px"
                    style={{ minHeight: 300 }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        insetInlineStart: 0,
                        top: 0,
                        height: 2,
                        width: `${34 + index * 20}%`,
                        background: `linear-gradient(90deg, ${card.accent}, transparent)`,
                        opacity: 0.9,
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
                          width: 46,
                          height: 46,
                          borderRadius: 13,
                          display: 'grid',
                          placeItems: 'center',
                          background: rgba(card.accent, 0.12),
                          border: `1px solid ${rgba(card.accent, 0.28)}`,
                          color: card.accent,
                        }}
                      >
                        <Icon size={21} strokeWidth={1.7} />
                      </span>
                      <span
                        lang="fa"
                        style={{
                          fontSize: 15,
                          color: rgba(T.cream, 0.26),
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {card.index}
                      </span>
                    </div>

                    <div style={{ height: 128, marginTop: 20, marginBottom: 6 }}>{graphic}</div>

                    <div lang="fa" style={{ fontSize: 30, fontWeight: 650, color: T.cream }}>
                      {card.title}
                    </div>
                    <div
                      lang="fa"
                      style={{
                        fontSize: 19,
                        lineHeight: 1.7,
                        color: rgba(T.cream, 0.5),
                        marginTop: 8,
                      }}
                    >
                      {card.body}
                    </div>

                    <div style={{ marginTop: 20 }}>
                      <Rail
                        progress={0.28 + index * 0.12}
                        height={3}
                        color={card.accent}
                        glow={false}
                      />
                    </div>
                  </GlowCard>
                </div>
              );
            })}
          </div>
        </Frame>

        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '38%',
              height: 2,
              background: `linear-gradient(90deg, transparent, ${rgba(T.lilac, 0.35)}, transparent)`,
              opacity: frame > 66 && frame < 70 ? 0.9 : 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '47%',
              height: 1,
              background: `linear-gradient(90deg, transparent, ${rgba('#ff3b6b', 0.3)}, transparent)`,
              opacity: frame > 118 && frame < 122 ? 0.8 : 0,
            }}
          />
        </AbsoluteFill>

        <Brackets size={22} color={rgba(T.gold, 0.2)} inset={40} />

        <Caption
          text={script.caption}
          opacity={interpolate(frame, [128, 150], [0, 1], { extrapolateRight: 'clamp' })}
        />
      </Stage>
    </SceneShell>
  );
}
