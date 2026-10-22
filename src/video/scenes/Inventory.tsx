import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import {
  Act,
  Chip,
  CrystalText,
  GoldText,
  Meter,
  Panel,
  Particles,
  Ring,
  Slam,
  Wipe,
} from '../components/kit';
import { FILM } from '../data';
import { faNumber } from '../../lib/fa';
import { SCRIPT } from '../script';
import { C, FONT, clamp, ramp } from '../theme';

export function Inventory() {
  const frame = useCurrentFrame();
  const hero = FILM.lowStock[0] ?? FILM.inventory[0];
  const request = FILM.after.purchaseRequests[0];
  const crack = ramp(frame, 76, 14) * (1 - ramp(frame, 150, 20));
  const requestIn = ramp(frame, 138, 22, Easing.out(Easing.exp));

  if (!hero) return null;

  return (
    <Act seed={68} shards={6} caption={SCRIPT.inventory.caption} captionStart={12}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', right: 128, top: 118, direction: 'rtl', width: 860 }}>
          <Slam start={0} from={2.4} duration={14}>
            <CrystalText size={74} weight={800}>
              {SCRIPT.inventory.title}
            </CrystalText>
          </Slam>
        </div>

        {/* Hero gauge */}
        <div
          style={{
            position: 'absolute',
            left: 168,
            top: 300,
            width: 520,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Ring
            value={clamp(hero.level)}
            start={10}
            duration={34}
            size={330}
            stroke={18}
            color="gold"
          >
            <div style={{ direction: 'rtl', textAlign: 'center' }}>
              <GoldText size={62}>{faNumber(hero.quantity)}</GoldText>
              <div style={{ fontFamily: FONT, fontSize: 17, color: C.mist }}>
                {hero.ingredient.unitLabelFa}
              </div>
            </div>
          </Ring>
          <div style={{ marginTop: 6, fontFamily: FONT, fontSize: 24, color: C.crystal }}>
            {hero.ingredient.nameFa}
          </div>
          <div style={{ marginTop: 10 }}>
            <Chip tone={hero.level < 1 ? 'danger' : 'gold'}>
              {faNumber(Math.round(hero.level * 100))}٪ از آستانه
            </Chip>
          </div>
        </div>

        {/* Secondary rows */}
        <div
          style={{
            position: 'absolute',
            left: 760,
            top: 350,
            width: 520,
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
          }}
        >
          {FILM.lowStock.slice(0, 3).map((row, index) => (
            <div key={row.ingredient.id} style={{ direction: 'rtl' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: FONT, fontSize: 19, color: C.mist }}>
                  {row.ingredient.nameFa}
                </span>
                <span style={{ fontFamily: FONT, fontSize: 16, color: C.dim }}>
                  {faNumber(row.quantity)} / {faNumber(row.ingredient.reorderThreshold)}
                </span>
              </div>
              <Meter
                value={clamp(row.level)}
                start={20}
                delay={index * 6}
                color="#ff8a94"
                height={9}
              />
            </div>
          ))}
          <div
            style={{ marginTop: 6, direction: 'rtl', fontFamily: FONT, fontSize: 16, color: C.dim }}
          >
            ارزش موجودی انبار: {faNumber(FILM.analytics.inventoryValue)} تومان
          </div>
        </div>

        {/* Crack */}
        <svg
          width={1920}
          height={1080}
          style={{ position: 'absolute', inset: 0, opacity: crack * 0.9, pointerEvents: 'none' }}
        >
          <path
            d="M960 520 L820 300 L700 340 M960 520 L1090 250 L1230 300 M960 520 L780 760 L640 900 M960 520 L1150 780 L1290 930"
            stroke="rgba(255,140,150,0.7)"
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d="M960 520 L900 420 L940 330 M960 520 L1040 640 L1010 740"
            stroke="rgba(232,180,92,0.6)"
            strokeWidth="1.6"
            fill="none"
          />
        </svg>

        {/* Auto purchase request */}
        <div
          style={{
            position: 'absolute',
            right: 150,
            bottom: 132,
            width: 640,
            opacity: requestIn,
            transform: `translateY(${(1 - requestIn) * 80}px) rotateX(${(1 - requestIn) * -10}deg)`,
            perspective: 900,
          }}
        >
          <Panel
            pad={22}
            glow={0.9}
            style={{
              direction: 'rtl',
              borderColor: 'rgba(232,180,92,0.4)',
              background: 'rgba(28,15,52,0.88)',
            }}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 14,
                    color: C.goldHi,
                    letterSpacing: '0.06em',
                  }}
                >
                  {SCRIPT.inventory.request}
                </div>
                <div style={{ marginTop: 8, fontFamily: FONT, fontSize: 26, color: C.crystal }}>
                  {request?.ingredientNameFa ?? hero.ingredient.nameFa}
                </div>
                <div style={{ marginTop: 6, fontFamily: FONT, fontSize: 16, color: C.mist }}>
                  {request?.supplierNameFa ?? hero.supplierNameFa}
                </div>
              </div>
              <Slam start={148} from={2.4} duration={12}>
                <GoldText size={30}>
                  {faNumber(request?.recommendedQuantity ?? hero.ingredient.reorderQuantity)}{' '}
                  {request?.unitLabelFa ?? hero.ingredient.unitLabelFa}
                </GoldText>
              </Slam>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <Chip tone="gold">تأیید مدیر</Chip>
              <Chip tone="crystal">فاکتور خودکار</Chip>
              <Chip tone="violet">بدون تماس</Chip>
            </div>
          </Panel>
        </div>
      </AbsoluteFill>

      <Particles at={80} count={18} x={27} y={48} color="#ff8a94" />
      <Wipe at={232} />
    </Act>
  );
}
