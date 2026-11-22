"use client";

// Admin shell — fetches the authenticated data payload once and hands it to the
// active tab. Every mutation calls `runAction` and then refreshes.
import { useCallback, useEffect, useState } from "react";
import type { AdminData } from "@/lib/admin-types";
import OrdersTab, { type OrderAction } from "./admin-orders";
import InvoicesTab from "./admin-invoices";
import IncomeTab from "./admin-income";
import StockTab from "./admin-stock";
import DeliveriesTab from "./admin-delivery";
import ApprovalsTab from "./admin-approvals";
import ManualOrderTab from "./admin-manual";

const TABS = [
  { id: "orders", label: "Orders" },
  { id: "invoices", label: "Invoices" },
  { id: "income", label: "Income" },
  { id: "stock", label: "Stock" },
  { id: "deliveries", label: "Deliveries" },
  { id: "approvals", label: "Approvals" },
  { id: "manual", label: "Add order" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminApp() {
  const [tab, setTab] = useState<TabId>("orders");
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/data", { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/admin";
        return;
      }
      const payload = (await res.json()) as AdminData & { error?: string };
      if (!res.ok) {
        setError(payload.error ?? "Could not load admin data.");
        return;
      }
      setData(payload);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = useCallback(
    async (action: OrderAction, silent = false) => {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || payload.ok === false) {
        throw new Error(payload.error ?? "Action failed.");
      }
      if (!silent) setNotice("Saved.");
      await load();
      if (!silent) {
        window.setTimeout(() => setNotice(null), 2500);
      }
    },
    [load]
  );

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin";
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/press-n-peel-logo-light.jpg"
                alt=""
                className="h-full w-full object-cover"
              />
            </span>
            <div>
              <p className="text-sm font-bold text-white">Press N Peel admin</p>
              <p className="text-xs text-slate-500">
                Orders · invoices · income · stock
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notice ? (
              <span className="text-xs font-medium text-emerald-300">
                {notice}
              </span>
            ) : null}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              View site
            </a>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-2 sm:px-4">
          <nav className="flex gap-1 overflow-x-auto pb-2">
            {TABS.map((item) => {
              const active = tab === item.id;
              const badge =
                item.id === "approvals"
                  ? (data?.approvals.length ?? 0)
                  : item.id === "deliveries"
                  ? (data?.deliveries.length ?? 0)
                  : item.id === "orders"
                  ? (data?.orders.length ?? 0)
                  : 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#FFD60A] text-slate-950"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                  {badge !== null && badge > 0 ? (
                    <span
                      className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        active
                          ? "bg-slate-950/15 text-slate-950"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {error ? (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
        {loading && !data ? (
          <p className="py-16 text-center text-sm text-slate-500">Loading…</p>
        ) : null}
        {data ? (
          <>
            {tab === "orders" ? (
              <OrdersTab data={data} runAction={runAction} />
            ) : null}
            {tab === "invoices" ? <InvoicesTab data={data} /> : null}
            {tab === "income" ? <IncomeTab data={data} /> : null}
            {tab === "stock" ? <StockTab data={data} runAction={runAction} /> : null}
            {tab === "deliveries" ? <DeliveriesTab data={data} /> : null}
            {tab === "approvals" ? (
              <ApprovalsTab data={data} runAction={runAction} />
            ) : null}
            {tab === "manual" ? (
              <ManualOrderTab runAction={runAction} weekend={data.deliveryWeekend} />
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  );
}
