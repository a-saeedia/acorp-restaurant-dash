import { useMemo } from 'react';
import { AlarmClock, ChefHat, SkipForward } from 'lucide-react';
import { EmptyState, KitchenTicket, Panel, StatusPill } from '../../components';
import { faNumber } from '../../lib/fa';
import { activeOrders } from '../../simulation/selectors';
import { useSimulation } from '../state/SimulationProvider';

export function KitchenScreen() {
  const { state, clockIso, advance, pendingCount } = useSimulation();
  const now = Date.parse(clockIso);

  const board = useMemo(() => activeOrders(state), [state]);
  const columns = useMemo(
    () => ({
      incoming: board.filter(
        (order) => order.status === 'received' || order.status === 'confirmed',
      ),
      cooking: board.filter((order) => order.status === 'preparing'),
      ready: board.filter((order) => order.status === 'ready'),
    }),
    [board],
  );

  return (
    <div className="screen">
      <div className="screen__head">
        <div>
          <div className="screen__title">آشپزخانه</div>
          <div className="screen__hint">
            {faNumber(board.length)} تیکت فعال · تایمرها با ساعت شبیه‌سازی جلو می‌روند
          </div>
        </div>
        <div className="toolbar">
          <StatusPill tone="neutral" dot>
            <AlarmClock size={11} />
            آستانهٔ تأخیر: ۱۲ دقیقه
          </StatusPill>
          <button className="btn btn--sm" onClick={advance} disabled={pendingCount === 0}>
            <SkipForward size={12} />
            رویداد بعدی
          </button>
        </div>
      </div>

      {board.length === 0 ? (
        <Panel title="تختهٔ آشپزخانه">
          <EmptyState
            icon={<ChefHat size={22} />}
            title="تیکت فعالی نیست"
            body="از نوار پایین یک سفارش نمونه ثبت کنید تا تیکت‌ها روی تخته ظاهر شوند."
          />
        </Panel>
      ) : (
        <div className="grid grid-3">
          <Panel title="در انتظار تأیید" subtitle={faNumber(columns.incoming.length)}>
            <div className="stack-cards">
              {columns.incoming.length === 0 ? (
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>خالی</span>
              ) : (
                columns.incoming.map((order) => (
                  <KitchenTicket
                    key={order.id}
                    order={order}
                    elapsedMs={Math.max(0, now - Date.parse(order.createdAtIso))}
                  />
                ))
              )}
            </div>
          </Panel>

          <Panel title="در حال پخت" subtitle={faNumber(columns.cooking.length)}>
            <div className="stack-cards">
              {columns.cooking.length === 0 ? (
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>خالی</span>
              ) : (
                columns.cooking.map((order) => (
                  <KitchenTicket
                    key={order.id}
                    order={order}
                    elapsedMs={Math.max(0, now - Date.parse(order.updatedAtIso))}
                  />
                ))
              )}
            </div>
          </Panel>

          <Panel title="آمادهٔ تحویل" subtitle={faNumber(columns.ready.length)}>
            <div className="stack-cards">
              {columns.ready.length === 0 ? (
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>خالی</span>
              ) : (
                columns.ready.map((order) => (
                  <KitchenTicket
                    key={order.id}
                    order={order}
                    elapsedMs={Math.max(0, now - Date.parse(order.updatedAtIso))}
                  />
                ))
              )}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
