"use client";

// Invoices — every order is an invoice. Filterable and searchable; the CSV
// export and the per-order printable invoice live behind the same admin cookie.
import { useMemo, useState } from "react";
import type { AdminData } from "@/lib/admin-types";
import {
  Card,
  Empty,
  FulfilmentPill,
  PaymentPill,
  fmtCents,
  fmtDate,
  fmtWeekend,
  inputClass,
} from "./admin-shared";
import type { OrderAction } from "./admin-orders";

export default function InvoicesTab({ data }: { data: AdminData }) {
  const [query, setQuery] = useState("");
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const productNames = useMemo(
    () => [...new Set(data.orders.flatMap((o) => o.items.map((i) => i.name)))].sort(),
    [data.orders]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.orders.filter((order) => {
      if (status !== "all" && order.paymentStatus !== status) return false;
      if (customer && !order.customerName.toLowerCase().includes(customer.toLowerCase())) {
        return false;
      }
      if (
        product &&
        !order.items.some((item) => item.name === product)
      ) {
        return false;
      }
      if (from && order.date.slice(0, 10) < from) return false;
      if (to && order.date.slice(0, 10) > to) return false;
      if (!q) return true;
      return (
        order.number.includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerEmail.toLowerCase().includes(q)
      );
    });
  }, [data.orders, query, customer, product, status, from, to]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search order # or customer"
          className={`${inputClass} max-w-xs`}
        />
        <input
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          placeholder="Customer"
          className={`${inputClass} max-w-[10rem]`}
        />
        <select
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          className={inputClass}
        >
          <option value="">All products</option>
          {productNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={inputClass}
        >
          <option value="all">All statuses</option>
          <option value="captured">Captured</option>
          <option value="held">Held</option>
          <option value="released">Released</option>
          <option value="refunded">Refunded</option>
          <option value="pending">Awaiting payment</option>
          <option value="unpaid">Not paid</option>
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className={`${inputClass} max-w-[10rem]`}
          aria-label="From date"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className={`${inputClass} max-w-[10rem]`}
          aria-label="To date"
        />
        <a
          href="/api/admin/export"
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
        >
          Export CSV
        </a>
      </div>

      <p className="text-xs text-slate-500">
        {rows.length} invoice{rows.length === 1 ? "" : "s"} · nothing is ever
        deleted — released and refunded orders stay in the record.
      </p>

      {rows.length === 0 ? (
        <Empty message="No invoices match these filters." />
      ) : (
        <div className="space-y-3">
          {rows.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">
                    INV-{order.number}
                    <span className="ml-3 text-sm font-normal text-slate-500">
                      {fmtDate(order.date)}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {order.customerName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {order.itemsSummary}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">
                    {fmtCents(order.totalCents)}
                  </p>
                  <div className="mt-1 flex flex-wrap justify-end gap-1.5">
                    <PaymentPill status={order.paymentStatus} />
                    <FulfilmentPill status={order.fulfilmentStatus} />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-3 text-xs text-slate-500">
                <span>Delivery: {fmtWeekend(order.deliveryWeekend)}</span>
                {order.stripeSessionId ? (
                  <span className="break-all">
                    Stripe: {order.stripeSessionId}
                  </span>
                ) : null}
                <a
                  href={`/admin/invoice/${order.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto font-medium text-[#FACC15] hover:underline"
                >
                  Open / print invoice
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export type { OrderAction };
