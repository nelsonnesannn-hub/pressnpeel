// Order persistence — SERVER ONLY.
// Orders are held in process memory. The site deploys to Vercel, where the
// filesystem is ephemeral and a SQLite file cannot survive between invocations,
// so the old better-sqlite3 layer (src/lib/db.ts) is gone. Nothing is lost from
// Nelson's side: /api/checkout pings Telegram with the full order and stores the
// same fields in the Stripe Checkout Session metadata. This store only backs
// the on-screen order number, the success-page summary and the one-time
// "paid" notification flag, so it deliberately has no external dependency.
// Never import this from a client component.

export type OrderRecord = {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  order_type: string;
  status: string;
  total: number;
  notes: string | null;
  design_url: string | null;
  product_slug: string | null;
  product_name: string | null;
  option_label: string | null;
  unit_price: number | null;
  quantity: number | null;
  stripe_session_id: string | null;
  stripe_payment_status: string | null;
  notified_submitted: number;
  notified_paid: number;
  created_at: string;
  updated_at: string;
};

export type NewOrder = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderType: string;
  total: number;
  notes?: string;
  designUrl?: string;
  productSlug: string;
  productName: string;
  optionLabel: string;
  unitPrice: number;
  quantity: number;
};

const orders = new Map<number, OrderRecord>();
let nextId = 1;

function timestamp(): string {
  return new Date().toISOString();
}

export function createOrder(input: NewOrder): number {
  const id = nextId++;
  const now = timestamp();
  orders.set(id, {
    id,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_phone: input.customerPhone ?? null,
    order_type: input.orderType,
    status: "pending_payment",
    total: input.total,
    notes: input.notes ?? null,
    design_url: input.designUrl ?? null,
    product_slug: input.productSlug,
    product_name: input.productName,
    option_label: input.optionLabel,
    unit_price: input.unitPrice,
    quantity: input.quantity,
    stripe_session_id: null,
    stripe_payment_status: null,
    notified_submitted: 0,
    notified_paid: 0,
    created_at: now,
    updated_at: now,
  });
  return id;
}

export function getOrderBySession(sessionId: string): OrderRecord | null {
  for (const order of orders.values()) {
    if (order.stripe_session_id === sessionId) return order;
  }
  return null;
}

export function getOrderById(id: number): OrderRecord | null {
  return orders.get(id) ?? null;
}

export function setStripeSession(orderId: number, sessionId: string): void {
  const order = orders.get(orderId);
  if (!order) return;
  order.stripe_session_id = sessionId;
  order.updated_at = timestamp();
}

export function markOrderPaid(orderId: number, paymentStatus: string): void {
  const order = orders.get(orderId);
  if (!order) return;
  order.status = "paid";
  order.stripe_payment_status = paymentStatus;
  order.updated_at = timestamp();
}

export function setNotified(
  orderId: number,
  field: "submitted" | "paid"
): void {
  const order = orders.get(orderId);
  if (!order) return;
  if (field === "submitted") order.notified_submitted = 1;
  else order.notified_paid = 1;
  order.updated_at = timestamp();
}
