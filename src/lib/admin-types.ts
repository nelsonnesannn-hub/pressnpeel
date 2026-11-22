// Admin view types — PUBLIC, client-safe (no KV / server imports).
// Shared by the /api/admin routes and the admin UI.

export type PaymentStatus =
  | "held"
  | "captured"
  | "released"
  | "refunded"
  | "pending"
  | "unpaid";

export type FulfilmentStatus =
  | "pending_approval"
  | "in_production"
  | "ready"
  | "done"
  | "cancelled";

export type OrderSource = "site" | "manual";

export type AdminOrderItem = {
  kind: "fixed" | "custom";
  name: string;
  detail: string;
  unitCents: number;
  quantity: number;
  lineCents: number;
  image?: string;
  productSlug?: string;
  optionId?: string;
  priceUnit?: string;
  designFiles?: { name: string; size: number; type: string }[];
};

export type AdminOrder = {
  id: number;
  number: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  address: string | null;
  items: AdminOrderItem[];
  itemsSummary: string;
  fees: { label: string; amountCents: number }[];
  deliveryCents: number;
  discountCents: number;
  discountCode: string | null;
  totalCents: number;
  paymentStatus: PaymentStatus;
  fulfilmentStatus: FulfilmentStatus;
  deliveryWeekend: string | null;
  deliveryLabel: string | null;
  urgent: boolean;
  source: OrderSource;
  notes: string | null;
  adminNotes: string | null;
  stripeSessionId: string | null;
  stripeRef: string | null;
  captureMethod: string | null;
  holdExpiresAt: string | null;
  holdDaysLeft: number | null;
  repeatCustomer: boolean;
  designFiles: { itemId: string; name: string; mimeType: string }[];
  createdAt: string;
  updatedAt: string;
};

export type IncomeSummary = {
  capturedCents: number;
  heldCents: number;
  releasedCents: number;
  refundedCents: number;
  byMonth: {
    month: string;
    capturedCents: number;
    heldCents: number;
    refundedCents: number;
  }[];
  byProduct: {
    name: string;
    capturedCents: number;
    heldCents: number;
    refundedCents: number;
    units: number;
  }[];
};

export type StockLineState = {
  key: string;
  label: string;
  kind: "counted" | "made-to-order";
  productSlug?: string;
  optionId?: string;
  lowAt?: number;
  soldOn: string;
  count: number | null;
  available: boolean;
  soldOut: boolean;
  low: boolean;
};

export type AdminData = {
  orders: AdminOrder[];
  income: IncomeSummary;
  stock: StockLineState[];
  deliveryWeekend: string | null;
  deliveryLabel: string | null;
  deliveries: AdminOrder[];
  approvals: AdminOrder[];
  repeatCustomers: {
    name: string;
    email: string;
    phone: string | null;
    orders: number;
    flagged: boolean;
  }[];
  passwordConfigured: boolean;
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  held: "Held",
  captured: "Captured",
  released: "Released",
  refunded: "Refunded",
  pending: "Awaiting payment",
  unpaid: "Not paid",
};

export const FULFILMENT_STATUS_LABELS: Record<FulfilmentStatus, string> = {
  pending_approval: "Pending approval",
  in_production: "In production",
  ready: "Ready",
  done: "Done",
  cancelled: "Cancelled",
};
