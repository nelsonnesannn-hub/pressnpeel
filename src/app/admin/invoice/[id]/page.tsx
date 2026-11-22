// Printable invoice — one per order. Auth-gated like the admin page.
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ADMIN_COOKIE, adminPasswordConfigured, isAdminToken } from "@/lib/admin-auth";
import { getOrderById } from "@/lib/orders";
import { normalizeOrder } from "@/lib/admin";
import PrintButton from "@/components/admin/print-button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Invoice | Press N Peel admin",
  robots: { index: false, follow: false },
};

function fmtCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-SG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const store = await cookies();
  if (
    !adminPasswordConfigured() ||
    !isAdminToken(store.get(ADMIN_COOKIE)?.value)
  ) {
    notFound();
  }

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId) || orderId <= 0) notFound();
  const record = await getOrderById(orderId);
  if (!record) notFound();
  const order = normalizeOrder(record);
  const subtotal = order.totalCents + order.discountCents - order.deliveryCents;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="no-print mx-auto max-w-3xl px-4 py-4">
        <PrintButton />
      </div>
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-4">
        <div className="flex items-start justify-between gap-4 border-b-2 border-slate-900 pb-5">
          <div>
            <p className="text-2xl font-bold">Press N Peel</p>
            <p className="mt-1 text-sm text-slate-600">
              Custom die-cut stickers, vinyl &amp; B2B labels — Singapore
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">INVOICE</p>
            <p className="text-sm font-semibold">INV-{order.number}</p>
            <p className="text-sm text-slate-600">{fmtDate(order.date)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Billed to
            </p>
            <p className="mt-1 font-semibold">{order.customerName}</p>
            {order.customerEmail ? (
              <p className="text-sm">{order.customerEmail}</p>
            ) : null}
            {order.customerPhone ? (
              <p className="text-sm">{order.customerPhone}</p>
            ) : null}
            {order.address ? (
              <p className="mt-1 text-sm whitespace-pre-wrap">{order.address}</p>
            ) : null}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Delivery
            </p>
            <p className="mt-1 text-sm">
              {order.deliveryWeekend
                ? `Weekend of ${order.deliveryWeekend}${
                    order.urgent ? " — urgent next day" : ""
                  }`
                : "To be arranged"}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Payment
            </p>
            <p className="mt-1 text-sm">
              {order.paymentStatus === "captured"
                ? "Captured"
                : order.paymentStatus === "held"
                ? "Held (not captured)"
                : order.paymentStatus === "refunded"
                ? "Refunded"
                : order.paymentStatus === "released"
                ? "Released — not charged"
                : "Awaiting payment"}
            </p>
            {order.stripeSessionId ? (
              <p className="text-xs text-slate-500">Ref: {order.stripeSessionId}</p>
            ) : null}
          </div>
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-400 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="py-2 pr-3">Item</th>
              <th className="py-2 pr-3">Detail</th>
              <th className="py-2 pr-3 text-right">Qty</th>
              <th className="py-2 pr-3 text-right">Unit</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.length === 0 ? (
              <tr>
                <td className="py-3 pr-3">{order.itemsSummary}</td>
                <td className="py-3 pr-3 text-slate-600"></td>
                <td className="py-3 pr-3 text-right">1</td>
                <td className="py-3 pr-3 text-right">{fmtCents(order.totalCents)}</td>
                <td className="py-3 text-right">{fmtCents(order.totalCents)}</td>
              </tr>
            ) : (
              order.items.map((item, index) => (
                <tr key={index} className="border-b border-slate-200">
                  <td className="py-2.5 pr-3">{item.name}</td>
                  <td className="py-2.5 pr-3 text-slate-600">{item.detail}</td>
                  <td className="py-2.5 pr-3 text-right">{item.quantity}</td>
                  <td className="py-2.5 pr-3 text-right">
                    {fmtCents(item.unitCents)}
                  </td>
                  <td className="py-2.5 text-right">{fmtCents(item.lineCents)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="mt-5 ml-auto w-full max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal</span>
            <span>{fmtCents(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Delivery</span>
            <span>
              {order.deliveryCents === 0 ? "FREE" : fmtCents(order.deliveryCents)}
            </span>
          </div>
          {order.discountCents > 0 ? (
            <div className="flex justify-between">
              <span className="text-slate-600">Discount</span>
              <span>−{fmtCents(order.discountCents)}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-slate-400 pt-2 text-base font-bold">
            <span>Total</span>
            <span>{fmtCents(order.totalCents)}</span>
          </div>
        </div>

        <p className="mt-10 text-xs text-slate-500">
          Payment status: {order.paymentStatus} · Fulfilment:{" "}
          {order.fulfilmentStatus}
        </p>
      </div>
    </div>
  );
}
