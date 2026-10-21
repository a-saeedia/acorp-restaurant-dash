import {
  BarChart3,
  Bell,
  Boxes,
  ChefHat,
  CircleDollarSign,
  LayoutDashboard,
  Megaphone,
  Receipt,
  Truck,
} from 'lucide-react';
import { BrandMark } from '../../components/identity';
import { cn } from '../../lib/cn';
import { faNumber } from '../../lib/fa';
import { NAV_LABELS_FA } from '../../lib/labels';
import { SIMULATION_SEED, SIMULATION_VERSION } from '../../simulation/config';
import { useSimulation } from '../state/SimulationProvider';

export type ScreenId =
  | 'overview'
  | 'orders'
  | 'kitchen'
  | 'inventory'
  | 'suppliers'
  | 'analytics'
  | 'marketing';

const NAV: Array<{ id: ScreenId; icon: typeof LayoutDashboard }> = [
  { id: 'overview', icon: LayoutDashboard },
  { id: 'orders', icon: Receipt },
  { id: 'kitchen', icon: ChefHat },
  { id: 'inventory', icon: Boxes },
  { id: 'suppliers', icon: Truck },
  { id: 'analytics', icon: BarChart3 },
  { id: 'marketing', icon: Megaphone },
];

export function Sidebar({
  active,
  onNavigate,
}: {
  active: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}) {
  const { state } = useSimulation();

  const badges: Partial<Record<ScreenId, number>> = {
    kitchen: state.orders.filter(
      (order) => order.status === 'received' || order.status === 'confirmed' || order.status === 'preparing',
    ).length,
    inventory: state.notifications.filter(
      (notification) => notification.kind === 'inventory' && !notification.read,
    ).length,
    suppliers: state.purchaseRequests.filter((request) => request.status === 'recommendation').length,
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <BrandMark size={32} />
        <div className="sidebar__wordmark">
          <span className="sidebar__name">ACorp</span>
          <span className="sidebar__sub">Restaurant OS</span>
        </div>
      </div>

      <div>
        <div className="sidebar__section">عملیات</div>
        <nav className="nav">
          {NAV.map((item) => {
            const Icon = item.icon;
            const badge = badges[item.id];
            return (
              <button
                key={item.id}
                type="button"
                className={cn('nav__item', active === item.id && 'nav__item--active')}
                onClick={() => onNavigate(item.id)}
              >
                <span className="nav__icon">
                  <Icon size={15} strokeWidth={1.85} />
                </span>
                {NAV_LABELS_FA[item.id]}
                {badge ? <span className="nav__badge">{faNumber(badge)}</span> : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar__foot">
        <div className="row" style={{ gap: 6, color: 'var(--amber)' }}>
          <CircleDollarSign size={12} />
          <span>شبیه‌سازی کسب‌وکار</span>
        </div>
        <span>
          تمام اعداد از یک موتور قطعی با دانهٔ ثابت تولید می‌شوند؛ هیچ دادهٔ واقعی یا اتصال به سرویس خارجی وجود ندارد.
        </span>
        <div className="sidebar__seed">
          <span>SEED</span>
          <span className="t-code">{SIMULATION_SEED}</span>
        </div>
        <div className="sidebar__seed">
          <span>نسخه</span>
          <span className="t-code">v{SIMULATION_VERSION}</span>
        </div>
      </div>

      <div className="row" style={{ gap: 8, paddingInline: 6, color: 'var(--text-3)' }}>
        <Bell size={12} />
        <span style={{ fontSize: 9.5 }}>اعلان‌ها در نوار بالا</span>
      </div>
    </aside>
  );
}
