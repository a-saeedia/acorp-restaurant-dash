import { Warehouse } from 'lucide-react';
import { cn } from '../lib/cn';
import { faMoney, faNumber } from '../lib/fa';
import { STOCK_STATUS_FA } from '../lib/labels';
import type { InventoryRow, StockStatus } from '../simulation/types';
import { PersianText, StatusPill } from './primitives';

/* -------------------------------------------------------------------------- */
/* StockLevelIndicator                                                       */
/* -------------------------------------------------------------------------- */

export interface StockLevelIndicatorProps {
  level: number;
  status: StockStatus;
  /** Position of the reorder threshold on the bar (0…100). */
  thresholdMark?: number;
  className?: string;
}

export function StockLevelIndicator({
  level,
  status,
  thresholdMark = 50,
  className,
}: StockLevelIndicatorProps) {
  return (
    <div className={cn('stock', className)}>
      <div className="stock__bar">
        <div
          className={cn(
            'stock__fill',
            status === 'low' && 'stock__fill--low',
            status === 'critical' && 'stock__fill--critical',
          )}
          style={{ width: `${Math.max(2, Math.min(100, level))}%` }}
        />
        <div
          className="stock__marker"
          style={{ insetInlineStart: `${Math.max(0, Math.min(100, thresholdMark))}%` }}
          title="حد سفارش"
        />
      </div>
    </div>
  );
}

export function stockTone(status: StockStatus): 'green' | 'amber' | 'red' {
  if (status === 'critical') return 'red';
  if (status === 'low') return 'amber';
  return 'green';
}

/* -------------------------------------------------------------------------- */
/* IngredientRow                                                             */
/* -------------------------------------------------------------------------- */

export interface IngredientRowProps {
  row: InventoryRow;
  nearThreshold?: boolean;
}

export function IngredientRow({ row, nearThreshold = false }: IngredientRowProps) {
  return (
    <div className="ingredient">
      <div className="ingredient__name">
        <span className="ingredient__title">{row.ingredient.nameFa}</span>
        <span className="ingredient__sub">{row.supplierNameFa}</span>
      </div>

      <div>
        <PersianText className="ingredient__qty" size={13} weight={600}>
          {faNumber(row.quantity)}
          <span className="ingredient__unit">{row.ingredient.unitLabelFa}</span>
        </PersianText>
      </div>

      <StockLevelIndicator
        level={row.level}
        status={row.status}
        thresholdMark={(row.ingredient.reorderThreshold / (row.ingredient.reorderThreshold * 2)) * 100}
      />

      <div className="ingredient__threshold">
        حد سفارش: {faNumber(row.ingredient.reorderThreshold)}
      </div>

      <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
        <span className="ingredient__cost">{faMoney(row.value, { suffix: false })}</span>
        <StatusPill tone={nearThreshold ? 'blue' : stockTone(row.status)} dot={row.status !== 'healthy'}>
          {nearThreshold ? 'نزدیک حد' : STOCK_STATUS_FA[row.status]}
        </StatusPill>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* InventorySummary                                                          */
/* -------------------------------------------------------------------------- */

export function InventorySummary({
  rows,
  totalValue,
}: {
  rows: InventoryRow[];
  totalValue: number;
}) {
  const critical = rows.filter((row) => row.status === 'critical').length;
  const low = rows.filter((row) => row.status === 'low').length;
  const healthy = rows.length - critical - low;

  return (
    <div className="inventory-summary">
      <div className="inventory-summary__cell">
        <span className="inventory-summary__label">ارزش موجودی</span>
        <span className="inventory-summary__value">{faMoney(totalValue)}</span>
      </div>
      <div className="inventory-summary__cell">
        <span className="inventory-summary__label">متعادل</span>
        <span className="inventory-summary__value t-green">{faNumber(healthy)}</span>
      </div>
      <div className="inventory-summary__cell">
        <span className="inventory-summary__label">کم‌موجود</span>
        <span className="inventory-summary__value t-amber">{faNumber(low)}</span>
      </div>
      <div className="inventory-summary__cell">
        <span className="inventory-summary__label">بحرانی</span>
        <span className="inventory-summary__value t-red">{faNumber(critical)}</span>
      </div>
      <div className="inventory-summary__icon">
        <Warehouse size={15} strokeWidth={1.8} />
      </div>
    </div>
  );
}
