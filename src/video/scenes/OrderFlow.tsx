import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { Act, Chip, CrystalText, GoldText, Panel, Particles, Slam, Wipe } from '../components/kit';
import { FILM } from '../data';
import { faNumber } from '../../lib/fa';
import { SCRIPT } from '../script';
import { C, FONT, clamp, ramp } from '../theme';

function QrGrid() {
  const frame = useCurrentFrame();
  const cells = Array.from({ length: 17 * 17 }).map((_, i) => {
    const r = Math.floor(i / 17);
    const c = i % 17;
    const finder =
      (r < 5 && c < 5) || (r < 5 && c > 11) || (r > 11 && c < 5)
        ? (r === 0 || r === 4 || c === 0 || c === 4 || (r === 2 && c === 2)) &&
          !(r === 1 && c === 1) &&
          !(r === 3 && c === 3)
        : false;
    const on = finder || random(`qr-${r}-${c}`) > 0.52;
    const flicker = r === Math.floor((frame * 0.9) % 17) && frame < 60;
    return { r, c, on, flicker };
  });

  return (
    <div
      style={{
        position: 'relative',
        width: 238,
        height: 238,
        display: 'grid',
        gridTemplateColumns: 'repeat(17, 1fr)',
        gridTemplateRows: 'repeat(17, 1fr)',
        gap: 2,
        padding: 8,
        borderRadius: 10,
        background: 'rgba(255,255,255,0.96)',
      }}
    >
      {cells.map((cell, i) => (
        <div
          key={i}
          style={{
            borderRadius: 1,
            background: cell.on ? (cell.flicker ? C.gold : '#120a24') : 'transparent',
            opacity: cell.on ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
}

export function OrderFlow() {
  const frame = useCurrentFrame();
  const stage = interpolate(frame, [0, 300], [1.02, 1.1]);
  const scan = ramp(frame, 16, 30, Easing.inOut(Easing.cubic));
  const phoneIn = ramp(frame, 0, 18, Easing.out(Easing.exp));
  const events = FILM.events.slice(0, 11);

  return (
    <Act seed={34} shards={6} caption={SCRIPT.order.caption} captionStart={12}>
      <AbsoluteFill style={{ transform: `scale(${stage})` }}>
        <div style={{ position: 'absolute', right: 128, top: 150, direction: 'rtl', width: 760 }}>
          <Slam start={2} from={2.6} duration={14}>
            <CrystalText size={76} weight={800}>
              {SCRIPT.order.title}
            </CrystalText>
          </Slam>
        </div>

        {/* Phone + QR */}
        <div
          style={{
            position: 'absolute',
            right: 250,
            top: 330,
            width: 372,
            height: 588,
            perspective: 1200,
            opacity: phoneIn,
            transform: `translateY(${(1 - phoneIn) * 140}px) rotateY(${-18 + (1 - phoneIn) * 12}deg) rotateX(7deg) scale(${0.94 + phoneIn * 0.06})`,
          }}
        >
          <Panel
            pad={26}
            glow={0.9}
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 120,
                height: 6,
                borderRadius: 99,
                background: 'rgba(255,255,255,0.18)',
              }}
            />
            <div style={{ marginTop: 28, position: 'relative' }}>
              <QrGrid />
              <div
                style={{
                  position: 'absolute',
                  left: 6,
                  right: 6,
                  top: 6 + scan * 210,
                  height: 3,
                  background: C.goldHi,
                  boxShadow: `0 0 26px ${C.gold}, 0 0 60px ${C.gold}`,
                  opacity: scan > 0 && scan < 1 ? 1 : 0,
                }}
              />
            </div>
            <div style={{ marginTop: 30, width: '100%', direction: 'rtl' }}>
              <GoldText size={27}>{faNumber(FILM.sample.total)} تومان</GoldText>
              <div style={{ marginTop: 10, fontFamily: FONT, fontSize: 20, color: C.mist }}>
                {FILM.sample.customerNameFa} · {FILM.sample.tableFa ?? 'بیرون‌بر'}
              </div>
            </div>
            <div style={{ marginTop: 22, display: 'flex', gap: 8 }}>
              <Chip tone="crystal">{FILM.sample.reference}</Chip>
              <Chip tone="violet">QR</Chip>
            </div>
          </Panel>
        </div>

        {/* Pipeline */}
        <div style={{ position: 'absolute', left: 104, top: 330, width: 660 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              direction: 'rtl',
              marginBottom: 12,
            }}
          >
            <span style={{ fontFamily: FONT, fontSize: 19, color: C.dim }}>رویداد</span>
            <span style={{ fontFamily: FONT, fontSize: 19, color: C.dim }}>وضعیت</span>
          </div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {events.map((event, index) => {
              const at = 74 + index * 7;
              const t = ramp(frame, at, 10, Easing.out(Easing.exp));
              const active = frame >= at && frame < at + 26;
              return (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    direction: 'rtl',
                    height: 34,
                    padding: '0 12px',
                    borderRadius: 9,
                    border: `1px solid ${active ? 'rgba(232,180,92,0.45)' : 'rgba(196,181,253,0.10)'}`,
                    background: active ? 'rgba(232,180,92,0.10)' : 'rgba(255,255,255,0.025)',
                    opacity: clamp(t * 1.2),
                    transform: `translateX(${(1 - t) * 40}px)`,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      display: 'grid',
                      placeItems: 'center',
                      fontFamily: FONT,
                      fontSize: 12,
                      color: active ? C.goldHi : C.dim,
                      border: `1px solid ${active ? 'rgba(232,180,92,0.5)' : 'rgba(255,255,255,0.12)'}`,
                    }}
                  >
                    {faNumber(index + 1)}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontFamily: FONT,
                      fontSize: 19,
                      color: active ? C.crystal : C.mist,
                    }}
                  >
                    {event.titleFa}
                  </span>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 99,
                      background: active ? C.gold : 'rgba(168,85,247,0.55)',
                      boxShadow: active ? `0 0 14px ${C.gold}` : undefined,
                    }}
                  />
                </div>
              );
            })}
            <div
              style={{
                position: 'absolute',
                right: 35,
                top: `${clamp((frame - 74) / 77) * 100}%`,
                width: 2,
                height: 30,
                background: `linear-gradient(180deg, transparent, ${C.goldHi})`,
                opacity: frame > 70 && frame < 190 ? 0.9 : 0,
              }}
            />
          </div>
        </div>

        {/* Receipt */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 128,
            transform: `translateX(-50%) translateY(${(1 - ramp(frame, 196, 22, Easing.out(Easing.exp))) * 120}px)`,
            opacity: ramp(frame, 196, 14),
          }}
        >
          <Panel pad={24} glow={0.7} style={{ width: 560, direction: 'rtl' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 14, color: C.dim }}>رسید دیجیتال</div>
                <div style={{ marginTop: 4, fontFamily: FONT, fontSize: 25, color: C.crystal }}>
                  {FILM.sample.items[0]?.nameFa ?? 'سفارش'}
                </div>
              </div>
              <Slam start={204} from={2.2} duration={12}>
                <Chip tone="gold">{SCRIPT.order.receipt}</Chip>
              </Slam>
            </div>
            <div style={{ marginTop: 12, fontFamily: FONT, fontSize: 17, color: C.mist }}>
              {faNumber(FILM.sample.items[0]?.quantity ?? 1)} × ·{' '}
              {faNumber(FILM.sample.prepMinutes)} دقیقه · یازده رویداد ثبت شد
            </div>
          </Panel>
        </div>
      </AbsoluteFill>

      <Particles at={82} count={22} x={20} y={50} />
      <Wipe at={286} />
    </Act>
  );
}
