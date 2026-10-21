import { useMemo } from 'react';
import {
  ArrowLeft,
  BellRing,
  CheckCheck,
  ChefHat,
  Inbox,
  PackagePlus,
  TrendingUp,
} from 'lucide-react';
import {
  EventLog,
  HorizontalBars,
  IngredientRow,
  MetricCard,
  OrderCard,
  Panel,
  PipelineStrip,
  RevenueChart,
  SimulationEventIndicator,
  StatusPill,
  SupplierRequestCard,
} from '../../components';
import { faMoney, faMoneyCompact, faNumber, faPercent } from '../../lib/fa';
import { SECTIONS_FA } from '../../lib/labels';
import {
  activeOrders,
  analyticsFor,
  isNearThreshold,
  lowStockRows,
  nearThresholdRows,
  openPurchaseRequests,
  pipelineCounts,
  trailingDays,
} from '../../simulation/selectors';
import { useSimulation } from '../state/SimulationProvider';
import { useElementWidth } from '../lib/useElementWidth';
import type { ScreenId } from '../shell/Sidebar';

export function Overview({ onNavigate }: { onNavigate: (screen: ScreenId) => void }) {
  const { state, clockIso, recentEvents, advance, approveRequest } = useSimulation();
  const { ref, width } = useElementWidth<HTMLDivElement>(760);

  const today = useMemo(() => analyticsFor(state, 'day'), [state]);
  const trailing = useMemo(() => trailingDays(state, 14), [state]);
  const counts = useMemo(() => pipelineCounts(state), [state]);
  const active = useMemo(() => activeOrders(state), [state]);
  const alerts = useMemo(
    () => [...lowStockRows(state), ...nearThresholdRows(state)].slice(0, 6),
    [state],
  );
  const requests = useMemo(() => openPurchaseRequests(state).slice(0, 2), [state]);

  const series = trailing.map((day) => ({
    dayKey: day.dayKey,
    netSales: day.grossSales - day.discounts - day.refunds,
    orderCount: day.orderCount,
  }));

  const revenuePoints = series.map((point) => ({
    labelFa: point.dayKey.slice(8, 10),
    netSales: point.netSales,
    orderCount: point.orderCount,
  }));

  const spark = series.slice(-10).map((point) => point.netSales);

  return (
    <div className="screen">
      <div className="screen__head">
        <div>
          <div className="screen__title">نمای کلی</div>
          <div className="screen__hint">وضعیت امروز، جریان سفارش و فشار روی موجودی</div>
        </div>
        <div className="toolbar">
          <StatusPill tone="amber" dot>
            امروز · تا این لحظه
          </StatusPill>
          <button className="btn btn--sm" onClick={() => onNavigate('orders')}>
            مشاهدهٔ سفارش‌ها
            <ArrowLeft size={12} />
          </button>
        </div>
      </div>

      <div className="metric-strip">
        <MetricCard
          label="فروش خالص امروز"
          value={faMoneyCompact(today.pnl.netSales)}
          caption="از ۱۱:۰۰ تا اکنون"
          icon={<TrendingUp size={14} />}
          spark={spark}
        />
        <MetricCard
          label="سفارش‌های امروز"
          value={faNumber(today.orderCount)}
          caption={`${faNumber(today.channelSplit[0]?.orders ?? 0)} QR · ${faNumber(today.channelSplit[1]?.orders ?? 0)} ارسال`}
        />
        <MetricCard
          label="میانگین سفارش"
          value={faMoneyCompact(today.averageOrderValue)}
          caption="ناخالص، بدون ارسال"
        />
        <MetricCard
          label="حاشیهٔ خالص"
          value={faPercent(today.pnl.netMarginPct, 1)}
          caption="با سهم هزینهٔ امروز"
          icon={<PackagePlus size={14} />}
        />
      </div>

      <div className="grid grid-2-1">
        <Panel
          title={SECTIONS_FA.revenue7d}
          subtitle="فروش خالص ۱۴ روز گذشته"
          actions={<span className="pill pill--neutral">تومان</span>}
        >
          <div ref={ref} className="chart-wrap">
            {width > 0 ? (
              <RevenueChart points={revenuePoints} width={width} height={214} showOrders />
            ) : null}
          </div>
          <div className="legend" style={{ marginTop: 6 }}>
            <span className="legend__item">
              <span className="legend__swatch" style={{ background: '#e3a854' }} /> فروش خالص
            </span>
            <span className="legend__item">
              <span className="legend__swatch" style={{ background: 'rgba(111,143,181,0.75)' }} />{' '}
              تعداد سفارش
            </span>
          </div>
        </Panel>

        <div className="stack-cards">
          <Panel title={SECTIONS_FA.livePipeline} subtitle="از ثبت تا تحویل">
            <PipelineStrip
              stages={[
                {
                  key: 'received',
                  label: 'دریافت',
                  count: counts.received,
                  icon: <Inbox size={12} />,
                },
                {
                  key: 'confirmed',
                  label: 'تأیید',
                  count: counts.confirmed,
                  icon: <CheckCheck size={12} />,
                },
                {
                  key: 'preparing',
                  label: 'آشپزخانه',
                  count: counts.preparing,
                  icon: <ChefHat size={12} />,
                },
                { key: 'ready', label: 'آماده', count: counts.ready, icon: <BellRing size={12} /> },
              ]}
              progress={0.6}
            />
            <div className="divider" style={{ margin: '14px 0 10px' }} />
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>تکمیل‌شدهٔ امروز</span>
              <span className="t-num" style={{ fontSize: 14, fontWeight: 650 }}>
                {faNumber(counts.completed)}
              </span>
            </div>
          </Panel>

          <Panel title="شبیه‌سازی" subtitle="آخرین رویداد اعمال‌شده">
            <SimulationEventIndicator
              event={recentEvents[0] ?? state.lastEvent}
              appliedEventCount={recentEvents.length}
            />
          </Panel>
        </div>
      </div>

      <div className="grid grid-2">
        <Panel
          title={SECTIONS_FA.activeOrders}
          subtitle={`${faNumber(active.length)} سفارش در جریان`}
          actions={
            <button className="btn btn--sm btn--ghost" onClick={() => onNavigate('kitchen')}>
              نمایش آشپزخانه
            </button>
          }
        >
          {active.length === 0 ? (
            <div className="empty">
              <div className="empty__title">همهٔ سفارش‌ها بسته شده‌اند</div>
              <div className="empty__body">
                برای دیدن جریان کامل، از نوار پایین «ثبت سفارش نمونه» را بزنید.
              </div>
            </div>
          ) : (
            <div className="stack-cards">
              {active.slice(0, 3).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  compact
                  actions={
                    <span className="pill pill--amber">
                      {order.status === 'ready' ? 'آمادهٔ تحویل' : 'در جریان'}
                    </span>
                  }
                />
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title={SECTIONS_FA.stockAlerts}
          subtitle="کم‌موجود و نزدیک حد سفارش"
          actions={
            <button className="btn btn--sm btn--ghost" onClick={() => onNavigate('inventory')}>
              موجودی
            </button>
          }
        >
          {alerts.length === 0 ? (
            <div className="empty">
              <div className="empty__title">همهٔ اقلام بالای حد هستند</div>
              <div className="empty__body">
                پس از ثبت سفارش نمونه، گوشت و پنیر زیر حد سفارش می‌روند و همین‌جا دیده می‌شوند.
              </div>
            </div>
          ) : (
            <div className="stack-1">
              {alerts.map((row) => (
                <IngredientRow
                  key={row.ingredient.id}
                  row={row}
                  nearThreshold={isNearThreshold(row)}
                />
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="grid grid-2">
        <Panel
          title="رویدادهای شبیه‌سازی"
          subtitle={
            recentEvents.length > 0
              ? `${faNumber(recentEvents.length)} رویداد اعمال‌شده`
              : 'هنوز رویدادی اعمال نشده'
          }
          actions={
            <button className="btn btn--sm" onClick={advance} disabled={recentEvents.length === 0}>
              گام بعدی
            </button>
          }
        >
          {recentEvents.length === 0 ? (
            <div className="empty">
              <div className="empty__title">لاگ خالی است</div>
              <div className="empty__body">
                سفارش نمونه را ثبت کنید تا ۱۱ رویداد کسب‌وکار — از دریافت تا به‌روزرسانی تحلیل —
                یکی‌یکی اجرا شوند.
              </div>
            </div>
          ) : (
            <EventLog events={recentEvents} limit={6} />
          )}
        </Panel>

        <Panel title={SECTIONS_FA.supplierRecommendations} subtitle="پیشنهادهای خرید باز">
          {requests.length === 0 ? (
            <div className="empty">
              <div className="empty__title">پیشنهاد بازی نیست</div>
              <div className="empty__body">
                پیشنهاد خرید زمانی ساخته می‌شود که موجودی زیر حد سفارش برود.
              </div>
            </div>
          ) : (
            <div className="stack-cards">
              {requests.map((request) => (
                <SupplierRequestCard
                  key={request.id}
                  request={request}
                  compact
                  onApprove={() => approveRequest(request.id)}
                />
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel title="ترکیب فروش امروز" subtitle="سهم کانال‌ها از فروش خالص">
        <HorizontalBars
          items={(today.channelSplit ?? []).map((channel) => ({
            key: channel.channel,
            labelFa: channel.channel === 'qr' ? 'QR سر میز' : 'ارسال با پیک',
            value: Math.round(today.pnl.netSales * channel.share),
            metaFa: `${faNumber(channel.orders)} سفارش · ${faPercent(channel.share * 100, 1)}`,
          }))}
          formatValue={faMoneyCompact}
        />
        <div className="divider" style={{ margin: '12px 0 8px' }} />
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>فروش ناخالص امروز</span>
          <strong style={{ fontSize: 13 }}>{faMoney(today.pnl.grossSales)}</strong>
        </div>
      </Panel>

      <div className="legend" style={{ justifyContent: 'flex-end' }}>
        <span>ساعت شبیه‌سازی: {clockIso.slice(11, 16)}</span>
      </div>
    </div>
  );
}
