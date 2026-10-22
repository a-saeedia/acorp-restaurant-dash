import { cn } from '../lib/cn';
import { faClockDuration } from '../lib/fa';
import { CHANNEL_FA } from '../lib/labels';
import type { Order } from '../simulation/types';
import { PersianText, StatusPill } from './primitives';

export interface KitchenTicketProps {
  order: Order;
  /** Elapsed milliseconds since the ticket entered the kitchen. */
  elapsedMs: number;
  /** Tickets past this threshold are shown as late. */
  lateAfterMs?: number;
  fresh?: boolean;
  actionLabel?: string | null;
  onAction?: () => void;
  actionDisabled?: boolean;
}

/**
 * The kitchen display is deliberately a different artefact from the cashier's
 * order card: monospaced rhythm, dashed perforation, no prices (the kitchen
 * does not need money) and a live ticket timer.
 */
export function KitchenTicket({
  order,
  elapsedMs,
  lateAfterMs = 12 * 60_000,
  fresh = false,
  actionLabel = null,
  onAction,
  actionDisabled = false,
}: KitchenTicketProps) {
  const late = elapsedMs > lateAfterMs;

  return (
    <article className={cn('ticket', fresh && 'ticket--fresh', late && 'ticket--late')}>
      <header className="ticket__top">
        <div>
          <div className="ticket__ref">
            {order.reference}
            <small>{CHANNEL_FA[order.channel]}</small>
          </div>
          <PersianText size={10.5} tone="dim">
            {order.tableFa ?? order.customerNameFa}
          </PersianText>
        </div>
        <div className={cn('ticket__timer', late && 'ticket__timer--late')}>
          {faClockDuration(elapsedMs)}
        </div>
      </header>

      <div className="ticket__body">
        {order.items.map((item) => (
          <div key={item.id} className="ticket__line">
            <span className="ticket__line-qty">{item.quantity}×</span>
            <span className="ticket__line-name">{item.nameFa}</span>
            <span />
            {item.customizationLabelsFa.length > 0 ? (
              <div className="ticket__line-note">
                {item.customizationLabelsFa.map((label) => (
                  <span key={label} className="ticket__note">
                    {label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <footer className="ticket__foot">
        <StatusPill tone={order.status === 'ready' ? 'green' : 'amber'} dot>
          {order.status === 'ready'
            ? 'آماده تحویل'
            : order.status === 'preparing'
              ? 'در حال پخت'
              : 'در انتظار'}
        </StatusPill>
        {actionLabel ? (
          <button className="btn btn--sm btn--ghost" onClick={onAction} disabled={actionDisabled}>
            {actionLabel}
          </button>
        ) : (
          <span>زمان تقریبی: {order.prepMinutes} دقیقه</span>
        )}
      </footer>
    </article>
  );
}
