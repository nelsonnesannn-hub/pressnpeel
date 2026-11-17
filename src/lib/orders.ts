// Order persistence — SERVER ONLY.
// Orders are stored in Vercel KV (Redis) so they survive across serverless
// invocations, instances and deploys. Keys:
//   pnp:order:id:{orderId}        -> the order record
//   pnp:order:session:{sessionId} -> the same record, keyed by Stripe checkout session
//   pnp:order:seq                 -> auto-increment counter behind the order number
//
// KV is used whenever KV_REST_API_URL + KV_REST_API_TOKEN are present (Vercel
// injects them for a connected KV store). Locally, or if a KV write fails, an
// in-process Map is used so checkout and the success page never break.
//
// Never import this from a client component.

import { createClient, type VercelKV } from "@vercel/kv";

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

const KEY_PREFIX = "pnp:order:";
const SEQ_KEY = `${KEY_PREFIX}seq`;

function timestamp(): string {
  return new Date().toISOString();
}

function kvCredentials(): { url: string; token: string } | null {
  // Vercel KV injects KV_REST_API_URL / KV_REST_API_TOKEN. A Redis store
  // provisioned through the Vercel Marketplace (Upstash for Redis, the KV
  // successor) injects the UPSTASH_* equivalents, which talk the same REST
  // protocol, so accept those too.
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.UPSTASH_REST_TOKEN ||
    "";
  if (!url || !token) return null;
  return { url, token };
}

function kvConfigured(): boolean {
  return kvCredentials() !== null;
}

let _client: VercelKV | null = null;

function client(): VercelKV | null {
  const creds = kvCredentials();
  if (!creds) return null;
  if (!_client) {
    _client = createClient({ url: creds.url, token: creds.token });
  }
  return _client;
}

export function kvEnabled(): boolean {
  return kvConfigured();
}

function idKey(id: number): string {
  return `${KEY_PREFIX}id:${id}`;
}

function sessionKey(sessionId: string): string {
  return `${KEY_PREFIX}session:${sessionId}`;
}

// ---- in-process fallback (local dev / KV outage) -------------------------

const memoryOrders = new Map<number, OrderRecord>();
const memoryNextId = { value: 1 };

// ---- KV helpers ---------------------------------------------------------

async function kvWrite(c: VercelKV, record: OrderRecord): Promise<void> {
  // Write the record under both keys so it can be read back by order id or
  // by checkout session id.
  await c.set(idKey(record.id), record);
  if (record.stripe_session_id) {
    await c.set(sessionKey(record.stripe_session_id), record);
  }
}

async function kvRead(c: VercelKV, key: string): Promise<OrderRecord | null> {
  const raw = await c.get<OrderRecord>(key);
  if (!raw) return null;
  // Upstash returns the stored object as-is for JSON values.
  return raw as OrderRecord;
}

// ---- public API ---------------------------------------------------------

export async function createOrder(input: NewOrder): Promise<number> {
  const now = timestamp();
  const record: OrderRecord = {
    id: 0,
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
  };

  const c = client();
  if (c) {
    try {
      const id = await c.incr(SEQ_KEY);
      record.id = id;
      await kvWrite(c, record);
      return id;
    } catch (err) {
      console.error("KV write failed, falling back to memory:", err);
    }
  }

  record.id = memoryNextId.value++;
  memoryOrders.set(record.id, record);
  return record.id;
}

// ---- quote enquiries (kiss-cut sticker pricing) --------------------------
// The kiss-cut form posts its own computed price, but the server recomputes it
// and stores the enquiry so the record carries the authoritative numbers.

export type QuoteEnquiry = {
  id: number;
  source: string;
  fields: Record<string, string>;
  sizeCm: number | null;
  finish: string | null;
  stickerCount: number | null;
  perStickerCents: number | null;
  totalCents: number | null;
  created_at: string;
};

const ENQUIRY_PREFIX = "pnp:enquiry:";
const ENQUIRY_SEQ_KEY = `${ENQUIRY_PREFIX}seq`;

const memoryEnquiries = new Map<number, QuoteEnquiry>();
const memoryEnquiryNextId = { value: 1 };

export async function createEnquiry(
  input: Omit<QuoteEnquiry, "id" | "created_at">
): Promise<number> {
  const record: QuoteEnquiry = {
    ...input,
    id: 0,
    created_at: timestamp(),
  };

  const c = client();
  if (c) {
    try {
      const id = await c.incr(ENQUIRY_SEQ_KEY);
      record.id = id;
      await c.set(`${ENQUIRY_PREFIX}id:${id}`, record);
      return id;
    } catch (err) {
      console.error("KV enquiry write failed, falling back to memory:", err);
    }
  }

  record.id = memoryEnquiryNextId.value++;
  memoryEnquiries.set(record.id, record);
  return record.id;
}

export async function getOrderById(id: number): Promise<OrderRecord | null> {
  const c = client();
  if (c) {
    try {
      const record = await kvRead(c, idKey(id));
      if (record) return record;
    } catch (err) {
      console.error("KV read failed, falling back to memory:", err);
    }
  }
  return memoryOrders.get(id) ?? null;
}

export async function getOrderBySession(
  sessionId: string
): Promise<OrderRecord | null> {
  const c = client();
  if (c) {
    try {
      const record = await kvRead(c, sessionKey(sessionId));
      if (record) return record;
    } catch (err) {
      console.error("KV read failed, falling back to memory:", err);
    }
  }
  for (const order of memoryOrders.values()) {
    if (order.stripe_session_id === sessionId) return order;
  }
  return null;
}

export async function setStripeSession(
  orderId: number,
  sessionId: string
): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order) return;
  order.stripe_session_id = sessionId;
  order.updated_at = timestamp();

  const c = client();
  if (c) {
    try {
      await kvWrite(c, order);
      return;
    } catch (err) {
      console.error("KV write failed, falling back to memory:", err);
    }
  }
  memoryOrders.set(order.id, order);
}

export async function markOrderPaid(
  orderId: number,
  paymentStatus: string
): Promise<OrderRecord | null> {
  const order = await getOrderById(orderId);
  if (!order) return null;
  order.status = "paid";
  order.stripe_payment_status = paymentStatus;
  order.updated_at = timestamp();

  const c = client();
  if (c) {
    try {
      await kvWrite(c, order);
      return order;
    } catch (err) {
      console.error("KV write failed, falling back to memory:", err);
    }
  }
  memoryOrders.set(order.id, order);
  return order;
}

export async function setNotified(
  orderId: number,
  field: "submitted" | "paid"
): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order) return;
  if (field === "submitted") order.notified_submitted = 1;
  else order.notified_paid = 1;
  order.updated_at = timestamp();

  const c = client();
  if (c) {
    try {
      await kvWrite(c, order);
      return;
    } catch (err) {
      console.error("KV write failed, falling back to memory:", err);
    }
  }
  memoryOrders.set(order.id, order);
}

/** All stored orders (KV scan) — handy for future admin views. */
export async function listOrders(limit = 100): Promise<OrderRecord[]> {
  const c = client();
  if (!c) return [...memoryOrders.values()].slice(-limit);
  const out: OrderRecord[] = [];
  let cursor = "0";
  do {
    const [next, keys] = await c.scan(cursor, {
      match: `${KEY_PREFIX}id:*`,
      count: 100,
    });
    cursor = next;
    for (const key of keys) {
      const record = await kvRead(c, key);
      if (record) out.push(record);
    }
  } while (cursor !== "0" && out.length < limit);
  return out.sort((a, b) => b.id - a.id).slice(0, limit);
}
