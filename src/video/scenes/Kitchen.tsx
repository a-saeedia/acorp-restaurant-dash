import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { Act, Chip, CrystalText, GoldText, Panel, Ring, Slam, Wipe } from '../components/kit';
import { FILM } from '../data';
import { faNumber } from '../../lib/fa';
import { SCRIPT } from '../script';
import { C, FONT, clamp, ramp } from '../theme';

const COLUMNS = [
  { label: 'در انتظار', tone: 'rgba(168,85,247,0.5)' },
  { label: 'در حال پخت', tone: 'rgba(232,180,92,0.6)' },
  { label: 'آماده', tone: 'rgba(196,181,253,0.6)' },
] as const;

export function Kitchen() {
  const frame = useCurrentFrame();
  const orders = FILM.after.orders.slice(0, 3);
  const hero = orders[0];
  const focus = ramp(frame, 116, 26, Easing.inOut(Easing.cubic));
  const stamp = ramp(frame, 86, 12, Easing.out(Easing.exp));

  return (
    <Act seed={54} shards={5} caption={SCRIPT.kitchen.caption} captionStart={10}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', right: 128, top: 118, direction: 'rtl', width: 900 }}>
          <Slam start={0} from={2.4} duration={14}>
            <CrystalText size={74} weight={800}>
              {SCRIPT.kitchen.title}
            </CrystalText>
          </Slam>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 108,
            right: 108,
            top: 300,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 22,
            transform: `scale(${1 + focus * 0.12}) translateY(${-focus * 40}px)`,
          }}
        >
          {COLUMNS.map((column, columnIndex) => (
            <div key={column.label} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  direction: 'rtl',
                  fontFamily: FONT,
                  fontSize: 18,
                  color: C.mist,
                  padding: '0 4px',
                }}
              >
                <span>{column.label}</span>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: column.tone }} />
              </div>

              {orders.map((order, orderIndex) => {
                const at = 14 + columnIndex * 10 + orderIndex * 8;
                const t = ramp(frame, at, 12, Easing.out(Easing.exp));
                const move = ramp(
                  frame,
                  60 + orderIndex * 22 + columnIndex * 8,
                  18,
                  Easing.inOut(Easing.cubic),
                );
                const ready = frame > 96 + orderIndex * 14;
                return (
                  <div
                    key={order.id}
                    style={{
                      opacity: clamp(t),
                      transform: `translateY(${(1 - t) * 70 - move * 26}px) scale(${0.96 + t * 0.04})`,
                    }}
                  >
                    <Panel
                      pad={18}
                      glow={ready ? 0.7 : 0.3}
                      radius={16}
                      style={{
                        direction: 'rtl',
                        borderColor: ready ? 'rgba(232,180,92,0.38)' : 'rgba(196,181,253,0.14)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontFamily: FONT, fontSize: 20, color: C.crystal }}>
                          {order.customerNameFa}
                        </span>
                        <span style={{ fontFamily: FONT, fontSize: 14, color: C.dim }}>
                          {order.tableFa ?? 'بیرون‌بر'}
                        </span>
                      </div>
                      <div style={{ marginTop: 8, fontFamily: FONT, fontSize: 15, color: C.mist }}>
                        {order.items[0]?.nameFa ?? 'سفارش'}
                        {order.items.length > 1 ? ` + ${faNumber(order.items.length - 1)}` : ''}
                      </div>
                      <div
                        style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              height: 6,
                              borderRadius: 99,
                              background: 'rgba(255,255,255,0.08)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${clamp((frame - at) / 100) * 100}%`,
                                background: ready
                                  ? 'linear-gradient(90deg, #e8b45c, #ffd98a)'
                                  : 'linear-gradient(90deg, #7c3aed, #a855f7)',
                              }}
                            />
                          </div>
                        </div>
                        <span style={{ fontFamily: FONT, fontSize: 13, color: C.dim }}>
                          {ready
                            ? 'آماده'
                            : `${faNumber(Math.max(0, 6 - Math.floor((frame - at) / 18)))} دقیقه`}
                        </span>
                      </div>
                    </Panel>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Hero ticket + pass timer */}
        <div
          style={{
            position: 'absolute',
            left: 96,
            bottom: 110,
            width: 560,
            opacity: focus,
            transform: `translateX(${(1 - focus) * -60}px)`,
          }}
        >
          <Panel pad={20} glow={0.8} style={{ direction: 'rtl' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <Ring value={0.74} start={122} duration={40} size={96} stroke={7} color="gold">
                <GoldText size={22}>{faNumber(FILM.sample.prepMinutes)}′</GoldText>
              </Ring>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 15, color: C.dim }}>تیکت فعال</div>
                <div style={{ fontFamily: FONT, fontSize: 24, color: C.crystal }}>
                  {hero?.items[0]?.nameFa ?? 'سفارش'}
                </div>
                <div style={{ marginTop: 6 }}>
                  <Chip tone={stamp > 0.5 ? 'gold' : 'violet'}>
                    {stamp > 0.5 ? 'تحویل به سالن' : 'در حال پخت'}
                  </Chip>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </AbsoluteFill>
      <Wipe at={230} />
    </Act>
  );
}
