"use client";

// Orders list + order detail — the working screen.
import { useMemo, useState } from "react";
import type { AdminData, AdminOrder, FulfilmentStatus, PaymentStatus } from "@/lib/admin-types";
import {
  Card,
  Empty,
  FulfilmentPill,
  PaymentPill,
  Pill,
  btnGhost,
  btnPrimary,
  fmtCents,
  fmtDate,
  fmtDateTime,
  fmtWeekend,
  inputClass,
} from "./admin-shared";

export type OrderAction = {
  type: string;
  orderId?: number;
  status?: string;
  notes?: string;
  repeat?: boolean;
  stock?: {
    counts: Record<string, number | null>;
    available: Record<string, boolean>;
  };
  order?: Record<string, unknown>;
};

const PAYMENT_FILTERS: { id: PaymentStatus | "all"; label: string }[] = [
  { id: "all", label: "All payment" },
  { id: "held", label: "Held" },
  { id: "captured", label: "Captured" },
  { id: "pending", label: "Awaiting payment" },
  { id: "released", label: "Released" },
  { id: "refunded", label: "Refunded" },
  { id: "unpaid", label: "Not paid" },
];

const FULFILMENT_FILTERS: { id: FulfilmentStatus | "all"; label: string }[] = [
  { id: "all", label: "All fulfilment" },
  { id: "pending_approval", label: "Pending approval" },
  { id: "in_production", label: "In production" },
  { id: "ready", label: "Ready" },
  { id: "done", label: "Done" },
  { id: "cancelled", label: "Cancelled" },
];

function DesignThumb({ order, index }: { order: AdminOrder; index: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-[10px] text-slate-500">
        no preview
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/admin/design?order=${order.id}&index=${index}`}
      alt="Design"
      onError={() => setFailed(true)}
      className="h-20 w-20 rounded-lg border border-slate-800 object-cover"
    />
  );
}

function HoldCountdown({ order }: { order: AdminOrder }) {
  if (order.paymentStatus !== "held" || order.holdDaysLeft === null) {
    return <span className="text-xs text-slate-500">—</span>;
  }
  if (order.holdDaysLeft < 0) {
    return (
      <Pill className="border-rose-400/40 bg-rose-400/10 text-rose-300">
        Hold lapsed
      </Pill>
    );
  }
  return (
    <Pill
      className={
        order.holdDaysLeft <= 2
          ? "border-rose-400/40 bg-rose-400/10 text-rose-300"
          : "border-amber-400/40 bg-amber-400/10 text-amber-300"
      }
    >
      {order.holdDaysLeft} day{order.holdDaysLeft === 1 ? "" : "s"} left
    </Pill>
  );
}

export default function OrdersTab({
  data,
  runAction,
}: {
  data: AdminData;
  runAction: (action: OrderAction) => Promise<void>;
}) {
  const [payment, setPayment] = useState<PaymentStatus | "all">("all");
  const [fulfilment, setFulfilment] = useState<FulfilmentStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.orders.filter((order) => {
      if (payment !== "all" && order.paymentStatus !== payment) return false;
      if (fulfilment !== "all" && order.fulfilmentStatus !== fulfilment) {
        return false;
      }
      if (!q) return true;
      return (
        order.number.includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerEmail.toLowerCase().includes(q)
      );
    });
  }, [data.orders, payment, fulfilment, query]);

  const selected = data.orders.find((o) => o.id === selectedId) ?? null;

  async function act(action: OrderAction, label: string) {
    if (busy) return;
    setBusy(label);
    setError(null);
    try {
      await runAction(action);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  if (selected) {
    return (
      <OrderDetail
        order={selected}
        busy={busy}
        error={error}
        onBack={() => {
          setSelectedId(null);
          setError(null);
        }}
        act={act}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search order # or customer"
          className={`${inputClass} max-w-xs`}
        />
        <select
          value={payment}
          onChange={(e) => setPayment(e.target.value as PaymentStatus | "all")}
          className={inputClass}
        >
          {PAYMENT_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          value={fulfilment}
          onChange={(e) =>
            setFulfilment(e.target.value as FulfilmentStatus | "all")
          }
          className={inputClass}
        >
          {FULFILMENT_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-500">
          {orders.length} of {data.orders.length} orders
        </span>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      ) : null}

      {orders.length === 0 ? (
        <Empty message="No orders match these filters." />
      ) : null}

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="py-2 pr-3">Order</th>
              <th className="py-2 pr-3">Date</th>
              <th className="py-2 pr-3">Customer</th>
              <th className="py-2 pr-3">Items</th>
              <th className="py-2 pr-3 text-right">Total</th>
              <th className="py-2 pr-3">Payment</th>
              <th className="py-2 pr-3">Fulfilment</th>
              <th className="py-2">Delivery</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => setSelectedId(order.id)}
                className="cursor-pointer border-b border-slate-800/60 transition-colors hover:bg-slate-900/60"
              >
                <td className="py-3 pr-3 font-semibold text-white">
                  #{order.number}
                  {order.urgent ? (
                    <span className="ml-2 text-[10px] font-bold text-rose-300">
                      URGENT
                    </span>
                  ) : null}
                </td>
                <td className="py-3 pr-3 text-slate-400">{fmtDate(order.date)}</td>
                <td className="py-3 pr-3 text-slate-200">
                  {order.customerName}
                  {order.repeatCustomer ? (
                    <span className="ml-2 text-[10px] font-bold text-sky-300">
                      REPEAT
                    </span>
                  ) : null}
                </td>
                <td className="max-w-[220px] truncate py-3 pr-3 text-slate-400">
                  {order.itemsSummary}
                </td>
                <td className="py-3 pr-3 text-right font-semibold text-white">
                  {fmtCents(order.totalCents)}
                </td>
                <td className="py-3 pr-3">
                  <div className="flex flex-col items-start gap-1">
                    <PaymentPill status={order.paymentStatus} />
                    {order.paymentStatus === "held" ? (
                      <HoldCountdown order={order} />
                    ) : null}
                  </div>
                </td>
                <td className="py-3 pr-3">
                  <FulfilmentPill status={order.fulfilmentStatus} />
                </td>
                <td className="py-3 text-slate-400">
                  {fmtWeekend(order.deliveryWeekend)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {orders.map((order) => (
          <Card key={order.id} className="p-4">
            <button
              type="button"
              onClick={() => setSelectedId(order.id)}
              className="block w-full text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">
                    #{order.number}
                    {order.urgent ? (
                      <span className="ml-2 text-[10px] font-bold text-rose-300">
                        URGENT
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-500">
                    {fmtDate(order.date)}
                  </p>
                </div>
                <p className="font-semibold text-white">
                  {fmtCents(order.totalCents)}
                </p>
              </div>
              <p className="mt-2 text-sm text-slate-200">{order.customerName}</p>
              <p className="mt-1 text-xs text-slate-500">{order.itemsSummary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <PaymentPill status={order.paymentStatus} />
                <FulfilmentPill status={order.fulfilmentStatus} />
                {order.paymentStatus === "held" ? (
                  <HoldCountdown order={order} />
                ) : null}
              </div>
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OrderDetail({
  order,
  busy,
  error,
  onBack,
  act,
}: {
  order: AdminOrder;
  busy: string | null;
  error: string | null;
  onBack: () => void;
  act: (action: OrderAction, label: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState(order.adminNotes ?? "");

  const hasCustom = order.items.some((item) => item.kind === "custom");
  const awaitingApproval =
    order.fulfilmentStatus === "pending_approval" && hasCustom;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack} className={btnGhost}>
          ← All orders
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/admin/invoice/${order.id}`}
            target="_blank"
            rel="noreferrer"
            className={btnGhost}
          >
            Invoice
          </a>
          {order.paymentStatus === "held" ? (
            <>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => act({ type: "capture", orderId: order.id }, "capture")}
                className={btnPrimary}
                style={{ backgroundColor: "#FFD60A" }}
              >
                {busy === "capture" ? "Working…" : "Capture"}
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => act({ type: "release", orderId: order.id }, "release")}
                className={btnGhost}
              >
                Release
              </button>
            </>
          ) : null}
          {order.paymentStatus === "captured" ? (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => act({ type: "refund", orderId: order.id }, "refund")}
              className={btnGhost}
            >
              Refund
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-bold text-white">Order #{order.number}</h2>
        <PaymentPill status={order.paymentStatus} />
        <FulfilmentPill status={order.fulfilmentStatus} />
        {order.urgent ? (
          <Pill className="border-rose-400/40 bg-rose-400/10 text-rose-300">
            Urgent next day
          </Pill>
        ) : null}
        {order.source === "manual" ? (
          <Pill className="border-sky-400/40 bg-sky-400/10 text-sky-300">
            Manual / WhatsApp
          </Pill>
        ) : (
          <Pill className="border-slate-500/40 bg-slate-500/10 text-slate-300">
            Website
          </Pill>
        )}
        {order.repeatCustomer ? (
          <Pill className="border-sky-400/40 bg-sky-400/10 text-sky-300">
            Repeat customer
          </Pill>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-white">Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3">Finish / size</th>
                  <th className="py-2 pr-3 text-right">Qty</th>
                  <th className="py-2 pr-3 text-right">Unit</th>
                  <th className="py-2 text-right">Line</th>
                </tr>
              </thead>
              <tbody>
                {order.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-3 text-slate-500">
                      {order.itemsSummary || "—"}
                    </td>
                  </tr>
                ) : (
                  order.items.map((item, index) => (
                    <tr
                      key={`${item.name}-${index}`}
                      className="border-b border-slate-800/60 align-top"
                    >
                      <td className="py-3 pr-3 text-white">{item.name}</td>
                      <td className="py-3 pr-3 text-slate-400">{item.detail}</td>
                      <td className="py-3 pr-3 text-right text-slate-300">
                        {item.quantity}
                      </td>
                      <td className="py-3 pr-3 text-right text-slate-300">
                        {fmtCents(item.unitCents)}
                      </td>
                      <td className="py-3 text-right font-semibold text-white">
                        {fmtCents(item.lineCents)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Delivery</span>
              <span className="text-white">
                {order.deliveryCents === 0 ? "FREE" : fmtCents(order.deliveryCents)}
              </span>
            </div>
            {order.discountCents > 0 ? (
              <div className="flex justify-between">
                <span className="text-slate-400">Discount applied</span>
                <span className="text-white">
                  −{fmtCents(order.discountCents)}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-slate-800 pt-2 text-base font-bold">
              <span className="text-white">Total</span>
              <span className="text-white">{fmtCents(order.totalCents)}</span>
            </div>
          </div>

          {hasCustom ? (
            <div className="mt-5 border-t border-slate-800 pt-4">
              <h3 className="mb-3 text-sm font-semibold text-white">
                Design approval
              </h3>
              <div className="flex flex-wrap gap-3">
                {order.designFiles.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No design file archived for this order.
                  </p>
                ) : (
                  order.designFiles.map((file, index) => (
                    <a
                      key={`${file.itemId}-${index}`}
                      href={`/api/admin/design?order=${order.id}&index=${index}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                    >
                      <DesignThumb order={order} index={index} />
                      <span className="mt-1 block max-w-[5rem] truncate text-[10px] text-slate-500">
                        {file.name}
                      </span>
                    </a>
                  ))
                )}
              </div>
              {awaitingApproval ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() =>
                      act({ type: "approve_design", orderId: order.id }, "approve")
                    }
                    className={btnPrimary}
                    style={{ backgroundColor: "#FFD60A" }}
                  >
                    {busy === "approve" ? "Working…" : "Approve design"}
                  </button>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() =>
                      act({ type: "reject_design", orderId: order.id }, "reject")
                    }
                    className={btnGhost}
                  >
                    Reject (release hold)
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Customer</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Name</dt>
                <dd className="text-white">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">WhatsApp / phone</dt>
                <dd className="text-white">
                  {order.customerPhone || (
                    <span className="text-slate-500">—</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Email</dt>
                <dd className="break-all text-white">{order.customerEmail}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Delivery address</dt>
                <dd className="text-white">
                  {order.address || (
                    <span className="text-slate-500">
                      Not captured online — arrange on WhatsApp.
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Delivery weekend</dt>
                <dd className="text-white">
                  {fmtWeekend(order.deliveryWeekend)}
                  {order.urgent ? (
                    <span className="ml-2 text-xs text-rose-300">
                      urgent next day
                    </span>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Order source</dt>
                <dd className="text-white">
                  {order.source === "manual" ? "Manual / WhatsApp" : "Website"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Placed</dt>
                <dd className="text-white">{fmtDateTime(order.date)}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Payment</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Status</dt>
                <dd>
                  <PaymentPill status={order.paymentStatus} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Hold expiry</dt>
                <dd className="text-white">
                  {order.holdExpiresAt ? (
                    <>
                      {fmtDateTime(order.holdExpiresAt)}{" "}
                      <HoldCountdown order={order} />
                    </>
                  ) : (
                    <span className="text-slate-500">
                      {order.captureMethod === "manual"
                        ? "Manual capture"
                        : "Automatic capture"}
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Stripe reference</dt>
                <dd className="break-all text-white">
                  {order.stripeSessionId || (
                    <span className="text-slate-500">—</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Capture method</dt>
                <dd className="text-white">
                  {order.captureMethod === "manual" ? "Held" : "Automatic"}
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Status</h3>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">
                  Fulfilment
                </span>
                <select
                  value={order.fulfilmentStatus}
                  disabled={busy !== null}
                  onChange={(e) =>
                    act(
                      {
                        type: "set_fulfilment",
                        orderId: order.id,
                        status: e.target.value,
                      },
                      "fulfilment"
                    )
                  }
                  className={inputClass}
                >
                  <option value="pending_approval">Pending approval</option>
                  <option value="in_production">In production</option>
                  <option value="ready">Ready</option>
                  <option value="done">Done</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">
                  Payment
                </span>
                <select
                  value={order.paymentStatus}
                  disabled={busy !== null}
                  onChange={(e) =>
                    act(
                      {
                        type: "set_payment",
                        orderId: order.id,
                        status: e.target.value,
                      },
                      "payment"
                    )
                  }
                  className={inputClass}
                >
                  <option value="held">Held</option>
                  <option value="captured">Captured</option>
                  <option value="released">Released</option>
                  <option value="refunded">Refunded</option>
                  <option value="pending">Awaiting payment</option>
                  <option value="unpaid">Not paid</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={order.repeatCustomer}
                  disabled={busy !== null}
                  onChange={(e) =>
                    act(
                      {
                        type: "set_repeat",
                        orderId: order.id,
                        repeat: e.target.checked,
                      },
                      "repeat"
                    )
                  }
                />
                Returning customer (SASHA10 is first-order only)
              </label>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">
              Admin notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className={inputClass}
              placeholder="Internal note — never shown to the customer"
            />
            <button
              type="button"
              disabled={busy !== null || notes === (order.adminNotes ?? "")}
              onClick={() =>
                act(
                  { type: "save_notes", orderId: order.id, notes },
                  "notes"
                )
              }
              className={`${btnPrimary} mt-3`}
              style={{ backgroundColor: "#FFD60A" }}
            >
              Save note
            </button>
            {order.notes ? (
              <div className="mt-4 border-t border-slate-800 pt-3">
                <h4 className="mb-1 text-xs font-semibold text-slate-400">
                  Customer notes
                </h4>
                <p className="whitespace-pre-wrap text-xs text-slate-300">
                  {order.notes}
                </p>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
