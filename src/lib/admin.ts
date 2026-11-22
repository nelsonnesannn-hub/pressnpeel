// Admin queries — SERVER ONLY.
// Reads the order store and shapes it for the /admin screens: payment and
// fulfilment as two separate statuses, income split by payment state, this
// weekend's delivery list, the design-approval queue and the repeat-customer
// view. Nothing here deletes anything — orders are only ever status-changed.

import {
  listAllOrders,
  createOrder,
  type OrderRecord,
  type OrderItemRecord,
  type OrderFeeRecord,
} from "./orders";
import { adminPasswordConfigured } from "./admin-auth";
import { getStockState, stockLineStates, type StockLineState } from "./stock";
import type {
  AdminOrder,
  AdminOrderItem,
  AdminData,
  FulfilmentStatus,
  IncomeSummary,
  PaymentStatus,
} from "./admin-types";

export const HOLD_DAYS = 7;

const PAYMENT_STATUSES: PaymentStatus[] = [
  "held",
  "captured",
  "released",
  "refunded",
  "pending",
  "unpaid",
];

const FULFILMENT_STATUSES: FulfilmentStatus[] = [
  "pending_approval",
  "in_production",
  "ready",
  "done",
  "cancelled",
];

// ---- dates ---------------------------------------------------------------

/** Saturday of the delivery weekend: order date + 14 days, advanced to Sat. */
export function deliveryWeekendFor(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const target = new Date(d.getTime() + 14 * 86400000);
  while (target.getUTCDay() !== 6) target.setUTCDate(target.getUTCDate() + 1);
  return target.toISOString().slice(0, 10);
}

/** The Saturday of the current weekend (today when run on a Saturday). */
export function currentWeekendSaturday(): string {
  const now = new Date();
  const target = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  while (target.getUTCDay() !== 6) target.setUTCDate(target.getUTCDate() + 1);
  return target.toISOString().slice(0, 10);
}

// ---- derivation ----------------------------------------------------------

function derivePaymentStatus(o: OrderRecord): PaymentStatus {
  const stored = o.payment_status as PaymentStatus | null;
  if (stored && PAYMENT_STATUSES.includes(stored)) return stored;
  const paid = o.stripe_payment_status === "paid" || o.status === "paid";
  if (paid) return o.capture_method === "manual" ? "held" : "captured";
  if (o.stripe_session_id) return "pending";
  return "unpaid";
}

function deriveFulfilmentStatus(o: OrderRecord): FulfilmentStatus {
  const stored = o.fulfilment_status as FulfilmentStatus | null;
  if (stored && FULFILMENT_STATUSES.includes(stored)) return stored;
  const pay = derivePaymentStatus(o);
  if (pay === "released" || pay === "refunded") return "cancelled";
  return "pending_approval";
}

function orderTotalCents(o: OrderRecord): number {
  if (o.items && o.items.length > 0) {
    const lines = o.items.reduce((sum, item) => sum + (item.lineCents || 0), 0);
    const fees = (o.fees ?? []).reduce((sum, fee) => sum + fee.amountCents, 0);
    return Math.max(0, lines + fees - (o.discount_cents ?? 0));
  }
  return Math.max(0, Math.round((o.total ?? 0) * 100));
}

function orderDeliveryCents(o: OrderRecord): number {
  return (o.fees ?? [])
    .filter((fee) => fee.label.startsWith("Delivery"))
    .reduce((sum, fee) => sum + fee.amountCents, 0);
}

function holdExpiry(o: OrderRecord, payment: PaymentStatus): string | null {
  if (o.capture_method !== "manual") return null;
  if (payment !== "held") return null;
  const created = new Date(o.created_at);
  if (Number.isNaN(created.getTime())) return null;
  return new Date(created.getTime() + HOLD_DAYS * 86400000).toISOString();
}

function toAdminItems(o: OrderRecord): AdminOrderItem[] {
  return (o.items ?? []).map((item: OrderItemRecord) => ({
    kind: item.kind,
    name: item.name,
    detail: item.detail,
    unitCents: item.unitCents,
    quantity: item.quantity,
    lineCents: item.lineCents,
    image: item.image,
    productSlug: item.productSlug,
    optionId: item.optionId,
    priceUnit: item.priceUnit,
    designFiles: item.custom?.files,
  }));
}

function itemsSummary(o: OrderRecord, items: AdminOrderItem[]): string {
  if (items.length === 0) {
    return o.product_name ? `${o.product_name} × ${o.quantity ?? 1}` : "—";
  }
  const parts = items.map(
    (item) => `${item.name}${item.quantity > 1 ? ` × ${item.quantity}` : ""}`
  );
  const joined = parts.join(", ");
  return joined.length > 90 ? `${joined.slice(0, 87)}…` : joined;
}

export function normalizeOrder(o: OrderRecord): AdminOrder {
  const paymentStatus = derivePaymentStatus(o);
  const fulfilmentStatus = deriveFulfilmentStatus(o);
  const items = toAdminItems(o);
  const deliveryWeekend =
    o.delivery_weekend ?? deliveryWeekendFor(o.created_at);
  const expiresAt = holdExpiry(o, paymentStatus);
  const daysLeft = expiresAt
    ? Math.ceil(
        (new Date(expiresAt).getTime() - Date.now()) / 86400000
      )
    : null;

  return {
    id: o.id,
    number: String(o.id).padStart(3, "0"),
    date: o.created_at,
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    customerPhone: o.customer_phone,
    address: o.address,
    items,
    itemsSummary: itemsSummary(o, items),
    fees: (o.fees ?? []).map((fee: OrderFeeRecord) => ({
      label: fee.label,
      amountCents: fee.amountCents,
    })),
    deliveryCents: orderDeliveryCents(o),
    discountCents: o.discount_cents ?? 0,
    discountCode: o.discount_code,
    totalCents: orderTotalCents(o),
    paymentStatus,
    fulfilmentStatus,
    deliveryWeekend,
    deliveryLabel: deliveryWeekend,
    urgent: Boolean(o.urgent),
    source: o.source === "manual" ? "manual" : "site",
    notes: o.notes,
    adminNotes: o.admin_notes ?? null,
    stripeSessionId: o.stripe_session_id,
    stripeRef: o.stripe_session_id,
    captureMethod: o.capture_method,
    holdExpiresAt: expiresAt,
    holdDaysLeft: daysLeft,
    repeatCustomer: Boolean(o.repeat_customer),
    designFiles: (o.design_files ?? []).map((file, index) => ({
      itemId: file.itemId || `design-${index}`,
      name: file.name,
      mimeType: file.mimeType,
    })),
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  };
}

/** Orders for the admin list: Held first (soonest expiry), then newest. */
export async function listAdminOrders(): Promise<AdminOrder[]> {
  const records = await listAllOrders();
  const orders = records.map(normalizeOrder);
  return orders.sort((a, b) => {
    const aHeld = a.paymentStatus === "held" ? 0 : 1;
    const bHeld = b.paymentStatus === "held" ? 0 : 1;
    if (aHeld !== bHeld) return aHeld - bHeld;
    if (aHeld === 0 && bHeld === 0) {
      const aExpiry = a.holdExpiresAt ?? "";
      const bExpiry = b.holdExpiresAt ?? "";
      if (aExpiry !== bExpiry) return aExpiry < bExpiry ? -1 : 1;
    }
    return b.id - a.id;
  });
}

export function getIncome(orders: AdminOrder[]): IncomeSummary {
  const summary: IncomeSummary = {
    capturedCents: 0,
    heldCents: 0,
    releasedCents: 0,
    refundedCents: 0,
    byMonth: [],
    byProduct: [],
  };
  const months = new Map<
    string,
    { month: string; capturedCents: number; heldCents: number; refundedCents: number }
  >();
  const products = new Map<
    string,
    {
      name: string;
      capturedCents: number;
      heldCents: number;
      refundedCents: number;
      units: number;
    }
  >();

  for (const order of orders) {
    const month = order.date.slice(0, 7);
    if (!months.has(month)) {
      months.set(month, {
        month,
        capturedCents: 0,
        heldCents: 0,
        refundedCents: 0,
      });
    }
    const bucket = months.get(month)!;
    const target =
      order.paymentStatus === "captured"
        ? "capturedCents"
        : order.paymentStatus === "held"
        ? "heldCents"
        : order.paymentStatus === "refunded"
        ? "refundedCents"
        : null;
    if (target) {
      summary[target] += order.totalCents;
      bucket[target] += order.totalCents;
    }

    for (const item of order.items) {
      const name = item.name;
      if (!products.has(name)) {
        products.set(name, {
          name,
          capturedCents: 0,
          heldCents: 0,
          refundedCents: 0,
          units: 0,
        });
      }
      const row = products.get(name)!;
      row.units += item.quantity;
      if (order.paymentStatus === "captured") row.capturedCents += item.lineCents;
      else if (order.paymentStatus === "held") row.heldCents += item.lineCents;
      else if (order.paymentStatus === "refunded") row.refundedCents += item.lineCents;
    }
  }

  summary.byMonth = [...months.values()].sort((a, b) =>
    a.month < b.month ? 1 : -1
  );
  summary.byProduct = [...products.values()].sort(
    (a, b) => b.capturedCents + b.heldCents - (a.capturedCents + a.heldCents)
  );
  return summary;
}

export function getDeliveries(
  orders: AdminOrder[],
  weekend: string
): AdminOrder[] {
  return orders.filter(
    (order) =>
      order.deliveryWeekend === weekend &&
      order.fulfilmentStatus !== "cancelled" &&
      order.paymentStatus !== "released"
  );
}

export function getApprovalQueue(orders: AdminOrder[]): AdminOrder[] {
  return orders.filter(
    (order) =>
      order.fulfilmentStatus === "pending_approval" &&
      order.items.some((item) => item.kind === "custom")
  );
}

export function getRepeatCustomers(orders: AdminOrder[]): AdminData["repeatCustomers"] {
  const map = new Map<
    string,
    { name: string; email: string; phone: string | null; orders: number; flagged: boolean }
  >();
  for (const order of orders) {
    const key = (order.customerEmail || order.customerPhone || order.customerName).toLowerCase();
    if (!key) continue;
    const existing = map.get(key);
    if (existing) {
      existing.orders += 1;
      existing.flagged = existing.flagged || order.repeatCustomer;
    } else {
      map.set(key, {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        orders: 1,
        flagged: order.repeatCustomer,
      });
    }
  }
  return [...map.values()]
    .filter((entry) => entry.orders > 1 || entry.flagged)
    .sort((a, b) => b.orders - a.orders);
}

export async function getAdminData(): Promise<AdminData> {
  const [records, stockState] = await Promise.all([listAllOrders(), getStockState()]);
  const orders = records.map(normalizeOrder);
  const weekend = currentWeekendSaturday();
  const stock: StockLineState[] = stockLineStates(stockState);
  return {
    orders: await listAdminOrders(),
    income: getIncome(orders),
    stock,
    deliveryWeekend: weekend,
    deliveryLabel: weekend,
    deliveries: getDeliveries(orders, weekend),
    approvals: getApprovalQueue(orders),
    repeatCustomers: getRepeatCustomers(orders),
    passwordConfigured: adminPasswordConfigured(),
  };
}

// ---- manual / WhatsApp orders --------------------------------------------

export type ManualOrderInput = {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: string;
  items: {
    name: string;
    detail?: string;
    quantity: number;
    unitCents: number;
    lineCents: number;
  }[];
  fees?: { label: string; amountCents: number }[];
  discountCents?: number;
  discountCode?: string;
  totalCents: number;
  paymentStatus: PaymentStatus;
  fulfilmentStatus: FulfilmentStatus;
  deliveryWeekend?: string;
  urgent?: boolean;
  notes?: string;
  adminNotes?: string;
  designFiles?: { name: string; mimeType: string }[];
};

/** Record a WhatsApp / phone order so it counts in income and invoices. */
export async function createManualOrder(input: ManualOrderInput): Promise<number> {
  const items: OrderItemRecord[] = input.items.map((item, index) => ({
    kind: "custom",
    name: item.name,
    detail: item.detail ?? "",
    unitCents: item.unitCents,
    quantity: item.quantity,
    lineCents: item.lineCents,
    custom: {
      type: "die-cut",
      finish: "Manual order",
      sizeCm: 0,
      stickerCount: item.quantity,
      files: [],
    },
    optionId: `manual-${index}`,
  }));
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  return createOrder({
    customerName: input.customerName,
    customerEmail: input.customerEmail ?? "",
    customerPhone: input.customerPhone,
    orderType: "manual",
    total: input.totalCents / 100,
    notes: input.notes,
    designUrl: input.designFiles?.[0]?.name,
    productSlug: "manual",
    productName: "Manual / WhatsApp order",
    optionLabel: `${items.length} item${items.length === 1 ? "" : "s"}`,
    unitPrice: input.totalCents / 100,
    quantity,
    items,
    fees: input.fees,
    discountCents: input.discountCents,
    discountCode: input.discountCode,
    captureMethod: input.paymentStatus === "captured" ? "automatic" : "manual",
    source: "manual",
    paymentStatus: input.paymentStatus,
    fulfilmentStatus: input.fulfilmentStatus,
    address: input.address,
    deliveryWeekend: input.deliveryWeekend,
    urgent: input.urgent,
    adminNotes: input.adminNotes,
    designFiles: (input.designFiles ?? []).map((file, index) => ({
      itemId: `manual-${index}`,
      name: file.name,
      mimeType: file.mimeType,
    })),
  });
}
