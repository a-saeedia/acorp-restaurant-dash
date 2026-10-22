import { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, Layers, Percent, Wallet } from 'lucide-react';
import {
  CostDonut,
  DonutLegend,
  HorizontalBars,
  MetricCard,
  Panel,
  PeriodSummary,
  PeriodToggle,
  PnlPanel,
  RevenueChart,
} from '../../components';
import { cn } from '../../lib/cn';
import { faMoney, faMoneyCompact, faNumber, faPercent } from '../../lib/fa';
import { SECTIONS_FA } from '../../lib/labels';
import { analyticsFor } from '../../simulation/selectors';
import { useSimulation } from '../state/SimulationProvider';
import { useElementWidth } from '../lib/useElementWidth';

export function AnalyticsScreen() {
  const { state, period, setPeriod } = useSimulation();
  const { ref, width } = useElementWidth<HTMLDivElement>(800);

  const snapshot = useMemo(() => analyticsFor(state, period), [state, period]);

  const points = snapshot.daily.map((day) => ({
    labelFa: day.labelFa,
    netSales: day.netSales,
    orderCount: day.orderCount,
  }));

  const slices = [
    { key: 'cogs', nameFa: 'بهای تمام‌شده', value: snapshot.pnl.cogs, color: '#d96b33' },
    {
      key: 'opex',
      nameFa: 'هزینهٔ عملیاتی',
      value: snapshot.pnl.operatingExpenses,
      color: '#c9a227',
    },
    {
      key: 'marketing',
      nameFa: 'بازاریابی',
      value: snapshot.pnl.marketingSpend,
      color: '#7f9fc4',
    },
    {
      key: 'profit',
      nameFa: 'سود خالص',
      value: Math.max(0, snapshot.pnl.netOperatingProfit),
      color: '#56a97c',
    },
  ];

  const deltaTone = (value: number) => (value < 0 ? 'red' : 'green');

  return (
    <div className="screen">
      <div className="screen__head">
        <div>
          <div className="screen__title">تحلیل کسب‌وکار</div>
          <div className="screen__hint">
            هر عدد از سفارش‌های همان پنجره محاسبه می‌شود؛ هزینه‌ها روزشمار می‌شوند
          </div>
        </div>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      {snapshot.isPartialDay ? (
        <div className="sim-ev sim-ev--live">
          <span className="sim-ev__dot" />
          <div className="sim-ev__body">
            <div className="sim-ev__row">
              <span style={{ fontSize: 11.5, fontWeight: 600 }}>
                پنجرهٔ جاری شامل روز ناتمام است
              </span>
            </div>
            <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>
              هزینهٔ عملیاتی به نسبت {faPercent(snapshot.dayProgress * 100, 0)} از روز سرویس محاسبه
              شده تا حاشیهٔ سود واقعی‌تر باشد.
            </span>
          </div>
        </div>
      ) : null}

      <div className="metric-strip">
        <MetricCard
          label="فروش خالص"
          value={faMoneyCompact(snapshot.pnl.netSales)}
          delta={snapshot.comparison.netSalesPct}
          deltaCaption="نسبت به دورهٔ قبل"
          icon={<Wallet size={14} />}
        />
        <MetricCard
          label="سفارش‌ها"
          value={faNumber(snapshot.orderCount)}
          delta={snapshot.comparison.orderCountPct}
          deltaCaption="نسبت به دورهٔ قبل"
          icon={<Layers size={14} />}
        />
        <MetricCard
          label="میانگین سفارش"
          value={faMoneyCompact(snapshot.averageOrderValue)}
          delta={snapshot.comparison.averageOrderValuePct}
          deltaCaption="نسبت به دورهٔ قبل"
        />
        <MetricCard
          label="سود عملیاتی خالص"
          value={faMoneyCompact(snapshot.pnl.netOperatingProfit)}
          delta={snapshot.comparison.netProfitPct}
          deltaCaption="نسبت به دورهٔ قبل"
          icon={<Percent size={14} />}
        />
      </div>

      <PeriodSummary snapshot={snapshot} />

      <div className="grid grid-2-1">
        <Panel
          title="روند فروش"
          subtitle={
            snapshot.granularity === 'month'
              ? 'ماه‌های سال شمسی'
              : `${faNumber(snapshot.daily.length)} روز`
          }
        >
          <div ref={ref}>
            {width > 0 ? (
              <RevenueChart points={points} width={width} height={248} showOrders />
            ) : null}
          </div>
        </Panel>

        <Panel title={SECTIONS_FA.costBreakdown} subtitle="ترکیب هزینه در همین دوره">
          <div className="row" style={{ gap: 16, alignItems: 'center' }}>
            <CostDonut
              slices={slices}
              centerLabel="فروش خالص"
              centerValue={faMoneyCompact(snapshot.pnl.netSales)}
            />
            <DonutLegend slices={slices} />
          </div>
          <div className="divider" style={{ margin: '14px 0 10px' }} />
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>سود خالص دوره</span>
            <strong className={cn(snapshot.pnl.netOperatingProfit < 0 ? 't-red' : 't-green')}>
              {faMoney(snapshot.pnl.netOperatingProfit)}
            </strong>
          </div>
        </Panel>
      </div>

      <div className="grid grid-2">
        <Panel title={SECTIONS_FA.pnl} subtitle="ساختار سود و زیان">
          <PnlPanel snapshot={snapshot} compact />
        </Panel>

        <div className="stack-cards">
          <Panel title={SECTIONS_FA.topItems} subtitle="بر اساس تعداد فروش">
            <HorizontalBars
              items={snapshot.topItems.slice(0, 5).map((item) => ({
                key: item.menuItemId,
                labelFa: item.nameFa,
                value: item.quantity,
                metaFa: faMoneyCompact(item.revenue),
                color: 'linear-gradient(90deg, rgba(227,168,84,0.55), rgba(227,168,84,0.9))',
              }))}
              formatValue={(value) => `${faNumber(value)} عدد`}
            />
          </Panel>

          <Panel title={SECTIONS_FA.channels} subtitle="QR در مقابل ارسال">
            <HorizontalBars
              items={snapshot.channelSplit.map((channel) => ({
                key: channel.channel,
                labelFa: channel.channel === 'qr' ? 'QR سر میز' : 'ارسال با پیک',
                value: channel.orders,
                metaFa: faPercent(channel.share * 100, 1),
                color:
                  channel.channel === 'qr'
                    ? 'linear-gradient(90deg, rgba(227,168,84,0.5), #e3a854)'
                    : 'linear-gradient(90deg, rgba(127,159,196,0.4), #7f9fc4)',
              }))}
              formatValue={(value) => `${faNumber(value)} سفارش`}
            />
          </Panel>

          <Panel title="مصرف مواد اولیه" subtitle="هزینهٔ مواد در همین دوره">
            <HorizontalBars
              items={snapshot.ingredientSpend.slice(0, 4).map((item) => ({
                key: item.ingredientId,
                labelFa: item.nameFa,
                value: item.amount,
              }))}
              formatValue={faMoneyCompact}
            />
          </Panel>
        </div>
      </div>

      <div className="legend" style={{ justifyContent: 'space-between' }}>
        <span className="row" style={{ gap: 6 }}>
          {snapshot.comparison.netSalesPct >= 0 ? (
            <ArrowUpRight size={11} />
          ) : (
            <ArrowDownRight size={11} />
          )}
          مقایسه با پنجرهٔ برابر قبلی
        </span>
        <span
          className={cn('t-code', deltaTone(snapshot.comparison.netProfitPct) === 'red' && 't-red')}
        >
          {snapshot.fromDayKey} → {snapshot.toDayKey}
        </span>
      </div>
    </div>
  );
}
