"use client";

// Stock list — counted stock (vinyl packs, keychains, coasters) and
// made-to-order toggles. Saving here takes effect immediately: the checkout and
// order routes re-check these flags on every submission.
import { useState } from "react";
import type { AdminData, StockLineState } from "@/lib/admin-types";
import { Card, Pill, btnPrimary, inputClass } from "./admin-shared";
import type { OrderAction } from "./admin-orders";

function CountsForm({
  lines,
  onSave,
  busy,
}: {
  lines: StockLineState[];
  onSave: (counts: Record<string, number | null>) => void;
  busy: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const line of lines) {
      init[line.key] = line.count === null ? "" : String(line.count);
    }
    return init;
  });

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Leave a box empty when the quantity is unknown — the line stays
        orderable. Enter 0 to show it as Sold out.
      </p>
      {lines.map((line) => {
        const raw = values[line.key] ?? "";
        const count = raw.trim() === "" ? null : Number(raw);
        const soldOut = count !== null && count <= 0;
        return (
          <div
            key={line.key}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{line.label}</p>
              <p className="text-xs text-slate-500">{line.soldOn}</p>
            </div>
            {line.lowAt && line.low && !soldOut ? (
              <Pill className="border-amber-400/40 bg-amber-400/10 text-amber-300">
                Low — {line.lowAt} left
              </Pill>
            ) : null}
            {soldOut ? (
              <Pill className="border-rose-400/40 bg-rose-400/10 text-rose-300">
                Sold out
              </Pill>
            ) : null}
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={raw}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [line.key]: e.target.value }))
                }
                className={`${inputClass} w-24`}
                aria-label={`Stock for ${line.label}`}
              />
              <span className="text-xs text-slate-500">units</span>
            </div>
          </div>
        );
      })}
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          // Send every counted line: a number, or null when the quantity is
          // unknown (null clears a previously stored count).
          const counts: Record<string, number | null> = {};
          for (const line of lines) {
            const raw = (values[line.key] ?? "").trim();
            if (raw === "") {
              counts[line.key] = null;
              continue;
            }
            const n = Math.floor(Number(raw));
            counts[line.key] =
              Number.isFinite(n) && n >= 0 ? n : null;
          }
          onSave(counts);
        }}
        className={btnPrimary}
        style={{ backgroundColor: "#FFD60A" }}
      >
        {busy ? "Saving…" : "Save counts"}
      </button>
    </div>
  );
}

function ToggleForm({
  lines,
  onSave,
  busy,
}: {
  lines: StockLineState[];
  onSave: (available: Record<string, boolean>) => void;
  busy: boolean;
}) {
  const [values, setValues] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const line of lines) init[line.key] = line.available;
    return init;
  });

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Switch a line off to stop selling it immediately — the product stays
        listed on the site but cannot be ordered.
      </p>
      {lines.map((line) => {
        const on = values[line.key] !== false;
        return (
          <div
            key={line.key}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{line.label}</p>
              <p className="text-xs text-slate-500">{line.soldOn}</p>
            </div>
            {!on ? (
              <Pill className="border-rose-400/40 bg-rose-400/10 text-rose-300">
                Not selling
              </Pill>
            ) : null}
            <button
              type="button"
              role="switch"
              aria-checked={on}
              onClick={() =>
                setValues((prev) => ({ ...prev, [line.key]: !on }))
              }
              className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                on ? "bg-emerald-400" : "bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  on ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        );
      })}
      <button
        type="button"
        disabled={busy}
        onClick={() => onSave(values)}
        className={btnPrimary}
        style={{ backgroundColor: "#FFD60A" }}
      >
        {busy ? "Saving…" : "Save availability"}
      </button>
    </div>
  );
}

export default function StockTab({
  data,
  runAction,
}: {
  data: AdminData;
  runAction: (action: OrderAction) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const counted = data.stock.filter((line) => line.kind === "counted");
  const madeToOrder = data.stock.filter((line) => line.kind === "made-to-order");

  async function save(action: OrderAction) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await runAction(action);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      ) : null}

      <Card className="p-4">
        <h3 className="mb-1 text-sm font-semibold text-white">
          Counted stock
        </h3>
        <p className="mb-4 text-xs text-slate-500">
          Vinyl packs (resell) and finished keychains / coasters. Selling reduces
          the count; at 0 the line shows Sold out and cannot be ordered. Low
          warning at 2 vinyl packs.
        </p>
        <CountsForm
          lines={counted}
          busy={busy}
          onSave={(counts) => save({ type: "save_stock", stock: { counts, available: {} } })}
        />
      </Card>

      <Card className="p-4">
        <h3 className="mb-1 text-sm font-semibold text-white">
          Made-to-order lines
        </h3>
        <p className="mb-4 text-xs text-slate-500">
          Custom stickers, labels and signs — no count, just an Available
          on/off switch. Every sellable line has one.
        </p>
        <ToggleForm
          lines={madeToOrder}
          busy={busy}
          onSave={(available) =>
            save({ type: "save_stock", stock: { counts: {}, available } })
          }
        />
      </Card>
    </div>
  );
}
