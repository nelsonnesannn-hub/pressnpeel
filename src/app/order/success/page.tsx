import Link from "next/link";
import { WHATSAPP_URL } from "@/components/nav";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { getOrderById, markOrderPaid, setNotified } from "@/lib/orders";
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

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  let orderNumber: number | null = null;
  let productName = "";
  let optionLabel = "";
  let quantity: number | null = null;
  let total: number | null = null;
  let paymentStatus = "unknown";
  let paid = false;

  if (session_id && stripeEnabled()) {
    const stripe = getStripe();
    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        paymentStatus = session.payment_status;
        const orderId = Number(session.metadata?.orderId ?? "");

        if (orderId) {
          const order = getOrderById(orderId);
          if (order) {
            orderNumber = order.id;
            productName = order.product_name ?? "Your order";
            optionLabel = order.option_label ?? "";
            quantity = order.quantity;
            total = order.total;

            if (session.payment_status === "paid") {
              paid = true;
              markOrderPaid(order.id, session.payment_status);

              // Only ping Nelson once per order, even if the page is reloaded.
              if (!order.notified_paid) {
                const sent = await sendTelegramMessage(
                  buildPaymentNotification({
                    orderId: order.id,
                    productName: order.product_name ?? "Order",
                    optionLabel: order.option_label ?? "",
                    quantity: order.quantity ?? 1,
                    unitPrice: order.unit_price ?? order.total ?? 0,
                    total: order.total,
                    customerName: order.customer_name,
                    customerEmail: order.customer_email,
                    customerPhone: order.customer_phone ?? "",
                    status: "Paid",
                  })
                );
                if (sent.ok) setNotified(order.id, "paid");
              }
            }
          }
        }
      } catch (err) {
        console.error("Could not verify Stripe session:", err);
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
            ? `Thanks${orderNumber ? ` — order #${orderNumber}` : ""}. Your payment was successful.`
            : "We've received your order details."}
        </p>

        {orderNumber ? (
          <dl className="mx-auto mt-8 max-w-md space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-5 text-left text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Order</dt>
              <dd className="font-medium text-white">#{orderNumber}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Product</dt>
              <dd className="text-right font-medium text-white">
                {productName}
                {optionLabel ? ` (${optionLabel})` : ""}
              </dd>
            </div>
            {quantity ? (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Quantity</dt>
                <dd className="font-medium text-white">{quantity}</dd>
              </div>
            ) : null}
            {total !== null ? (
              <div className="flex justify-between gap-4 border-t border-slate-800 pt-3">
                <dt className="font-semibold text-white">Total paid</dt>
                <dd
                  className="font-bold"
                  style={{ color: "#FFD60A" }}
                >
                  ${total.toFixed(2)} SGD
                </dd>
              </div>
            ) : null}
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
