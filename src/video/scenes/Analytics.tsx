import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import {
  Act,
  Chip,
  Counter,
  CrystalText,
  GoldText,
  Panel,
  Ring,
  Slam,
  Spark,
} from '../components/kit';
import { FILM } from '../data';
import { faDelta, faMoney, faMoneyCompact, faNumber, faPercent } from '../../lib/fa';
import { SCRIPT } from '../script';
import { C, FONT, clamp, ramp } from '../theme';

export function Analytics() {
  const frame = useCurrentFrame();
  const { pnl, comparison, daily } = FILM.analytics;
  const max = Math.max(1, ...daily.map((day) => day.netSales));
  const points = daily.map((day) => day.netSales / max);
  const split = ramp(frame, 176, 26, Easing.inOut(Easing.cubic));

  return (
    <Act seed={82} shards={5} caption={SCRIPT.analytics.caption} captionStart={14}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', right: 128, top: 112, direction: 'rtl', width: 900 }}>
          <Slam start={0} from={2.4} duration={14}>
            <CrystalText size={74} weight={800}>
              {SCRIPT.analytics.title}
            </CrystalText>
          </Slam>
        </div>

        {/* Bars behind the line */}
        <div
          style={{
            position: 'absolute',
            left: 190,
            bottom: 250,
            width: 1180,
            height: 250,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 8,
            opacity: 0.55,
            transform: `scaleY(${0.9 + split * 0.1})`,
          }}
        >
          {daily.map((day, index) => {
            const t = ramp(frame, 16 + index, 18, Easing.out(Easing.cubic));
            return (
              <div
                key={day.dayKey}
                style={{
                  flex: 1,
                  height: `${clamp(day.netSales / max) * 100 * t}%`,
                  background: `linear-gradient(180deg, rgba(196,181,253,0.55), rgba(124,58,237,0.06))`,
                  borderRadius: '4px 4px 0 0',
                }}
              />
            );
          })}
        </div>

        <div style={{ position: 'absolute', left: 170, top: 262 }}>
          <Spark points={points} start={10} duration={46} width={1120} height={360} />
        </div>

        {/* KPI cluster */}
        <div
          style={{
            position: 'absolute',
            right: 132,
            top: 300,
            width: 470,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            direction: 'rtl',
          }}
        >
          <Panel pad={22} glow={0.8}>
            <div style={{ fontFamily: FONT, fontSize: 15, color: C.dim }}>
              سود خالص عملیاتی · ماه
            </div>
            <div style={{ marginTop: 8 }}>
              <Counter
                value={pnl.netOperatingProfit}
                start={26}
                duration={48}
                format={(n) => faMoney(n, { suffix: false })}
                size={46}
              />
              <span style={{ fontFamily: FONT, fontSize: 18, color: C.mist }}> تومان</span>
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <Chip tone={comparison.netProfitPct >= 0 ? 'gold' : 'danger'}>
                {comparison.netProfitPct >= 0 ? '+' : ''}
                {faDelta(comparison.netProfitPct)}
              </Chip>
              <Chip tone="violet">{faNumber(FILM.analytics.orderCount)} سفارش</Chip>
            </div>
          </Panel>

          <Panel pad={20} glow={0.5}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Ring
                value={pnl.netMarginPct / 100}
                start={38}
                duration={40}
                size={112}
                stroke={9}
                color="violet"
              >
                <GoldText size={22}>{faPercent(pnl.netMarginPct)}</GoldText>
              </Ring>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 16, color: C.mist }}>حاشیهٔ سود خالص</div>
                <div style={{ marginTop: 6, fontFamily: FONT, fontSize: 20, color: C.crystal }}>
                  فروش خالص {faMoneyCompact(pnl.netSales)}
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Profit-not-sales split */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 132,
            transform: `translateX(-50%) translateY(${(1 - split) * 90}px)`,
            opacity: split,
            display: 'flex',
            gap: 14,
            direction: 'rtl',
          }}
        >
          {[
            {
              label: 'فروش ناخالص',
              value: faMoneyCompact(pnl.grossSales),
              tone: 'violet' as const,
            },
            { label: 'هزینهٔ مواد', value: faMoneyCompact(pnl.cogs), tone: 'danger' as const },
            {
              label: 'سود خالص',
              value: faMoneyCompact(pnl.netOperatingProfit),
              tone: 'gold' as const,
            },
          ].map((item) => (
            <Panel key={item.label} pad={16} glow={0.4} style={{ minWidth: 250 }}>
              <div style={{ fontFamily: FONT, fontSize: 14, color: C.dim }}>{item.label}</div>
              <div style={{ marginTop: 6 }}>
                {item.tone === 'gold' ? (
                  <GoldText size={28}>{item.value}</GoldText>
                ) : (
                  <span
                    style={{
                      fontFamily: FONT,
                      fontSize: 28,
                      color: item.tone === 'danger' ? '#ff9aa3' : C.crystal,
                    }}
                  >
                    {item.value}
                  </span>
                )}
              </div>
            </Panel>
          ))}
        </div>
      </AbsoluteFill>
    </Act>
  );
}
