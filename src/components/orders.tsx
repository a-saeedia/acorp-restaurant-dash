import { MapPin, QrCode, Truck, User } from 'lucide-react';
import { cn } from '../lib/cn';
import { faMoney, faTime } from '../lib/fa';
import { CHANNEL_FA, ORDER_STATUS_FA, PAYMENT_FA } from '../lib/labels';
import type { Order, OrderStatus } from '../simulation/types';
import { PersianText, StatusPill } from './primitives';

/* -------------------------------------------------------------------------- */
/* Status helpers                                                            */
/* -------------------------------------------------------------------------- */

export function orderStatusTone(status: OrderStatus): 'neutral' | 'amber' | 'green' | 'red' | 'blue' {
  switch (status) {
    case 'received':
      return 'blue';
    case 'confirmed':
      return 'neutral';
    case 'preparing':
      return 'amber';
    case 'ready':
      return 'green';
    case 'completed':
      return 'neutral';
    case 'cancelled':
      return 'red';
    default:
      return 'neutral';
  }
}

const TRAIL_STATUSES: OrderStatus[] = ['received', 'confirmed', 'preparing', 'ready', 'completed'];

/* -------------------------------------------------------------------------- */
/* OrderStatusTrail                                                          */
/* -------------------------------------------------------------------------- */

export function OrderStatusTrail({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="row" style={{ gap: 8 }}>
        <StatusPill tone="red" dot>
          {ORDER_STATUS_FA.cancelled}
        </StatusPill>
      </div>
    );
  }

  const currentIndex = TRAIL_STATUSES.indexOf(status);

  return (
    <div className="trail">
      {TRAIL_STATUSES.map((step, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;
        return (
          <div key={step} className="row" style={{ flex: index === TRAIL_STATUSES.length - 1 ? 0 : 1, gap: 0, minWidth: 0 }}>
            <span
              className={cn(
                'trail__node',
                done && 'trail__node--done',
                current && 'trail__node--current',
              )}
            >
              <span className="trail__dot" />
              {ORDER_STATUS_FA[step]}
            </span>
            {index < TRAIL_STATUSES.length - 1 ? (
              <span className={cn('trail__line', done && 'trail__line--done')} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* OrderCard                                                                 */
/* -------------------------------------------------------------------------- */

export interface OrderCardProps {
  order: Order;
  selected?: boolean;
  fresh?: boolean;
  onSelect?: () => void;
  actions?: React.ReactNode;
  compact?: boolean;
}

export function OrderCard({ order, selected = false, fresh = false, onSelect, actions, compact = false }: OrderCardProps) {
  const ChannelIcon = order.channel === 'qr' ? QrCode : Truck;

  return (
    <article
      className={cn('order', selected && 'order--selected', fresh && 'order--fresh')}
      onClick={onSelect}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={
        onSelect
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') onSelect();
            }
          : undefined
      }
      style={onSelect ? { cursor: 'pointer' } : undefined}
    >
      <header className="order__head">
        <div className="order__id">
          <span className="order__ref">سفارش {order.reference}</span>
          <StatusPill tone={orderStatusTone(order.status)} dot={order.status !== 'completed'}>
            {ORDER_STATUS_FA[order.status]}
          </StatusPill>
        </div>
        <div className="order__meta">
          <span className="row" style={{ gap: 4 }}>
            <ChannelIcon size={12} strokeWidth={1.8} />
            <PersianText size={11}>{CHANNEL_FA[order.channel]}</PersianText>
          </span>
          <span aria-hidden style={{ opacity: 0.4 }}>·</span>
          <span className="t-num">{faTime(order.createdAtIso)}</span>
        </div>
      </header>

      <div className="order__items">
        {order.items.map((item) => (
          <div key={item.id} className="stack-1">
            <div className="order__item">
              <span className="order__item-name">
                <span className="order__qty">×{item.quantity}</span>
                <PersianText size={13}>{item.nameFa}</PersianText>
              </span>
              <span className="order__price">{faMoney(item.lineSubtotal)}</span>
            </div>
            {item.customizationLabelsFa.length > 0 ? (
              <div className="order__chips">
                {item.customizationLabelsFa.map((label) => (
                  <span key={label} className="chip">
                    {label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {!compact ? (
        <div className="order__meta" style={{ gap: 12 }}>
          <span className="row" style={{ gap: 4 }}>
            {order.channel === 'qr' ? <MapPin size={12} /> : <User size={12} />}
            <PersianText size={11}>{order.channel === 'qr' ? order.tableFa : order.customerNameFa}</PersianText>
          </span>
          <span className="row" style={{ gap: 4 }}>
            <span>وضعیت پرداخت:</span>
            <PersianText size={11} tone={order.paymentStatus === 'paid' ? 'green' : 'dim'}>
              {PAYMENT_FA[order.paymentStatus]}
            </PersianText>
          </span>
        </div>
      ) : null}

      <footer className="order__foot">
        <div className="order__total">
          <PersianText size={10} tone="dim">
            مبلغ کل
          </PersianText>
          <span className="order__total-value">{faMoney(order.total)}</span>
        </div>
        {actions ? <div className="order__actions">{actions}</div> : null}
      </footer>
    </article>
  );
}
