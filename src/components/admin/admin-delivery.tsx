"use client";

// This weekend's delivery list — Nelson's Saturday-morning screen.
import type { AdminData } from "@/lib/admin-types";
import { Card, Empty, Pill, fmtCents, fmtWeekend } from "./admin-shared";

export default function DeliveriesTab({ data }: { data: AdminData }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">
          This weekend — {fmtWeekend(data.deliveryWeekend)}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Orders due this weekend, with delivery addresses. Nelson delivers by
          bike himself.
        </p>
      </div>

      {data.deliveries.length === 0 ? (
        <Empty message="Nothing due this weekend." />
      ) : (
        <div className="space-y-3">
          {data.deliveries.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">
                    #{order.number} — {order.customerName}
                    {order.urgent ? (
                      <span className="ml-2 text-[10px] font-bold text-rose-300">
                        URGENT NEXT DAY
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {order.address || (
                      <span className="text-slate-500">
                        No address on file — arrange on WhatsApp (
                        {order.customerPhone || order.customerEmail})
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {order.itemsSummary}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">
                    {fmtCents(order.totalCents)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {order.customerPhone || "—"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-800 pt-3">
                <Pill className="border-slate-500/40 bg-slate-500/10 text-slate-300">
                  {order.paymentStatus === "captured"
                    ? "Paid"
                    : order.paymentStatus === "held"
                    ? "Held"
                    : order.paymentStatus}
                </Pill>
                <Pill className="border-slate-500/40 bg-slate-500/10 text-slate-300">
                  {order.fulfilmentStatus === "done"
                    ? "Done"
                    : order.fulfilmentStatus === "ready"
                    ? "Ready"
                    : order.fulfilmentStatus === "in_production"
                    ? "In production"
                    : order.fulfilmentStatus}
                </Pill>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
