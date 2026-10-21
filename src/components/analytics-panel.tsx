import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { faMoney, faMoneyCompact, faNumber, faPercent } from '../lib/fa';
import { PERIOD_FA, PERIOD_LONG_FA } from '../lib/labels';
import type { AnalyticsPeriod, AnalyticsSnapshot } from '../simulation/types';
import { KeyValue, PersianText, StatusPill } from './primitives';

/* -------------------------------------------------------------------------- */
/* PeriodToggle                                                              */
/* -------------------------------------------------------------------------- */

export interface PeriodToggleProps {
  value: AnalyticsPeriod;
  onChange?: (period: AnalyticsPeriod) => void;
  periods?: AnalyticsPeriod[];
}

export function PeriodToggle({
  value,
  onChange,
  periods = ['day', 'week', 'month', 'year'],
}: PeriodToggleProps) {
  return (
    <div className="segmented" role="tablist">
      {periods.map((period) => (
        <button
          key={period}
          role="tab"
          aria-selected={period === value}
          className={cn('segmented__item', period === value && 'segmented__item--active')}
          onClick={() => onChange?.(period)}
          type="button"
        >
          {PERIOD_FA[period]}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PnlPanel                                                                  */
/* -------------------------------------------------------------------------- */

export interface PnlPanelProps {
  snapshot: AnalyticsSnapshot;
  compact?: boolean;
  className?: string;
  footer?: ReactNode;
}

/**
 * Profit & loss, in the order an operator reads it: revenue arrives, costs
 * leave, and the two margins are the only numbers that matter at the end.
 */
export function PnlPanel({ snapshot, compact = false, className, footer }: PnlPanelProps) {
  const { pnl } = snapshot;

  return (
    <div className={cn('pnl', compact && 'pnl--compact', className)}>
      <div className="pnl__head">
        <PersianText size={12} weight={600}>
          صورت سود و زیان
        </PersianText>
        <StatusPill tone={snapshot.isPartialDay ? 'amber' : 'neutral'}>
          {snapshot.isPartialDay
            ? `${PERIOD_LONG_FA[snapshot.period]} · روز جاری`
            : PERIOD_LONG_FA[snapshot.period]}
        </StatusPill>
      </div>

      <div className="pnl__rows">
        <KeyValue label="فروش ناخالص" value={faMoney(pnl.grossSales)} />
        <KeyValue label="تخفیف" value={`−${faMoney(pnl.discounts)}`} tone="red" />
        <KeyValue label="مرجوعی" value={`−${faMoney(pnl.refunds)}`} tone="red" />
        <KeyValue label="فروش خالص" value={faMoney(pnl.netSales)} total />
        <KeyValue label="بهای تمام‌شده" value={`−${faMoney(pnl.cogs)}`} tone="red" />
        <KeyValue label="سود ناخالص" value={faMoney(pnl.grossProfit)} total />
        <KeyValue
          label="هزینه‌های عملیاتی"
          value={`−${faMoney(pnl.operatingExpenses)}`}
          tone="red"
        />
        <KeyValue label="هزینهٔ بازاریابی" value={`−${faMoney(pnl.marketingSpend)}`} tone="red" />
        <KeyValue
          label="سود عملیاتی خالص"
          value={faMoney(pnl.netOperatingProfit)}
          tone={pnl.netOperatingProfit >= 0 ? 'green' : 'red'}
          total
        />
      </div>

      <div className="pnl__margins">
        <div className="pnl__margin">
          <span className="pnl__margin-label">حاشیهٔ ناخالص</span>
          <span className="pnl__margin-value">{faPercent(pnl.grossMarginPct, 1)}</span>
        </div>
        <div className="pnl__margin">
          <span className="pnl__margin-label">حاشیهٔ خالص</span>
          <span className={cn('pnl__margin-value', pnl.netMarginPct < 0 ? 't-red' : 't-green')}>
            {faPercent(pnl.netMarginPct, 1)}
          </span>
        </div>
      </div>

      {!compact ? (
        <div className="pnl__foot">
          <span>
            {faNumber(snapshot.orderCount)} سفارش · میانگین سفارش{' '}
            {faMoneyCompact(snapshot.averageOrderValue)}
          </span>
          <span className="t-code">
            {snapshot.fromDayKey} → {snapshot.toDayKey}
          </span>
        </div>
      ) : null}

      {footer}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PeriodSummary                                                             */
/* -------------------------------------------------------------------------- */

export function PeriodSummary({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  return (
    <div className="period-summary">
      <div>
        <span className="period-summary__label">دوره</span>
        <span className="period-summary__value">{PERIOD_LONG_FA[snapshot.period]}</span>
      </div>
      <div>
        <span className="period-summary__label">سفارش‌ها</span>
        <span className="period-summary__value">{faNumber(snapshot.orderCount)}</span>
      </div>
      <div>
        <span className="period-summary__label">فروش خالص</span>
        <span className="period-summary__value">{faMoneyCompact(snapshot.pnl.netSales)}</span>
      </div>
      <div>
        <span className="period-summary__label">حاشیهٔ خالص</span>
        <span
          className={cn(
            'period-summary__value',
            snapshot.pnl.netMarginPct < 0 ? 't-red' : 't-green',
          )}
        >
          {faPercent(snapshot.pnl.netMarginPct, 1)}
        </span>
      </div>
    </div>
  );
}
