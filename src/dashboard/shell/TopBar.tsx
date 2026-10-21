import { Bell, Search, Settings2 } from 'lucide-react';
import { RestaurantHeader } from '../../components/identity';
import { faNumber } from '../../lib/fa';
import { RESTAURANT } from '../../simulation/catalog';
import { useSimulation } from '../state/SimulationProvider';

export function TopBar({ onOpenNotifications }: { onOpenNotifications?: () => void }) {
  const { state, clockIso } = useSimulation();
  const open = state.orders.some((order) => order.status !== 'completed');

  const unread = state.notifications.filter((notification) => !notification.read).length;

  return (
    <div className="topbar">
      <RestaurantHeader
        profile={RESTAURANT}
        clockIso={clockIso}
        open={open}
        trailing={
          <>
            <button className="icon-btn" type="button" title="جست‌وجو" aria-label="جست‌وجو">
              <Search size={14} />
            </button>
            <button
              className="icon-btn"
              type="button"
              title="اعلان‌ها"
              aria-label="اعلان‌ها"
              onClick={onOpenNotifications}
            >
              <Bell size={14} />
              {unread > 0 ? <span className="icon-btn__dot" /> : null}
            </button>
            <button className="icon-btn" type="button" title="تنظیمات" aria-label="تنظیمات">
              <Settings2 size={14} />
            </button>
            <span className="pill pill--neutral" title="تعداد اعلان‌های خوانده‌نشده">
              {faNumber(unread)} اعلان
            </span>
          </>
        }
      />
    </div>
  );
}
