import { ArrowUpRight, Bell, ChefHat, PackageCheck, Receipt, TriangleAlert } from 'lucide-react';
import { cn } from '../lib/cn';
import { faElapsed, faMoney } from '../lib/fa';
import type { NotificationKind, SimulationNotification } from '../simulation/types';
import { PersianText } from './primitives';

const TONE: Record<NotificationKind, 'amber' | 'green' | 'blue' | 'red'> = {
  cashier: 'green',
  kitchen: 'amber',
  inventory: 'red',
  supplier: 'blue',
  analytics: 'amber',
};

const ICON = {
  cashier: Receipt,
  kitchen: ChefHat,
  inventory: TriangleAlert,
  supplier: PackageCheck,
  analytics: Bell,
} as const;

export interface NotificationToastProps {
  notification: SimulationNotification;
  /** Relative "now" so the dashboard clock drives the label deterministically. */
  nowIso: string;
  fresh?: boolean;
  className?: string;
}

export function NotificationToast({ notification, nowIso, fresh = false, className }: NotificationToastProps) {
  const tone = TONE[notification.kind];
  const Icon = ICON[notification.kind] ?? Bell;

  return (
    <div className={cn('toast', fresh && 'toast--fresh', className)}>
      <Icon size={15} strokeWidth={1.9} className={`notif__icon notif__icon--${tone}`} />
      <div className="toast__body">
        <div className="toast__title">{notification.titleFa}</div>
        <PersianText className="toast__text" size={11.5} tone="muted">
          {notification.bodyFa}
        </PersianText>
      </div>
      <span className="toast__time">{faElapsed(Date.parse(nowIso) - Date.parse(notification.atIso))}</span>
    </div>
  );
}

export interface NotificationFeedProps {
  notifications: SimulationNotification[];
  nowIso: string;
  limit?: number;
  emptyLabel?: string;
}

export function NotificationFeed({
  notifications,
  nowIso,
  limit = 6,
  emptyLabel = 'رویداد تازه‌ای نیست.',
}: NotificationFeedProps) {
  const visible = notifications.slice(0, limit);
  if (visible.length === 0) {
    return (
      <PersianText size={12} tone="dim">
        {emptyLabel}
      </PersianText>
    );
  }
  return (
    <div className="stack-2">
      {visible.map((notification) => (
        <NotificationToast key={notification.id} notification={notification} nowIso={nowIso} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* RecommendationCard                                                       */
/* -------------------------------------------------------------------------- */

export function RecommendationCard({
  title,
  body,
  impact,
  onApply,
}: {
  title: string;
  body: string;
  impact?: number;
  onApply?: () => void;
}) {
  return (
    <div className="rec">
      <div className="rec__spark" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className="rec__body">
        <div className="rec__title">{title}</div>
        <PersianText className="rec__text" size={12} tone="muted">
          {body}
        </PersianText>
        {typeof impact === 'number' ? (
          <span className="rec__impact">
            <ArrowUpRight size={12} />
            اثر تقریبی: {faMoney(impact)}
          </span>
        ) : null}
      </div>
      {onApply ? (
        <button className="btn btn--sm btn--ghost" onClick={onApply}>
          اعمال
        </button>
      ) : null}
    </div>
  );
}
