import { ArrowLeft, Check, FileText, ShoppingCart } from 'lucide-react';
import { cn } from '../lib/cn';
import { faMoney, faNumber, faTime } from '../lib/fa';
import { PURCHASE_STATUS_FA } from '../lib/labels';
import type { PurchaseRequest } from '../simulation/types';
import { PersianText, StatusPill } from './primitives';

const STAGES = ['recommendation', 'prepared', 'approved'] as const;

function stageIndex(status: PurchaseRequest['status']): number {
  const index = STAGES.indexOf(status as (typeof STAGES)[number]);
  return index < 0 ? 0 : index;
}

export function purchaseTone(
  status: PurchaseRequest['status'],
): 'blue' | 'amber' | 'green' | 'red' {
  switch (status) {
    case 'recommendation':
      return 'blue';
    case 'prepared':
      return 'amber';
    case 'approved':
      return 'green';
    default:
      return 'red';
  }
}

export interface SupplierRequestCardProps {
  request: PurchaseRequest;
  onPrepare?: () => void;
  onApprove?: () => void;
  compact?: boolean;
}

/**
 * One purchase request, showing the three-stage funnel explicitly. The footer
 * note repeats that nothing leaves the building: this is a simulation.
 */
export function SupplierRequestCard({
  request,
  onPrepare,
  onApprove,
  compact = false,
}: SupplierRequestCardProps) {
  const current = stageIndex(request.status);
  const canPrepare = request.status === 'recommendation' && onPrepare;
  const canApprove =
    (request.status === 'recommendation' || request.status === 'prepared') && onApprove;

  return (
    <article className={cn('request', request.status === 'recommendation' && 'request--accent')}>
      <header className="request__head">
        <div>
          <div className="request__supplier">{request.supplierNameFa}</div>
          <PersianText className="request__ingredient" size={11}>
            {request.ingredientNameFa} · {request.unitLabelFa}
          </PersianText>
        </div>
        <StatusPill tone={purchaseTone(request.status)} dot={request.status !== 'approved'}>
          {PURCHASE_STATUS_FA[request.status]}
        </StatusPill>
      </header>

      <div className="request__grid">
        <div className="request__cell">
          <span className="request__cell-label">موجودی فعلی</span>
          <span className="request__cell-value">
            {faNumber(request.currentQuantity)}
            <span className="ingredient__unit">{request.unitLabelFa}</span>
          </span>
        </div>
        <div className="request__cell">
          <span className="request__cell-label">مقدار پیشنهادی</span>
          <span className="request__cell-value">
            {faNumber(request.recommendedQuantity)}
            <span className="ingredient__unit">{request.unitLabelFa}</span>
          </span>
        </div>
        <div className="request__cell">
          <span className="request__cell-label">هزینهٔ برآوردی</span>
          <span className="request__cell-value">{faMoney(request.estimatedCost)}</span>
        </div>
      </div>

      <div className="request__stages">
        {STAGES.map((stage, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <div key={stage} className="row" style={{ gap: 0 }}>
              <span
                className={cn(
                  'request__stage',
                  done && 'request__stage--done',
                  active && 'request__stage--current',
                )}
              >
                <span className="request__stage-dot">
                  {done ? <Check size={8} strokeWidth={3} /> : faNumber(index + 1)}
                </span>
                {PURCHASE_STATUS_FA[stage]}
              </span>
              {index < STAGES.length - 1 ? <span className="request__stage-line" /> : null}
            </div>
          );
        })}
      </div>

      {!compact ? (
        <div className="request__note">
          {request.noteFa} · ایجاد {faTime(request.createdAtIso)}
          {request.approvedAtIso ? ` · تأیید ${faTime(request.approvedAtIso)}` : ''}
        </div>
      ) : null}

      <footer className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
        <span className="row" style={{ gap: 6, color: 'var(--text-3)', fontSize: 10.5 }}>
          <FileText size={11} />
          <span className="t-code">{request.id.toUpperCase()}</span>
        </span>
        <div className="row" style={{ gap: 6 }}>
          {canPrepare ? (
            <button className="btn btn--sm btn--ghost" onClick={onPrepare}>
              تنظیم درخواست
              <ArrowLeft size={12} />
            </button>
          ) : null}
          {canApprove ? (
            <button className="btn btn--sm" onClick={onApprove}>
              <ShoppingCart size={12} />
              تأیید شبیه‌سازی‌شده
            </button>
          ) : null}
        </div>
      </footer>
    </article>
  );
}
