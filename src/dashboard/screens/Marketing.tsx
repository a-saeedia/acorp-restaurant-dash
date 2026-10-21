import { useMemo } from 'react';
import { Megaphone, MousePointerClick, Repeat2, Target } from 'lucide-react';
import {
  HorizontalBars,
  MetricCard,
  Panel,
  PeriodToggle,
  StatusPill,
} from '../../components';
import { faMoney, faMoneyCompact, faNumber, faPercent } from '../../lib/fa';
import { SECTIONS_FA } from '../../lib/labels';
import { marketingFor } from '../../simulation/selectors';
import { useSimulation } from '../state/SimulationProvider';

export function MarketingScreen() {
  const { state, period, setPeriod } = useSimulation();
  const snapshot = useMemo(() => marketingFor(state, period), [state, period]);

  const funnel = [
    { key: 'impressions', label: 'نمایش', value: snapshot.impressions },
    { key: 'clicks', label: 'کلیک', value: snapshot.clicks },
    { key: 'conversions', label: 'تبدیل', value: snapshot.conversions },
    { key: 'orders', label: 'سفارش', value: snapshot.conversions },
  ];
  const funnelMax = Math.max(1, ...funnel.map((step) => step.value));

  return (
    <div className="screen">
      <div className="screen__head">
        <div>
          <div className="screen__title">بازاریابی</div>
          <div className="screen__hint">
            هزینه و نسبت‌دادن سفارش به کمپین‌ها در همان پنجرهٔ انتخابی
          </div>
        </div>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      <div className="metric-strip">
        <MetricCard
          label="هزینهٔ کمپین‌ها"
          value={faMoneyCompact(snapshot.spend)}
          caption={`${faNumber(snapshot.channels.length)} کانال فعال`}
          icon={<Megaphone size={14} />}
        />
        <MetricCard
          label="بازگشت سرمایه"
          value={`${faNumber(snapshot.attributionRoi, { decimals: 1 })}×`}
          caption="درآمد نسبت‌داده‌شده به هزینه"
          icon={<Target size={14} />}
        />
        <MetricCard
          label="نرخ کلیک"
          value={faPercent(snapshot.clickThroughRate, 1)}
          caption={`${faNumber(snapshot.clicks)} کلیک`}
          icon={<MousePointerClick size={14} />}
        />
        <MetricCard
          label="نرخ تبدیل"
          value={faPercent(snapshot.conversionRate, 1)}
          caption={`${faNumber(snapshot.conversions)} تبدیل`}
          icon={<Repeat2 size={14} />}
        />
      </div>

      <div className="grid grid-2-1">
        <Panel title="عملکرد کانال‌ها" subtitle="سهم هر کانال از هزینه و درآمد">
          <HorizontalBars
            items={snapshot.channels.map((channel) => ({
              key: channel.channel,
              labelFa: channel.labelFa,
              value: channel.spend,
              metaFa: `${faNumber(channel.conversions)} تبدیل · ${faPercent(channel.share * 100, 1)} از هزینه`,
            }))}
            formatValue={faMoneyCompact}
          />
          <div className="divider" style={{ margin: '14px 0 10px' }} />
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>درآمد نسبت‌داده‌شده</span>
            <strong>{faMoney(snapshot.revenueAttributed)}</strong>
          </div>
        </Panel>

        <Panel title={SECTIONS_FA.funnel} subtitle="از نمایش تا سفارش">
          <div className="funnel">
            {funnel.map((step) => (
              <div key={step.key} className="funnel__step">
                <span className="funnel__label">{step.label}</span>
                <span
                  className="funnel__bar"
                  style={{ width: `${Math.max(12, (step.value / funnelMax) * 100)}%` }}
                >
                  {faNumber(step.value)}
                </span>
              </div>
            ))}
          </div>
          <div className="divider" style={{ margin: '14px 0 10px' }} />
          <div className="row" style={{ justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: 'var(--text-3)' }}>میانگین سفارش</span>
            <span>{faMoneyCompact(snapshot.averageOrderValue)}</span>
          </div>
          <div className="row" style={{ justifyContent: 'space-between', fontSize: 11, marginTop: 6 }}>
            <span style={{ color: 'var(--text-3)' }}>نرخ مشتری تکراری</span>
            <span>{faPercent(snapshot.repeatCustomerRate, 1)}</span>
          </div>
        </Panel>
      </div>

      <Panel title={SECTIONS_FA.campaigns} subtitle="کمپین‌های فعال و بستهٔ همین دوره">
        <div className="campaign-row" style={{ paddingTop: 0 }}>
          <span className="campaign-row__metric-label">کمپین</span>
          <span className="campaign-row__metric-label" style={{ textAlign: 'end' }}>
            هزینه
          </span>
          <span className="campaign-row__metric-label" style={{ textAlign: 'end' }}>
            تبدیل
          </span>
          <span className="campaign-row__metric-label" style={{ textAlign: 'end' }}>
            درآمد
          </span>
          <span className="campaign-row__metric-label" style={{ textAlign: 'end' }}>
            ROI
          </span>
        </div>
        {state.campaigns.map((campaign) => (
          <div key={campaign.id} className="campaign-row">
            <div className="campaign-row__name">
              <div style={{ fontSize: 12, fontWeight: 550 }}>{campaign.nameFa}</div>
              <div className="campaign-row__channel">
                {campaign.channelLabelFa} · {campaign.startedOn} → {campaign.endedOn}
              </div>
            </div>
            <div className="campaign-row__metric">
              <span className="campaign-row__metric-value">
                {faMoney(campaign.spend, { suffix: false })}
              </span>
            </div>
            <div className="campaign-row__metric">
              <span className="campaign-row__metric-value">{faNumber(campaign.conversions)}</span>
            </div>
            <div className="campaign-row__metric">
              <span className="campaign-row__metric-value">
                {faMoney(campaign.revenueAttributed, { suffix: false })}
              </span>
            </div>
            <div className="campaign-row__metric">
              <StatusPill
                tone={campaign.revenueAttributed / Math.max(1, campaign.spend) >= 5 ? 'green' : 'amber'}
              >
                {faNumber(campaign.revenueAttributed / Math.max(1, campaign.spend), { decimals: 1 })}×
              </StatusPill>
            </div>
          </div>
        ))}
      </Panel>
    </div>
  );
}
