import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import {
  Act,
  Beam,
  Chip,
  Counter,
  CrystalText,
  GoldText,
  Meter,
  Panel,
  Slam,
  Wipe,
} from '../components/kit';
import { FILM } from '../data';
import { faMoneyCompact, faNumber, faPercent } from '../../lib/fa';
import { SCRIPT } from '../script';
import { C, FONT, clamp, ramp } from '../theme';

export function Marketing() {
  const frame = useCurrentFrame();
  const { marketing } = FILM;
  const pulse = 1 + Math.sin(frame / 18) * 0.02;

  return (
    <Act seed={96} shards={7} caption={SCRIPT.marketing.caption} captionStart={12}>
      <AbsoluteFill>
        <Beam at={34} x={40} angle={-14} color="rgba(232,180,92,0.20)" />

        {/* Concentric response rings */}
        <div
          style={{
            position: 'absolute',
            left: 250,
            top: '50%',
            transform: `translate(-50%, -50%) scale(${pulse})`,
            opacity: 0.9,
          }}
        >
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              style={{ position: 'absolute', left: 0, top: 0, transform: 'translate(-50%, -50%)' }}
            >
              <div
                style={{
                  width: 260 + index * 150,
                  height: 260 + index * 150,
                  borderRadius: '50%',
                  border: `1px solid rgba(168,85,247,${0.5 - index * 0.12})`,
                  boxShadow: index === 0 ? '0 0 80px rgba(124,58,237,0.35) inset' : undefined,
                  opacity: clamp((frame - index * 10) / 26),
                  transform: `scale(${1 + (1 - clamp((frame - index * 20) / 60)) * 0.2})`,
                }}
              />
            </div>
          ))}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              transform: 'translate(-50%, -50%)',
              direction: 'rtl',
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: FONT, fontSize: 15, color: C.dim }}>بازگشت هزینه</div>
            <GoldText size={56}>{faNumber(marketing.attributionRoi, { decimals: 1 })}×</GoldText>
          </div>
        </div>

        <div style={{ position: 'absolute', right: 128, top: 112, direction: 'rtl', width: 820 }}>
          <Slam start={0} from={2.4} duration={14}>
            <CrystalText size={74} weight={800}>
              {SCRIPT.marketing.title}
            </CrystalText>
          </Slam>
        </div>

        {/* Channel cards */}
        <div
          style={{
            position: 'absolute',
            right: 140,
            top: 300,
            width: 690,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            direction: 'rtl',
          }}
        >
          {marketing.channels.map((channel, index) => {
            const at = 18 + index * 12;
            const t = ramp(frame, at, 16, Easing.out(Easing.exp));
            return (
              <div
                key={channel.channel}
                style={{ opacity: clamp(t), transform: `translateX(${(1 - t) * -70}px)` }}
              >
                <Panel pad={18} glow={index === 0 ? 0.7 : 0.35}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: FONT, fontSize: 22, color: C.crystal }}>
                        {channel.labelFa}
                      </div>
                      <div style={{ marginTop: 4, fontFamily: FONT, fontSize: 14, color: C.dim }}>
                        {faNumber(channel.conversions)} تبدیل · {faMoneyCompact(channel.revenue)}{' '}
                        تومان
                      </div>
                    </div>
                    <GoldText size={26}>{faPercent(channel.share * 100, 0)}</GoldText>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Meter
                      value={clamp(channel.share)}
                      start={at + 8}
                      color={index === 0 ? C.gold : C.violet}
                      height={7}
                    />
                  </div>
                </Panel>
              </div>
            );
          })}

          <div style={{ marginTop: 8, display: 'flex', gap: 10 }}>
            <Chip tone="gold">
              <Counter
                value={marketing.revenueAttributed}
                start={40}
                duration={40}
                format={(n) => faMoneyCompact(n)}
                size={15}
              />
            </Chip>
            <Chip tone="violet">هزینه {faMoneyCompact(marketing.spend)}</Chip>
            <Chip tone="crystal">CTR {faPercent(marketing.clickThroughRate * 100)}</Chip>
          </div>
        </div>
      </AbsoluteFill>
      <Wipe at={228} />
    </Act>
  );
}
