"use client";

// Shared admin UI bits — formatting and small presentational components.
import type { ReactNode } from "react";
import type {
  FulfilmentStatus,
  PaymentStatus,
} from "@/lib/admin-types";
import {
  FULFILMENT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/admin-types";

export function fmtCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${fmtDate(iso)}, ${d.toLocaleTimeString("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  })}`;
}

export function fmtWeekend(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function fmtMonth(month: string): string {
  const d = new Date(`${month}-01T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return month;
  return d.toLocaleDateString("en-SG", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  held: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  captured: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  released: "border-slate-500/40 bg-slate-500/10 text-slate-300",
  refunded: "border-rose-400/40 bg-rose-400/10 text-rose-300",
  pending: "border-slate-500/40 bg-slate-500/10 text-slate-300",
  unpaid: "border-slate-500/40 bg-slate-500/10 text-slate-400",
};

const FULFILMENT_STYLES: Record<FulfilmentStatus, string> = {
  pending_approval: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  in_production: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  ready: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  done: "border-slate-500/40 bg-slate-500/10 text-slate-300",
  cancelled: "border-rose-400/40 bg-rose-400/10 text-rose-300",
};

export function Pill({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

export function PaymentPill({ status }: { status: PaymentStatus }) {
  return (
    <Pill className={PAYMENT_STYLES[status]}>
      {PAYMENT_STATUS_LABELS[status]}
    </Pill>
  );
}

export function FulfilmentPill({ status }: { status: FulfilmentStatus }) {
  return (
    <Pill className={FULFILMENT_STYLES[status]}>
      {FULFILMENT_STATUS_LABELS[status]}
    </Pill>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/40 ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-[#FFD60A] focus:outline-none";

export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50";

export const btnGhost =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50";

export function Empty({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-800 px-4 py-8 text-center text-sm text-slate-500">
      {message}
    </p>
  );
}
