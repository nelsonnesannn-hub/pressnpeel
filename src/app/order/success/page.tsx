import Link from "next/link";
import type Stripe from "stripe";
import { WHATSAPP_URL } from "@/components/nav";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import {
  getOrderBySession,
  markOrderPaid,
  setNotified,
  type OrderRecord,
} from "@/lib/orders";
import {
  sendTelegramMessage,
  buildPaymentNotification,
} from "@/lib/telegram";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Confirmed | Press N Peel",
};

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

type OrderView = {
  orderNumber: number | null;
  productName: string;
  optionLabel: string;
  quantity: number | null;
  unitPrice: number | null;
  subtotal: number | null;
  discountLabel: string | null;
  discountAmount: number;
  total: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
};

function viewFromRecord(order: OrderRecord): OrderView {
  return {
    orderNumber: order.id,
    productName: order.product_name ?? "Your order",
    optionLabel: order.option_label ?? "",
    quantity: order.quantity,
    unitPrice: order.unit_price,
    subtotal:
      order.unit_price != null && order.quantity != null
        ? Math.round(order.unit_price * order.quantity * 100) / 100
        : null,
    discountLabel: null,
    discountAmount: 0,
    total: order.total,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone ?? "",
    notes: order.notes ?? "",
  };
}

// The checkout session metadata is the durable copy of the order we wrote when
// the session was created, so it reconstructs the order even if the KV record
// is unavailable (or KV is not configured yet).
function viewFromSession(session: Stripe.Checkout.Session): OrderView {
  const m = session.metadata ?? {};
  const unitPrice = Number(m.unitPrice);
  const quantity = Number(m.quantity);
  const subtotal = Number(m.subtotal);
  const total = Number(m.total);
  const discountAmount = Number(m.discountAmount);
  const hasDiscount = Boolean(m.discountCode) && discountAmount > 0;
  return {
    orderNumber: m.orderId ? Number(m.orderId) : null,
    productName: m.productName || "Your order",
    optionLabel: m.optionLabel || "",
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : null,
    unitPrice: Number.isFinite(unitPrice) ? unitPrice : null,
    subtotal: Number.isFinite(subtotal) ? subtotal : null,
    discountLabel: hasDiscount
      ? `${m.discountCode}${m.discountPercent ? ` −${m.discountPercent}%` : ""}`
      : null,
    discountAmount: hasDiscount ? discountAmount : 0,
    total: Number.isFinite(total) ? total : null,
    customerName: m.customerName || "",
    customerEmail: m.customerEmail || "",
    customerPhone: m.customerPhone || "",
    notes: [m.notes, m.nfcLink ? `NFC link to program: ${m.nfcLink}` : ""]
      .filter(Boolean)
      .join("\n"),
  };
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  let kvOrder: OrderRecord | null = null;
  if (session_id) {
    kvOrder = await getOrderBySession(session_id);
  }

  let stripe: Stripe | null = null;
  if (session_id && stripeEnabled()) {
    stripe = getStripe();
  }

  let session: Stripe.Checkout.Session | null = null;
  if (stripe && session_id) {
    try {
      session = await stripe.checkout.sessions.retrieve(session_id);
    } catch (err) {
      console.error("Could not verify Stripe session:", err);
    }
  }

  const view = kvOrder
    ? viewFromRecord(kvOrder)
    : session
    ? viewFromSession(session)
    : null;

  const paymentStatus = session
    ? session.payment_status
    : kvOrder?.stripe_payment_status || "unknown";
  const paid =
    session?.payment_status === "paid" || kvOrder?.status === "paid";

  if (paid && view) {
    if (kvOrder && session) {
      await markOrderPaid(kvOrder.id, session.payment_status);
      // Only ping Nelson once per order, even if the page is reloaded.
      if (!kvOrder.notified_paid) {
        const sent = await sendTelegramMessage(
          buildPaymentNotification({
            orderId: kvOrder.id,
            productName: kvOrder.product_name ?? "Order",
            optionLabel: kvOrder.option_label ?? "",
            quantity: kvOrder.quantity ?? 1,
            unitPrice: kvOrder.unit_price ?? kvOrder.total ?? 0,
            total: kvOrder.total,
            customerName: kvOrder.customer_name,
            customerEmail: kvOrder.customer_email,
            customerPhone: kvOrder.customer_phone ?? "",
            status: "Paid",
          })
        );
        if (sent.ok) await setNotified(kvOrder.id, "paid");
      }
    } else if (stripe && session) {
      // No KV record: fall back to a flag on the checkout session itself so the
      // payment ping still fires exactly once.
      const meta = session.metadata ?? {};
      if (meta.pnp_notified_paid !== "1") {
        const sent = await sendTelegramMessage(
          buildPaymentNotification({
            orderId: view.orderNumber,
            productName: view.productName,
            optionLabel: view.optionLabel,
            quantity: view.quantity ?? 1,
            unitPrice: view.unitPrice ?? view.total ?? 0,
            total: view.total ?? 0,
            customerName: view.customerName,
            customerEmail: view.customerEmail,
            customerPhone: view.customerPhone,
            status: "Paid",
          })
        );
        if (sent.ok) {
          try {
            await stripe.checkout.sessions.update(session.id, {
              metadata: { ...meta, pnp_notified_paid: "1" },
            });
          } catch (err) {
            console.error("Could not record payment notification:", err);
          }
        }
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div
        className={`rounded-2xl border p-10 ${
          paid
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-slate-800 bg-slate-900/40"
        }`}
      >
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
            paid
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          {paid ? "✓" : "•"}
        </div>
        <h1 className="text-3xl font-bold text-white">
          {paid ? "Order confirmed" : "Order received"}
        </h1>
        <p className="mt-3 text-slate-400">
          {paid
            ? `Thanks${view?.orderNumber ? ` — order #${view.orderNumber}` : ""}. Your payment was successful.`
            : "We've received your order details."}
        </p>

        {view ? (
          <dl className="mx-auto mt-8 max-w-md space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-5 text-left text-sm">
            {view.orderNumber ? (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Order</dt>
                <dd className="font-medium text-white">#{view.orderNumber}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Product</dt>
              <dd className="text-right font-medium text-white">
                {view.productName}
                {view.optionLabel ? ` (${view.optionLabel})` : ""}
              </dd>
            </div>
            {view.quantity ? (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Quantity</dt>
                <dd className="font-medium text-white">{view.quantity}</dd>
              </div>
            ) : null}
            {view.unitPrice != null ? (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Unit price</dt>
                <dd className="font-medium text-white">
                  ${view.unitPrice.toFixed(2)} SGD
                </dd>
              </div>
            ) : null}
            {view.subtotal != null ? (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="font-medium text-white">
                  ${view.subtotal.toFixed(2)} SGD
                </dd>
              </div>
            ) : null}
            {view.discountLabel ? (
              <div className="flex justify-between gap-4">
                <dt className="text-emerald-400">
                  Discount ({view.discountLabel})
                </dt>
                <dd className="font-medium text-emerald-400">
                  −${view.discountAmount.toFixed(2)} SGD
                </dd>
              </div>
            ) : null}
            {view.total !== null ? (
              <div className="flex justify-between gap-4 border-t border-slate-800 pt-3">
                <dt className="font-semibold text-white">Total</dt>
                <dd className="font-bold" style={{ color: "#FFD60A" }}>
                  ${view.total.toFixed(2)} SGD
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Payment</dt>
              <dd
                className={`font-medium ${paid ? "text-emerald-400" : "text-amber-300"}`}
              >
                {paid ? "Paid" : "Awaiting payment"}
              </dd>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Customer
              </p>
              {view.customerName ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Name</dt>
                  <dd className="text-right font-medium text-white">
                    {view.customerName}
                  </dd>
                </div>
              ) : null}
              {view.customerEmail ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Email</dt>
                  <dd className="text-right font-medium text-white">
                    {view.customerEmail}
                  </dd>
                </div>
              ) : null}
              {view.customerPhone ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Phone</dt>
                  <dd className="text-right font-medium text-white">
                    {view.customerPhone}
                  </dd>
                </div>
              ) : null}
              {view.notes ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Notes</dt>
                  <dd className="whitespace-pre-line text-right font-medium text-white">
                    {view.notes}
                  </dd>
                </div>
              ) : null}
            </div>
          </dl>
        ) : null}

        <div className="mt-8 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-sm text-slate-300">
            <strong className="text-white">
              Nelson will contact you on WhatsApp
            </strong>{" "}
            within one working day to confirm your proof and arrange delivery.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
          >
            Chat on WhatsApp
          </a>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="rounded-xl px-6 py-3 text-sm font-semibold text-slate-950"
            style={{ backgroundColor: "#FFD60A" }}
          >
            Continue Browsing
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-900/60"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
