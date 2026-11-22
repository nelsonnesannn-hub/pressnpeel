"use client";

// Design-approval queue — every Pending-approval order in one place.
import { useState } from "react";
import type { AdminData, AdminOrder } from "@/lib/admin-types";
import { Card, Empty, Pill, btnGhost, btnPrimary, fmtCents } from "./admin-shared";
import type { OrderAction } from "./admin-orders";

function Thumb({ order, index }: { order: AdminOrder; index: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-[10px] text-slate-500">
        no file
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={`/api/admin/design?order=${order.id}&index=${index}`}
      alt="Design"
      onError={() => setFailed(true)}
      className="h-16 w-16 rounded-lg border border-slate-800 object-cover"
    />
  );
}

export default function ApprovalsTab({
  data,
  runAction,
}: {
  data: AdminData;
  runAction: (action: OrderAction) => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Design approval queue</h2>
        <p className="mt-1 text-sm text-slate-400">
          Custom work is held until the design is approved. Rejecting releases
          the hold — the customer is never charged (Refund Policy).
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      ) : null}

      {data.approvals.length === 0 ? (
        <Empty message="Nothing waiting for approval." />
      ) : (
        <div className="space-y-3">
          {data.approvals.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">
                    #{order.number} — {order.customerName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {order.itemsSummary}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {fmtCents(order.totalCents)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.designFiles.map((file, index) => (
                    <a
                      key={`${file.itemId}-${index}`}
                      href={`/api/admin/design?order=${order.id}&index=${index}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Thumb order={order} index={index} />
                    </a>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-3">
                <Pill className="border-amber-400/40 bg-amber-400/10 text-amber-300">
                  {order.paymentStatus === "held"
                    ? "Payment held"
                    : order.paymentStatus}
                </Pill>
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() =>
                      act({ type: "approve_design", orderId: order.id }, `approve-${order.id}`)
                    }
                    className={btnPrimary}
                    style={{ backgroundColor: "#FFD60A" }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() =>
                      act({ type: "reject_design", orderId: order.id }, `reject-${order.id}`)
                    }
                    className={btnGhost}
                  >
                    Reject (release hold)
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
