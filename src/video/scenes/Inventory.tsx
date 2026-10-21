import { PackageCheck, ShoppingCart } from 'lucide-react';
import { interpolate, useCurrentFrame } from 'remotion';
import { Reveal } from '../components/motion';
import { Caption, Frame, Kicker, Stage } from '../components/stage';
import { faMoney, faNumber, faPercent } from '../../lib/fa';
import { STOCK_STATUS_FA } from '../../lib/labels';
import { inventoryRows, openPurchaseRequests } from '../../simulation/selectors';
import { SCRIPT } from '../script';
import { FILM } from '../data';

const WATCHED = ['ing-beef', 'ing-cheese'] as const;
const SCALE = 1.7; // bar domain: 0 → 170% of the reorder threshold

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

  return (
    <Stage bloom="right">
      <Frame align="top">
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <Reveal start={0}>
              <Kicker>{script.kicker}</Kicker>
            </Reveal>
            <Reveal start={4} y={22}>
              <h1
                lang="fa"
                style={{ fontSize: 68, fontWeight: 750, margin: 0, letterSpacing: '-0.03em' }}
              >
                {script.title}
              </h1>
            </Reveal>
          </div>
          <Reveal start={10}>
            <div
              lang="fa"
              style={{
                fontSize: 17,
                color: 'rgba(242,238,231,0.42)',
                display: 'flex',
                gap: 18,
                alignItems: 'center',
              }}
            >
              <span>آستانهٔ سفارش</span>
              <span style={{ width: 18, height: 2, background: 'rgba(217,107,51,0.8)' }} />
              <span>موجودی زنده</span>
              <span style={{ width: 18, height: 2, background: '#e3a854' }} />
            </div>
          </Reveal>
        </div>

        <div style={{ display: 'flex', gap: 30, marginTop: 46, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 22 }}>
            {afterRows.map((row, index) => {
              const before = beforeRows.find((item) => item.ingredient.id === row.ingredient.id);
              const start = 26 + index * 18;
              const progress = interpolate(frame, [start, start + 60], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              const level = interpolate(progress, [0, 1], [before?.level ?? row.level, row.level]);
              const quantity = Math.round(
                interpolate(progress, [0, 1], [before?.quantity ?? row.quantity, row.quantity]),
              );
              const isLow = row.status === 'low';

              return (
                <Reveal key={row.ingredient.id} start={start} y={26}>
                  <div
                    style={{
                      border: '1px solid rgba(255,255,255,0.09)',
                      background:
                        'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012))',
                      borderRadius: 20,
                      padding: '26px 28px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 11,
                            display: 'grid',
                            placeItems: 'center',
                            background: isLow ? 'rgba(217,107,51,0.16)' : 'rgba(227,168,84,0.13)',
                            color: isLow ? '#e88a58' : '#e3a854',
                          }}
                        >
                          <ShoppingCart size={18} strokeWidth={1.8} />
                        </span>
                        <span lang="fa" style={{ fontSize: 25, fontWeight: 650 }}>
                          {row.ingredient.nameFa}
                        </span>
                        {isLow ? (
                          <span
                            lang="fa"
                            style={{
                              fontSize: 14,
                              padding: '5px 12px',
                              borderRadius: 999,
                              background: 'rgba(217,107,51,0.16)',
                              color: '#f0a077',
                              border: '1px solid rgba(217,107,51,0.35)',
                            }}
                          >
                            {STOCK_STATUS_FA[row.status]}
                          </span>
                        ) : null}
                      </div>
                      <span
                        style={{
                          fontSize: 30,
                          fontWeight: 700,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {faNumber(quantity)}{' '}
                        <span style={{ fontSize: 16, color: 'rgba(242,238,231,0.4)' }}>
                          {row.ingredient.unitLabelFa}
                        </span>
                      </span>
                    </div>

                    <div
                      style={{
                        position: 'relative',
                        height: 10,
                        borderRadius: 99,
                        background: 'rgba(255,255,255,0.07)',
                        marginTop: 22,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          // `level` is 0–100 where 100 = 200% of the reorder
                          // threshold, so the ratio is level / 50.
                          width: `${Math.min(100, (level / 50 / SCALE) * 100)}%`,
                          borderRadius: 99,
                          background: isLow
                            ? 'linear-gradient(90deg, #d96b33, #e8a058)'
                            : 'linear-gradient(90deg, #b98a45, #e3a854)',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: -4,
                          bottom: -4,
                          insetInlineStart: `${(1 / SCALE) * 100}%`,
                          width: 2,
                          background: 'rgba(240,160,119,0.75)',
                        }}
                      />
                    </div>

                    <div
                      lang="fa"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 12,
                        fontSize: 16,
                        color: 'rgba(242,238,231,0.42)',
                      }}
                    >
                      <span>
                        آستانه: {faNumber(row.ingredient.reorderThreshold)}{' '}
                        {row.ingredient.unitLabelFa}
                      </span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {faPercent((level / 50) * 100, 0)} از آستانه
                      </span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {request ? (
            <Reveal start={118} x={40} y={0} style={{ flex: '0 0 470px' }}>
              <div
                style={{
                  border: '1px solid rgba(227,168,84,0.34)',
                  background:
                    'linear-gradient(180deg, rgba(227,168,84,0.12), rgba(227,168,84,0.03))',
                  borderRadius: 22,
                  padding: '28px 28px 26px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#f0c98c' }}>
                  <PackageCheck size={18} />
                  <span lang="fa" style={{ fontSize: 17 }}>
                    پیشنهاد خرید خودکار
                  </span>
                </div>

                <div
                  lang="fa"
                  style={{ fontSize: 27, fontWeight: 700, marginTop: 20, lineHeight: 1.4 }}
                >
                  {faNumber(request.recommendedQuantity)} {request.unitLabelFa}
                  <br />
                  {request.ingredientNameFa}
                </div>

                <div
                  style={{ height: 1, background: 'rgba(255,255,255,0.10)', margin: '22px 0' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17 }}>
                  <span style={{ color: 'rgba(242,238,231,0.45)' }}>تأمین‌کننده</span>
                  <span lang="fa">{request.supplierNameFa}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 17,
                    marginTop: 12,
                  }}
                >
                  <span style={{ color: 'rgba(242,238,231,0.45)' }}>هزینهٔ برآوردی</span>
                  <span style={{ color: '#f0c98c', fontWeight: 650 }}>
                    {faMoney(request.estimatedCost)}
                  </span>
                </div>

                <div
                  lang="fa"
                  style={{
                    marginTop: 24,
                    fontSize: 15,
                    lineHeight: 1.8,
                    color: 'rgba(242,238,231,0.45)',
                  }}
                >
                  چون موجودی از آستانه پایین‌تر رفت، درخواست ساخته شد — نه وقتی غذا تمام شد.
                </div>
              </div>
            </Reveal>
          ) : null}
        </div>
      </Frame>

      <Caption
        text={script.caption}
        opacity={interpolate(frame, [60, 80], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}
      />
    </Stage>
  );
}
