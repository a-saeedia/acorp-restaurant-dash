import { useMemo } from 'react';
import { PackageSearch, Truck } from 'lucide-react';
import { EmptyState, Panel, StatusPill, SupplierRequestCard } from '../../components';
import { faMoney, faNumber } from '../../lib/fa';
import { openPurchaseRequests, supplierSummaries } from '../../simulation/selectors';
import { useSimulation } from '../state/SimulationProvider';

const STATUS_LABEL = {
  healthy: 'متعادل',
  low: 'کم‌موجود',
  critical: 'بحرانی',
} as const;

export function SuppliersScreen() {
  const { state, prepareRequest, approveRequest } = useSimulation();
  const suppliers = useMemo(() => supplierSummaries(state), [state]);
  const requests = useMemo(
    () =>
      [...openPurchaseRequests(state)].sort(
        (a, b) => Date.parse(b.createdAtIso) - Date.parse(a.createdAtIso),
      ),
    [state],
  );

  return (
    <div className="screen">
      <div className="screen__head">
        <div>
          <div className="screen__title">تأمین‌کنندگان</div>
          <div className="screen__hint">
            پیشنهاد خرید خودکار از کسری موجودی؛ تأییدها فقط داخل شبیه‌سازی است
          </div>
        </div>
        <StatusPill tone={requests.length > 0 ? 'blue' : 'green'} dot>
          {faNumber(requests.length)} درخواست باز
        </StatusPill>
      </div>

      <div className="grid grid-3">
        {suppliers.map((summary) => (
          <div key={summary.supplier.id} className="supplier-card">
            <div className="supplier-card__head">
              <div>
                <div className="supplier-card__name">{summary.supplier.nameFa}</div>
                <div className="supplier-card__meta">
                  {summary.supplier.contactFa} · تحویل {faNumber(summary.supplier.leadTimeDays)}{' '}
                  روزه
                </div>
              </div>
              <StatusPill
                tone={
                  summary.worstStatus === 'critical'
                    ? 'red'
                    : summary.worstStatus === 'low'
                      ? 'amber'
                      : 'green'
                }
                dot={summary.worstStatus !== 'healthy'}
              >
                {STATUS_LABEL[summary.worstStatus]}
              </StatusPill>
            </div>

            <div className="supplier-card__grid">
              <div className="supplier-card__stat">
                <span className="supplier-card__stat-label">اقلام</span>
                <span className="supplier-card__stat-value">
                  {faNumber(summary.ingredientRows.length)}
                </span>
              </div>
              <div className="supplier-card__stat">
                <span className="supplier-card__stat-label">درخواست باز</span>
                <span className="supplier-card__stat-value">{faNumber(summary.openRequests)}</span>
              </div>
              <div className="supplier-card__stat">
                <span className="supplier-card__stat-label">ارزش باز</span>
                <span className="supplier-card__stat-value">
                  {faMoney(summary.openValue, { suffix: false })}
                </span>
              </div>
              <div className="supplier-card__stat">
                <span className="supplier-card__stat-label">حداقل سفارش</span>
                <span className="supplier-card__stat-value">
                  {faNumber(summary.supplier.leadTimeDays)} روز
                </span>
              </div>
            </div>

            <div className="row" style={{ gap: 6, color: 'var(--text-3)', fontSize: 10.5 }}>
              <Truck size={11} />
              {summary.ingredientRows.map((row) => row.ingredient.nameFa).join(' · ')}
            </div>
          </div>
        ))}
      </div>

      <Panel
        title="درخواست‌های خرید"
        subtitle="پیشنهاد ← تنظیم ← تأیید"
        actions={<span className="pill pill--neutral">بدون ارسال واقعی</span>}
      >
        {requests.length === 0 ? (
          <EmptyState
            icon={<PackageSearch size={22} />}
            title="درخواست بازی نیست"
            body="همهٔ اقلام بالای حد سفارش هستند. با ثبت سفارش نمونه، پیشنهاد تازه ساخته می‌شود."
          />
        ) : (
          <div className="grid grid-2">
            {requests.map((request) => (
              <SupplierRequestCard
                key={request.id}
                request={request}
                onPrepare={() => prepareRequest(request.id)}
                onApprove={() => approveRequest(request.id)}
              />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
