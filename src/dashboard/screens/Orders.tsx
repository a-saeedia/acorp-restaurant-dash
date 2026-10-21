import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  ChefHat,
  CreditCard,
  MapPin,
  QrCode,
  ReceiptText,
  Truck,
} from 'lucide-react';
import {
  EmptyState,
  KeyValue,
  OrderCard,
  OrderStatusTrail,
  Panel,
  StatusPill,
} from '../../components';
import { cn } from '../../lib/cn';
import { faMoney, faNumber, faTime } from '../../lib/fa';
import { CHANNEL_FA, PAYMENT_FA } from '../../lib/labels';
import { useSimulation } from '../state/SimulationProvider';
import type { OrderChannel } from '../../simulation/types';

const FILTERS: Array<{ key: 'all' | OrderChannel; label: string }> = [
  { key: 'all', label: 'همه' },
  { key: 'qr', label: 'QR سر میز' },
  { key: 'delivery', label: 'ارسال با پیک' },
];

export function OrdersScreen() {
  const { state } = useSimulation();
  const [filter, setFilter] = useState<'all' | OrderChannel>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const orders = useMemo(
    () =>
      [...state.orders]
        .filter((order) => (filter === 'all' ? true : order.channel === filter))
        .sort((a, b) => Date.parse(b.createdAtIso) - Date.parse(a.createdAtIso)),
    [state.orders, filter],
  );

  const selected = useMemo(
    () => orders.find((order) => order.id === selectedId) ?? orders[0] ?? null,
    [orders, selectedId],
  );

  const openCount = orders.filter(
    (order) => order.status !== 'completed' && order.status !== 'cancelled',
  ).length;

  return (
    <div className="screen">
      <div className="screen__head">
        <div>
          <div className="screen__title">سفارش‌ها</div>
          <div className="screen__hint">
            {faNumber(orders.length)} سفارش امروز · {faNumber(openCount)} در جریان
          </div>
        </div>
        <div className="segmented">
          {FILTERS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={cn('segmented__item', filter === option.key && 'segmented__item--active')}
              onClick={() => setFilter(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="split-orders">
        <Panel
          title="صف سفارش‌ها"
          subtitle={`${faNumber(orders.length)} مورد`}
          bodyClassName="panel__body--tight"
        >
          {orders.length === 0 ? (
            <EmptyState title="سفارشی نیست" body="فیلتر دیگری را امتحان کنید." />
          ) : (
            <div className="orders-list__scroll">
              <div className="orders-list">
                {orders.slice(0, 60).map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    compact
                    selected={order.id === selected?.id}
                    onSelect={() => setSelectedId(order.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </Panel>

        {selected ? (
          <div className="stack-cards">
            <Panel
              title={`سفارش ${selected.reference}`}
              subtitle={`${CHANNEL_FA[selected.channel]} · ${selected.tableFa ?? selected.customerNameFa}`}
              actions={
                <StatusPill tone={selected.status === 'cancelled' ? 'red' : 'amber'} dot>
                  {selected.status === 'completed' ? 'بسته‌شده' : 'در جریان'}
                </StatusPill>
              }
            >
              <OrderStatusTrail status={selected.status} />

              <div className="divider" style={{ margin: '14px 0' }} />

              <div className="stack-2">
                {selected.items.map((item) => (
                  <div key={item.id} className="stack-1">
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span className="row" style={{ gap: 8 }}>
                        <span className="order__qty">×{item.quantity}</span>
                        <span style={{ fontSize: 13, fontWeight: 550 }}>{item.nameFa}</span>
                      </span>
                      <span className="t-num" style={{ fontSize: 12 }}>
                        {faMoney(item.lineSubtotal)}
                      </span>
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

              <div className="divider" style={{ margin: '14px 0' }} />

              <div className="grid grid-2" style={{ gap: 18 }}>
                <div>
                  <KeyValue label="جمع اقلام" value={faMoney(selected.subtotal)} />
                  <KeyValue label="تخفیف" value={`−${faMoney(selected.discount)}`} tone="red" />
                  <KeyValue label="مبلغ نهایی" value={faMoney(selected.total)} total />
                </div>
                <div>
                  <KeyValue label="بهای تمام‌شده" value={faMoney(selected.cogs)} />
                  <KeyValue
                    label="سود ناخالص"
                    value={faMoney(selected.total - selected.cogs)}
                    tone="green"
                  />
                  <KeyValue
                    label="وضعیت پرداخت"
                    value={PAYMENT_FA[selected.paymentStatus]}
                    tone={selected.paymentStatus === 'paid' ? 'green' : 'amber'}
                  />
                </div>
              </div>
            </Panel>

            <div className="grid grid-3" style={{ gap: 12 }}>
              <Panel title="کانال" bodyClassName="panel__body--tight">
                <div className="row" style={{ gap: 8 }}>
                  {selected.channel === 'qr' ? <QrCode size={15} /> : <Truck size={15} />}
                  <span style={{ fontSize: 12 }}>{CHANNEL_FA[selected.channel]}</span>
                </div>
                <div className="row" style={{ gap: 8, marginTop: 6, color: 'var(--text-3)' }}>
                  <MapPin size={12} />
                  <span style={{ fontSize: 11 }}>{selected.tableFa ?? selected.customerNameFa}</span>
                </div>
              </Panel>
              <Panel title="زمان" bodyClassName="panel__body--tight">
                <div className="row" style={{ gap: 8 }}>
                  <ReceiptText size={15} />
                  <span className="t-num" style={{ fontSize: 12 }}>
                    {faTime(selected.createdAtIso)}
                  </span>
                </div>
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-3)' }}>
                  زمان آماده‌سازی: {faNumber(selected.prepMinutes)} دقیقه
                </div>
              </Panel>
              <Panel title="پرداخت" bodyClassName="panel__body--tight">
                <div className="row" style={{ gap: 8 }}>
                  <CreditCard size={15} />
                  <span style={{ fontSize: 12 }}>{PAYMENT_FA[selected.paymentStatus]}</span>
                </div>
                <div className="row" style={{ gap: 6, marginTop: 6, color: 'var(--text-3)' }}>
                  <BadgeCheck size={12} />
                  <span style={{ fontSize: 11 }}>تراکنش شبیه‌سازی‌شده</span>
                </div>
              </Panel>
            </div>
          </div>
        ) : (
          <Panel title="جزئیات سفارش">
            <EmptyState icon={<ChefHat size={20} />} title="سفارشی انتخاب نشده" />
          </Panel>
        )}
      </div>
    </div>
  );
}
