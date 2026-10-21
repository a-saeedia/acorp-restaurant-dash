/**
 * Order construction. Both the synthetic history and the live simulation build
 * orders through these helpers, so prices, costs and recipes can never diverge.
 */

import { CUSTOMIZATION_BY_ID, MENU_BY_ID } from './catalog';
import { recipeCost, resolveRecipe } from './analytics';
import { toFaDigits } from '../lib/fa';
import type {
  Customization,
  IsoDateTime,
  MenuItem,
  Order,
  OrderChannel,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  Toman,
} from './types';

export interface OrderLineInput {
  menuItemId: string;
  quantity: number;
  customizationIds?: readonly string[];
}

export interface BuildOrderInput {
  sequence: number;
  channel: OrderChannel;
  createdAtIso: IsoDateTime;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customerNameFa: string;
  tableFa: string | null;
  lines: readonly OrderLineInput[];
  discountRate?: number;
  cancelReasonFa?: string | null;
}

export function orderIdOf(sequence: number): string {
  return `ord-${sequence}`;
}

/** Persian-facing reference, e.g. sequence 1062 → «۱۰۶۲». */
export function referenceOf(sequence: number): string {
  return toFaDigits(sequence);
}

function customizationOf(id: string): Customization | null {
  return CUSTOMIZATION_BY_ID.get(id) ?? null;
}

export function buildOrderItem(
  menuItemId: string,
  quantity: number,
  customizationIds: readonly string[] = [],
  orderSequence = 0,
  lineIndex = 0,
): OrderItem {
  const menuItem: MenuItem | undefined = MENU_BY_ID.get(menuItemId);
  if (!menuItem) throw new Error(`Unknown menu item: ${menuItemId}`);

  const applied: Customization[] = [];
  for (const id of customizationIds) {
    const customization = customizationOf(id);
    if (customization) applied.push(customization);
  }

  const unitPrice =
    menuItem.price + applied.reduce((sum, customization) => sum + customization.priceDelta, 0);
  const resolvedRecipe = resolveRecipe(menuItem, customizationIds);
  const lineSubtotal = unitPrice * quantity;
  const lineCost = recipeCost(resolvedRecipe, quantity);

  return {
    id: `itm-${orderSequence}-${lineIndex}`,
    menuItemId,
    nameFa: menuItem.nameFa,
    quantity,
    unitPrice,
    customizationIds: applied.map((customization) => customization.id),
    customizationLabelsFa: applied.map((customization) => customization.nameFa),
    lineSubtotal,
    lineCost,
    resolvedRecipe,
  };
}

export function buildOrder(input: BuildOrderInput): Order {
  const items = input.lines.map((line, index) =>
    buildOrderItem(
      line.menuItemId,
      line.quantity,
      line.customizationIds ?? [],
      input.sequence,
      index,
    ),
  );

  const subtotal = items.reduce((sum, item) => sum + item.lineSubtotal, 0);
  const discountRate = input.discountRate ?? 0;
  const discount: Toman = Math.round(subtotal * discountRate);
  const cogs = items.reduce((sum, item) => sum + item.lineCost, 0);
  const prepMinutes = items.reduce((max, item) => {
    const menuItem = MENU_BY_ID.get(item.menuItemId);
    return Math.max(max, menuItem?.prepMinutes ?? 0);
  }, 0);

  return {
    id: orderIdOf(input.sequence),
    reference: referenceOf(input.sequence),
    channel: input.channel,
    status: input.status,
    paymentStatus: input.paymentStatus,
    createdAtIso: input.createdAtIso,
    updatedAtIso: input.createdAtIso,
    customerNameFa: input.customerNameFa,
    tableFa: input.tableFa,
    items,
    subtotal,
    discount,
    total: subtotal - discount,
    cogs,
    prepMinutes,
    cancelReasonFa: input.cancelReasonFa ?? null,
  };
}

/** Sum of every ingredient consumed by an order, in ingredient units. */
export function orderConsumption(order: Order): Map<string, number> {
  const total = new Map<string, number>();
  for (const item of order.items) {
    for (const line of item.resolvedRecipe) {
      total.set(
        line.ingredientId,
        (total.get(line.ingredientId) ?? 0) + line.quantity * item.quantity,
      );
    }
  }
  return total;
}

/** The one place that decides whether an order's stock has been deducted. */
export function hasDeductedInventory(order: Order): boolean {
  return order.status === 'preparing' || order.status === 'ready' || order.status === 'completed';
}
