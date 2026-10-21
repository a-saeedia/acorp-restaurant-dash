import { useMemo } from 'react';
import { Boxes, History, TriangleAlert } from 'lucide-react';
import {
  EmptyState,
  IngredientRow,
  InventorySummary,
  Panel,
  StatusPill,
} from '../../components';
import { faMoney, faNumber } from '../../lib/fa';
import { INVENTORY_TX_FA } from '../../lib/labels';
import {
  inventoryRows,
  isNearThreshold,
  lastInventoryTransactions,
  lowStockRows,
  nearThresholdRows,
} from '../../simulation/selectors';
import { useSimulation } from '../state/SimulationProvider';

export function InventoryScreen() {
  const { state } = useSimulation();

  const rows = useMemo(() => inventoryRows(state), [state]);
  const low = useMemo(() => lowStockRows(state), [state]);
  const near = useMemo(() => nearThresholdRows(state), [state]);
  const transactions = useMemo(() => lastInventoryTransactions(state, 9), [state]);
  const totalValue = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <div className="screen">
      <div className="screen__head">
        <div>
          <div className="screen__title">موجودی</div>
          <div className="screen__hint">
            هر کسری موجودی همان لحظه به رویداد خرید و تحلیل متصل می‌شود
          </div>
        </div>
        <StatusPill tone={low.length > 0 ? 'red' : near.length > 0 ? 'amber' : 'green'} dot>
          {low.length > 0
            ? `${faNumber(low.length)} قلم زیر حد`
            : near.length > 0
              ? `${faNumber(near.length)} قلم نزدیک حد`
              : 'همه بالای حد'}
        </StatusPill>
      </div>

      <InventorySummary rows={rows} totalValue={totalValue} />

      <div className="grid grid-2-1">
        <Panel title="اقلام انبار" subtitle={`${faNumber(rows.length)} قلم`} bodyClassName="panel__body--tight">
          <table className="table">
            <thead>
              <tr>
                <th>قلم</th>
                <th>موجودی</th>
                <th>سطح</th>
                <th>حد سفارش</th>
                <th className="end">ارزش</th>
                <th className="end">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.ingredient.id}>
                  <td>
                    <div style={{ fontWeight: 550 }}>{row.ingredient.nameFa}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{row.supplierNameFa}</div>
                  </td>
                  <td className="num">
                    {faNumber(row.quantity)}
                    <span style={{ fontSize: 10, color: 'var(--text-3)', marginInlineStart: 3 }}>
                      {row.ingredient.unitLabelFa}
                    </span>
                  </td>
                  <td style={{ minWidth: 96 }}>
                    <div className="stock" style={{ width: 84 }}>
                      <div className="stock__bar">
                        <div
                          className={
                            row.status === 'critical'
                              ? 'stock__fill stock__fill--critical'
                              : row.status === 'low'
                                ? 'stock__fill stock__fill--low'
                                : 'stock__fill'
                          }
                          style={{ width: `${Math.max(3, row.level)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="num">{faNumber(row.ingredient.reorderThreshold)}</td>
                  <td className="num">{faMoney(row.value, { suffix: false })}</td>
                  <td className="end">
                    <StatusPill
                      tone={isNearThreshold(row) ? 'blue' : row.status === 'healthy' ? 'green' : row.status === 'low' ? 'amber' : 'red'}
                      dot={row.status !== 'healthy'}
                    >
                      {isNearThreshold(row) ? 'نزدیک حد' : row.status === 'healthy' ? 'متعادل' : row.status === 'low' ? 'کم' : 'بحرانی'}
                    </StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <div className="stack-cards">
          <Panel
            title="هشدارهای موجودی"
            subtitle={low.length > 0 ? 'زیر حد سفارش' : 'نزدیک حد سفارش'}
          >
            {low.length === 0 && near.length === 0 ? (
              <EmptyState
                icon={<Boxes size={20} />}
                title="انبار متعادل است"
                body="با ثبت سفارش نمونه، گوشت و پنیر زیر حد می‌روند."
              />
            ) : (
              <div className="stack-1">
                {(low.length > 0 ? low : near).map((row) => (
                  <IngredientRow
                    key={row.ingredient.id}
                    row={row}
                    nearThreshold={isNearThreshold(row)}
                  />
                ))}
              </div>
            )}
          </Panel>

          <Panel title="آخرین تراکنش‌ها" subtitle="حرکت موجودی">
            <div className="stack-1">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="row"
                  style={{ justifyContent: 'space-between', gap: 8, paddingBottom: 6 }}
                >
                  <span className="row" style={{ gap: 7 }}>
                    <History size={12} style={{ color: 'var(--text-3)' }} />
                    <span style={{ fontSize: 11 }}>{INVENTORY_TX_FA[tx.kind]}</span>
                  </span>
                  <span
                    className="t-num"
                    style={{
                      fontSize: 11,
                      color: tx.delta < 0 ? 'var(--red)' : 'var(--green)',
                    }}
                  >
                    {tx.delta > 0 ? '+' : ''}
                    {faNumber(tx.delta)}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <Panel
        title="اثر سفارش روی انبار"
        subtitle="همان قلم، دو حالت"
        actions={
          <span className="row" style={{ gap: 6, color: 'var(--text-3)', fontSize: 10.5 }}>
            <TriangleAlert size={11} />
            کسری موجودی به‌صورت خودکار پیشنهاد خرید می‌سازد
          </span>
        }
      >
        <div className="grid grid-3">
          <div className="rec">
            <div className="rec__body">
              <div className="rec__title">۱. سفارش ثبت می‌شود</div>
              <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
                دستور پخت هر قلم، مواد اولیه را دقیق کم می‌کند.
              </span>
            </div>
          </div>
          <div className="rec">
            <div className="rec__body">
              <div className="rec__title">۲. حد سفارش بررسی می‌شود</div>
              <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
                اگر موجودی زیر حد برود، وضعیت «کم» یا «بحرانی» می‌شود.
              </span>
            </div>
          </div>
          <div className="rec">
            <div className="rec__body">
              <div className="rec__title">۳. پیشنهاد خرید ساخته می‌شود</div>
              <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
                مقدار پیشنهادی از تفاضل موجودی و حد سفارش محاسبه می‌شود.
              </span>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
