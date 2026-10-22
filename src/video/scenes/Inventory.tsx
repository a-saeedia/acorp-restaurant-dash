import { PackageCheck, ShoppingCart, TriangleAlert } from 'lucide-react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Caption, Frame, SceneShell, Slug, Stage } from '../components/stage';
import { Brackets, Kinetic, Kicker, Particles, Rail, Shine } from '../components/kit';
import { faMoney, faNumber, faPercent } from '../../lib/fa';
import { STOCK_STATUS_FA } from '../../lib/labels';
import { inventoryRows, openPurchaseRequests } from '../../simulation/selectors';
import { SCRIPT } from '../script';
import { FILM } from '../data';
import { T, rgba } from '../theme';

const WATCHED = ['ing-beef', 'ing-cheese'] as const;

function polar(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function arc(cx: number, cy: number, radius: number, start: number, sweep: number) {
  const from = polar(cx, cy, radius, start);
  const to = polar(cx, cy, radius, start + sweep);
  const large = Math.abs(sweep) > 180 ? 1 : 0;
  return `M ${from.x} ${from.y} A ${radius} ${radius} 0 ${large} 1 ${to.x} ${to.y}`;
}

export function Inventory() {
  const frame = useCurrentFrame();
  const script = SCRIPT.Inventory;

  const beforeRows = inventoryRows(FILM.base).filter((row) =>
    WATCHED.includes(row.ingredient.id as (typeof WATCHED)[number]),
  );
  const afterRows = inventoryRows(FILM.after).filter((row) =>
    WATCHED.includes(row.ingredient.id as (typeof WATCHED)[number]),
  );
  const request = openPurchaseRequests(FILM.after).find((item) => item.ingredientId === 'ing-beef');

  const hero = afterRows[0];
  const heroBefore = beforeRows[0];
  const heroValue =
    hero && heroBefore
      ? interpolate(frame, [34, 176], [heroBefore.quantity, hero.quantity], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: (t) => t * t * (3 - 2 * t),
        })
      : 0;
  const threshold = hero?.ingredient.reorderThreshold ?? 1;
  const ratio = Math.max(0, Math.min(1, heroValue / (threshold * 2)));
  const belowThreshold = heroValue < threshold;
  const warning = belowThreshold
    ? interpolate(frame, [176, 186, 200, 210], [0, 1, 0.35, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;
  const slam = interpolate(frame, [248, 262], [1.14, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const slamIn = interpolate(frame, [240, 258], [0, 1], { extrapolateLeft: 'clamp' });

  return (
    <SceneShell id="Inventory" enter={14} exit={10}>
      <Stage tone="violet" gridOpacity={0.24}>
        <Slug label="Inventory" index="04" />
        <Particles
          count={30}
          seed={19}
          color={belowThreshold ? '#e08a4a' : T.gold}
          opacity={0.4}
          size={2.2}
        />

        <Frame align="top">
          <div
            style={{
              marginTop: 14,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <div>
              <Kicker start={0}>{script.kicker}</Kicker>
              <div style={{ marginTop: 8 }}>
                <Kinetic text={script.title} start={4} stagger={5} size={68} weight={760} />
              </div>
            </div>

            <div
              lang="fa"
              style={{
                display: 'flex',
                gap: 18,
                alignItems: 'center',
                fontSize: 16,
                color: rgba(T.cream, 0.42),
                opacity: interpolate(frame, [10, 28], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              <span>آستانهٔ سفارش</span>
              <span style={{ width: 18, height: 2, background: rgba('#e08a4a', 0.9) }} />
              <span>موجودی زنده</span>
              <span style={{ width: 18, height: 2, background: T.gold }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 34, marginTop: 40, alignItems: 'flex-start' }}>
            {/* Gauge */}
            <div
              style={{
                flex: '0 0 520px',
                position: 'relative',
                borderRadius: 24,
                border: `1px solid ${rgba(T.gold, 0.18)}`,
                background:
                  'linear-gradient(168deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012) 60%)',
                padding: '26px 30px 24px',
                boxShadow: `0 50px 100px -60px ${rgba(T.violet, 0.95)}`,
                overflow: 'hidden',
                opacity: interpolate(frame, [14, 34], [0, 1], { extrapolateRight: 'clamp' }),
              }}
            >
              <Brackets color={rgba(T.gold, 0.35)} />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span lang="fa" style={{ fontSize: 17, color: rgba(T.cream, 0.55) }}>
                  موجودی زنده
                </span>
                <span
                  lang="fa"
                  style={{
                    fontSize: 13,
                    padding: '5px 12px',
                    borderRadius: 999,
                    border: `1px solid ${rgba(belowThreshold ? '#e08a4a' : T.gold, 0.4)}`,
                    background: rgba(belowThreshold ? '#e08a4a' : T.gold, 0.12),
                    color: belowThreshold ? '#f3b183' : T.goldHi,
                  }}
                >
                  {belowThreshold ? 'کسری' : 'سالم'}
                </span>
              </div>

              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <svg width={420} height={330} viewBox="0 0 420 330" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="gaugeGold" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stopColor={T.violet} />
                      <stop offset="52%" stopColor={T.gold} />
                      <stop offset="100%" stopColor={T.goldHi} />
                    </linearGradient>
                    <filter id="gaugeGlow" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <path
                    d={arc(210, 190, 138, 140, 260)}
                    fill="none"
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth={18}
                    strokeLinecap="round"
                  />
                  <path
                    d={arc(210, 190, 138, 140, 260)}
                    fill="none"
                    stroke="url(#gaugeGold)"
                    strokeWidth={18}
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 138}
                    strokeDashoffset={(2 * Math.PI * 138 * (1 - ratio)) / 1.0}
                    filter="url(#gaugeGlow)"
                    opacity={0.95}
                  />

                  {/* threshold tick */}
                  {(() => {
                    const angle = 140 + 260 * 0.5;
                    const outer = polar(210, 190, 152, angle);
                    const inner = polar(210, 190, 118, angle);
                    return (
                      <line
                        x1={inner.x}
                        y1={inner.y}
                        x2={outer.x}
                        y2={outer.y}
                        stroke="#e08a4a"
                        strokeWidth={3}
                        strokeDasharray="4 4"
                        opacity={0.9}
                      />
                    );
                  })()}

                  <circle
                    cx={210}
                    cy={190}
                    r={110}
                    fill="none"
                    stroke={rgba(T.gold, 0.1)}
                    strokeWidth={1}
                  />
                </svg>

                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 204,
                    height: 204,
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    background:
                      'radial-gradient(circle at 50% 50%, rgba(13,8,22,0.95) 0%, rgba(13,8,22,0.92) 58%, rgba(13,8,22,0) 74%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    lang="fa"
                    style={{ fontSize: 15, color: rgba(T.cream, 0.42), marginBottom: 10 }}
                  >
                    {hero?.ingredient.nameFa ?? 'گوشت چرخ‌کرده'}
                  </div>
                  <div
                    style={{
                      fontSize: 44,
                      fontWeight: 780,
                      letterSpacing: '-0.02em',
                      fontVariantNumeric: 'tabular-nums',
                      color: belowThreshold ? '#f3b183' : T.cream,
                      textShadow: `0 0 40px ${rgba(belowThreshold ? '#e08a4a' : T.gold, 0.5)}`,
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'center',
                      gap: 5,
                      maxWidth: 200,
                    }}
                  >
                    {faNumber(Math.round(heroValue))}
                    <span style={{ fontSize: 14, color: rgba(T.cream, 0.45), fontWeight: 500 }}>
                      {hero?.ingredient.unitLabelFa}
                    </span>
                  </div>
                  <div lang="fa" style={{ fontSize: 13, color: rgba(T.cream, 0.38), marginTop: 6 }}>
                    آستانه: {faNumber(threshold)} {hero?.ingredient.unitLabelFa}
                  </div>

                  {belowThreshold ? (
                    <div
                      style={{
                        marginTop: 10,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 13,
                        color: '#f3b183',
                        opacity: warning,
                        transform: `translateY(${(1 - warning) * 8}px)`,
                      }}
                      lang="fa"
                    >
                      <TriangleAlert size={15} />
                      از آستانه پایین‌تر رفت
                    </div>
                  ) : null}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: -6 }}>
                <span lang="fa" style={{ fontSize: 14, color: rgba(T.cream, 0.32) }}>
                  ۰
                </span>
                <span lang="fa" style={{ fontSize: 14, color: rgba(T.cream, 0.32) }}>
                  {faNumber(threshold * 2)} {hero?.ingredient.unitLabelFa}
                </span>
              </div>
            </div>

            {/* Rows + purchase request */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {afterRows.map((row, index) => {
                const before = beforeRows.find((item) => item.ingredient.id === row.ingredient.id);
                const start = 28 + index * 16;
                const progress = interpolate(frame, [start, start + 70], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                const level = interpolate(
                  progress,
                  [0, 1],
                  [before?.level ?? row.level, row.level],
                );
                const quantity = Math.round(
                  interpolate(progress, [0, 1], [before?.quantity ?? row.quantity, row.quantity]),
                );
                const isLow = row.status === 'low';

                return (
                  <div
                    key={row.ingredient.id}
                    style={{
                      opacity: interpolate(frame, [start, start + 18], [0, 1], {
                        extrapolateRight: 'clamp',
                      }),
                      transform: `translateX(${interpolate(frame, [start, start + 24], [42, 0], {
                        extrapolateRight: 'clamp',
                        easing: (t) => 1 - Math.pow(1 - t, 3),
                      })}px)`,
                      borderRadius: 18,
                      border: `1px solid ${isLow ? rgba('#e08a4a', 0.34) : rgba(T.cream, 0.09)}`,
                      background:
                        'linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.008))',
                      padding: '22px 26px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            display: 'grid',
                            placeItems: 'center',
                            background: rgba(isLow ? '#e08a4a' : T.gold, 0.13),
                            border: `1px solid ${rgba(isLow ? '#e08a4a' : T.gold, 0.3)}`,
                            color: isLow ? '#f3b183' : T.gold,
                          }}
                        >
                          <ShoppingCart size={17} strokeWidth={1.8} />
                        </span>
                        <span lang="fa" style={{ fontSize: 24, fontWeight: 650 }}>
                          {row.ingredient.nameFa}
                        </span>
                        {isLow ? (
                          <span
                            lang="fa"
                            style={{
                              fontSize: 13,
                              padding: '4px 11px',
                              borderRadius: 999,
                              background: rgba('#e08a4a', 0.16),
                              color: '#f3b183',
                              border: `1px solid ${rgba('#e08a4a', 0.4)}`,
                            }}
                          >
                            {STOCK_STATUS_FA[row.status]}
                          </span>
                        ) : null}
                      </div>
                      <span
                        style={{
                          fontSize: 28,
                          fontWeight: 700,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {faNumber(quantity)}
                        <span
                          style={{ fontSize: 15, color: rgba(T.cream, 0.4), marginInlineStart: 6 }}
                        >
                          {row.ingredient.unitLabelFa}
                        </span>
                      </span>
                    </div>

                    <div style={{ marginTop: 18 }}>
                      <Rail
                        progress={Math.min(1, level / 100)}
                        rtl
                        height={9}
                        color={isLow ? '#e08a4a' : T.gold}
                      />
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 10,
                        fontSize: 14,
                        color: rgba(T.cream, 0.4),
                      }}
                      lang="fa"
                    >
                      <span>
                        آستانه {faNumber(row.ingredient.reorderThreshold)}{' '}
                        {row.ingredient.unitLabelFa}
                      </span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {faPercent(Math.max(0, Math.round(level)), 0)} از ظرفیت
                      </span>
                    </div>
                  </div>
                );
              })}

              {request ? (
                <div
                  style={{
                    marginTop: 4,
                    opacity: slamIn,
                    transform: `scale(${slam}) translateY(${(1 - slamIn) * 40}px)`,
                    borderRadius: 20,
                    border: `1px solid ${rgba(T.gold, 0.42)}`,
                    background: `linear-gradient(158deg, ${rgba(T.gold, 0.16)}, rgba(20,12,34,0.85) 62%)`,
                    padding: '24px 26px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: `0 0 70px -20px ${rgba(T.gold, 0.5)}`,
                  }}
                >
                  <Brackets color={rgba(T.gold, 0.55)} />
                  <Shine at={256} duration={26} opacity={0.3} />

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 10, color: T.goldHi }}
                    >
                      <PackageCheck size={18} />
                      <span lang="fa" style={{ fontSize: 16 }}>
                        پیشنهاد خرید خودکار
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        color: T.gold,
                        letterSpacing: '0.12em',
                        direction: 'ltr',
                      }}
                    >
                      AUTO
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      marginTop: 16,
                    }}
                  >
                    <div>
                      <div lang="fa" style={{ fontSize: 26, fontWeight: 720 }}>
                        {faNumber(request.recommendedQuantity)} {request.unitLabelFa}
                      </div>
                      <div
                        lang="fa"
                        style={{ fontSize: 17, color: rgba(T.cream, 0.45), marginTop: 4 }}
                      >
                        {request.ingredientNameFa} · {request.supplierNameFa}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 700,
                        color: T.goldHi,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {faMoney(request.estimatedCost)}
                    </div>
                  </div>

                  <div style={{ marginTop: 18 }}>
                    <Rail
                      progress={interpolate(frame, [262, 300], [0, 1], {
                        extrapolateRight: 'clamp',
                      })}
                      height={4}
                    />
                  </div>

                  <div
                    lang="fa"
                    style={{
                      marginTop: 12,
                      fontSize: 14,
                      color: rgba(T.cream, 0.42),
                      lineHeight: 1.7,
                    }}
                  >
                    چون موجودی از آستانه پایین‌تر رفت، درخواست ساخته شد — نه وقتی غذا تمام شد.
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Frame>

        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            background: `radial-gradient(circle at 26% 46%, ${rgba('#e08a4a', 0.16 * warning)}, transparent 44%)`,
          }}
        />

        <Caption
          text={script.caption}
          opacity={interpolate(frame, [214, 236], [0, 1], { extrapolateRight: 'clamp' })}
        />
      </Stage>
    </SceneShell>
  );
}
