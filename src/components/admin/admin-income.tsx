"use client";

// Income — split by payment state, with monthly and per-product breakdowns.
import type { AdminData } from "@/lib/admin-types";
import { Card, Empty, fmtCents, fmtMonth } from "./admin-shared";

function MoneyCard({
  label,
  cents,
  hint,
  accent,
}: {
  label: string;
  cents: number;
  hint: string;
  accent: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${accent}`}>{fmtCents(cents)}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </Card>
  );
}

export default function IncomeTab({ data }: { data: AdminData }) {
  const income = data.income;
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MoneyCard
          label="Captured"
          cents={income.capturedCents}
          hint="Money actually taken"
          accent="text-emerald-300"
        />
        <MoneyCard
          label="Held / awaiting capture"
          cents={income.heldCents}
          hint="Authorised, not yet captured"
          accent="text-amber-300"
        />
        <MoneyCard
          label="Released / cancelled"
          cents={income.releasedCents}
          hint="Never charged — $0"
          accent="text-slate-300"
        />
        <MoneyCard
          label="Refunded"
          cents={income.refundedCents}
          hint="Returned to the customer"
          accent="text-rose-300"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">
            By month
          </h3>
          {income.byMonth.length === 0 ? (
            <Empty message="No income yet." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-3">Month</th>
                  <th className="py-2 pr-3 text-right">Captured</th>
                  <th className="py-2 pr-3 text-right">Held</th>
                  <th className="py-2 text-right">Refunded</th>
                </tr>
              </thead>
              <tbody>
                {income.byMonth.map((row) => (
                  <tr
                    key={row.month}
                    className="border-b border-slate-800/60"
                  >
                    <td className="py-2.5 pr-3 text-white">
                      {fmtMonth(row.month)}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-emerald-300">
                      {fmtCents(row.capturedCents)}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-amber-300">
                      {fmtCents(row.heldCents)}
                    </td>
                    <td className="py-2.5 text-right text-rose-300">
                      {fmtCents(row.refundedCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">
            By product
          </h3>
          {income.byProduct.length === 0 ? (
            <Empty message="No products sold yet." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3 text-right">Units</th>
                  <th className="py-2 pr-3 text-right">Captured</th>
                  <th className="py-2 text-right">Held</th>
                </tr>
              </thead>
              <tbody>
                {income.byProduct.map((row) => (
                  <tr
                    key={row.name}
                    className="border-b border-slate-800/60"
                  >
                    <td className="py-2.5 pr-3 text-white">{row.name}</td>
                    <td className="py-2.5 pr-3 text-right text-slate-300">
                      {row.units}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-emerald-300">
                      {fmtCents(row.capturedCents)}
                    </td>
                    <td className="py-2.5 text-right text-amber-300">
                      {fmtCents(row.heldCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <p className="text-xs text-slate-500">
        Profit and cost tracking are not part of this version — there is no cost
        data yet.
      </p>
    </div>
  );
}
