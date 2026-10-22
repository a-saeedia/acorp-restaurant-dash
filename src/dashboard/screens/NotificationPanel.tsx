import { X } from 'lucide-react';
import { NotificationFeed } from '../../components';
import { faNumber } from '../../lib/fa';
import { useSimulation } from '../state/SimulationProvider';

export function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, clockIso } = useSimulation();
  if (!open) return null;

  const notifications = [...state.notifications].sort(
    (a, b) => Date.parse(b.atIso) - Date.parse(a.atIso),
  );

  return (
    <>
      <button className="sheet__scrim" type="button" aria-label="بستن" onClick={onClose} />
      <aside className="sheet">
        <header className="sheet__head">
          <div>
            <div className="sheet__title">اعلان‌ها</div>
            <div className="sheet__sub">
              {faNumber(notifications.filter((item) => !item.read).length)} خوانده‌نشده
            </div>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="بستن">
            <X size={14} />
          </button>
        </header>
        <div className="sheet__body">
          <NotificationFeed notifications={notifications} nowIso={clockIso} limit={40} />
        </div>
        <footer className="sheet__foot">
          همهٔ اعلان‌ها از رویدادهای شبیه‌سازی ساخته می‌شوند؛ هیچ پیامی ارسال نمی‌شود.
        </footer>
      </aside>
    </>
  );
}
