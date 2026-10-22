import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import {
  Act,
  Chip,
  CrystalText,
  GoldText,
  Meter,
  Panel,
  Ring,
  Slam,
  Spark,
  Wipe,
} from '../components/kit';
import { FILM } from '../data';
import { faMoneyCompact, faNumber, faPercent } from '../../lib/fa';
import { SCRIPT } from '../script';
import { C, FONT, ramp } from '../theme';

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'gold' }) {
  return (
    <Panel pad={14} glow={0.5} radius={14} style={{ direction: 'rtl' }}>
      <div style={{ fontFamily: FONT, fontSize: 14, color: C.mist }}>{label}</div>
      <div style={{ marginTop: 5 }}>
        {tone === 'gold' ? (
          <GoldText size={21}>{value}</GoldText>
        ) : (
          <span style={{ fontFamily: FONT, fontSize: 24, color: C.crystal }}>{value}</span>
        )}
      </div>
    </Panel>
  );
}

export function Product() {
  const frame = useCurrentFrame();
  const { pnl, daily } = FILM.analytics;
  const orbit = interpolate(frame, [0, 240], [-13, -3]);
  const tilt = interpolate(frame, [0, 240], [9, 3]);
  const push = interpolate(frame, [0, 240], [0.96, 1.08]);
  const max = Math.max(1, ...daily.map((d) => d.netSales));
  const points = daily.slice(-18).map((d) => d.netSales / max);

  return (
    <Act seed={110} shards={4} grid streak={0.6}>
      <AbsoluteFill style={{ perspective: 1700, display: 'grid', placeItems: 'center' }}>
        <div
          style={{
            width: 1560,
            height: 880,
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `scale(${push}) rotateY(${orbit}deg) rotateX(${tilt}deg)`,
          }}
        >
          <Slam start={0} from={1.6} duration={18} style={{ position: 'absolute', inset: 0 }}>
            <Panel
              pad={0}
              glow={1}
              radius={26}
              style={{ height: '100%', overflow: 'hidden', background: 'rgba(11,6,21,0.92)' }}
            >
              {/* top bar */}
              <div
                style={{
                  height: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 26px',
                  direction: 'rtl',
                  borderBottom: '1px solid rgba(196,181,253,0.12)',
                  background: 'rgba(124,58,237,0.10)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CrystalText size={24} weight={900}>
                    {SCRIPT.brand}
                  </CrystalText>
                  <span style={{ fontFamily: FONT, fontSize: 15, color: C.mist }}>
                    داشبورد عملیات
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Chip tone="gold" size={12}>
                    شبِ کاری
                  </Chip>
                  <Chip tone="crystal" size={12}>
                    {faNumber(FILM.analytics.orderCount)} سفارش
                  </Chip>
                </div>
              </div>

              <div style={{ display: 'flex', height: 'calc(100% - 64px)', direction: 'rtl' }}>
                {/* sidebar (right, RTL) */}
                <div
                  style={{
                    width: 190,
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    borderLeft: '1px solid rgba(196,181,253,0.10)',
                    direction: 'rtl',
                  }}
                >
                  {['نمای کلی', 'سفارش‌ها', 'آشپزخانه', 'انبار', 'گزارش‌ها', 'بازاریابی'].map(
                    (item, index) => (
                      <div
                        key={item}
                        style={{
                          padding: '9px 12px',
                          borderRadius: 9,
                          fontFamily: FONT,
                          fontSize: 14,
                          color: index === 0 ? C.goldHi : C.mist,
                          background: index === 0 ? 'rgba(232,180,92,0.10)' : 'transparent',
                          border: `1px solid ${index === 0 ? 'rgba(232,180,92,0.25)' : 'transparent'}`,
                        }}
                      >
                        {item}
                      </div>
                    ),
                  )}
                  <div style={{ marginTop: 'auto' }}>
                    <Meter value={0.62} start={30} height={5} />
                    <div style={{ marginTop: 8, fontFamily: FONT, fontSize: 13, color: C.mist }}>
                      ظرفیت آشپزخانه
                    </div>
                  </div>
                </div>

                {/* main */}
                <div
                  style={{
                    flex: 1,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    <Kpi label="فروش امروز" value={faMoneyCompact(pnl.grossSales)} />
                    <Kpi
                      label="سود خالص"
                      value={faMoneyCompact(pnl.netOperatingProfit)}
                      tone="gold"
                    />
                    <Kpi
                      label="میانگین سفارش"
                      value={faMoneyCompact(FILM.analytics.averageOrderValue)}
                    />
                    <Kpi label="حاشیهٔ سود" value={faPercent(pnl.netMarginPct)} />
                  </div>

                  <div
                    style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, flex: 1 }}
                  >
                    <Panel
                      pad={16}
                      glow={0.5}
                      style={{ direction: 'rtl', display: 'flex', flexDirection: 'column' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontFamily: FONT, fontSize: 14, color: C.mist }}>
                          روند فروش
                        </span>
                        <GoldText size={13}>۳۰ روز</GoldText>
                      </div>
                      <div style={{ marginTop: 8, flex: 1, display: 'grid', placeItems: 'center' }}>
                        <Spark points={points} start={14} duration={44} width={640} height={250} />
                      </div>
                    </Panel>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <Panel
                        pad={14}
                        glow={0.6}
                        style={{ direction: 'rtl', display: 'flex', alignItems: 'center', gap: 14 }}
                      >
                        <Ring
                          value={pnl.netMarginPct / 100}
                          start={20}
                          duration={34}
                          size={96}
                          stroke={8}
                          color="gold"
                        >
                          <span style={{ fontFamily: FONT, fontSize: 15, color: C.crystal }}>
                            {faPercent(pnl.netMarginPct, 0)}
                          </span>
                        </Ring>
                        <div>
                          <div style={{ fontFamily: FONT, fontSize: 12, color: C.dim }}>
                            سود / فروش
                          </div>
                          <div style={{ marginTop: 4 }}>
                            <GoldText size={18}>{faMoneyCompact(pnl.netOperatingProfit)}</GoldText>
                          </div>
                        </div>
                      </Panel>

                      <Panel pad={14} glow={0.4} style={{ direction: 'rtl', flex: 1 }}>
                        <div
                          style={{ fontFamily: FONT, fontSize: 14, color: C.mist, marginBottom: 8 }}
                        >
                          آخرین سفارش‌ها
                        </div>
                        {FILM.after.orders.slice(0, 3).map((order, index) => (
                          <div
                            key={order.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '7px 0',
                              borderBottom: index < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                              opacity: ramp(frame, 26 + index * 8, 12),
                            }}
                          >
                            <span style={{ fontFamily: FONT, fontSize: 14, color: C.mist }}>
                              {order.customerNameFa}
                            </span>
                            <span style={{ fontFamily: FONT, fontSize: 11, color: C.goldHi }}>
                              {faMoneyCompact(order.total)}
                            </span>
                          </div>
                        ))}
                      </Panel>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          </Slam>

          {/* floating callouts */}
          <div style={{ position: 'absolute', left: -40, top: 120, opacity: ramp(frame, 60, 18) }}>
            <Chip tone="violet">همه چیز زنده</Chip>
          </div>
          <div
            style={{ position: 'absolute', left: -56, bottom: 150, opacity: ramp(frame, 96, 18) }}
          >
            <Chip tone="gold">فارسی · RTL</Chip>
          </div>
        </div>
      </AbsoluteFill>
      <Wipe at={228} />
    </Act>
  );
}
