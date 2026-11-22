// Admin actions — status changes, notes, stock and manual orders.
// Every mutation requires the admin cookie; nothing here deletes an order.
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, adminPasswordConfigured } from "@/lib/admin-auth";
import { getOrderById, updateOrder, type OrderRecord } from "@/lib/orders";
import { getStockState, saveStockState } from "@/lib/stock";
import { createManualOrder, normalizeOrder, type ManualOrderInput } from "@/lib/admin";
import {
  capturePayment,
  releasePayment,
  refundPayment,
} from "@/lib/admin-stripe";
import type { FulfilmentStatus, PaymentStatus } from "@/lib/admin-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAYMENT: PaymentStatus[] = [
  "held",
  "captured",
  "released",
  "refunded",
  "pending",
  "unpaid",
];
const FULFILMENT: FulfilmentStatus[] = [
  "pending_approval",
  "in_production",
  "ready",
  "done",
  "cancelled",
];

function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

async function guard(req: NextRequest) {
  if (!adminPasswordConfigured()) return "not_configured";
  if (!(await isAdminRequest(req))) return "unauthorized";
  return null;
}

async function orderOrFail(orderId: number) {
  const record = await getOrderById(orderId);
  if (!record) return null;
  return record;
}

export async function POST(req: NextRequest) {
  const auth = await guard(req);
  if (auth === "not_configured") {
    return fail("Admin access is not configured on this deployment.", 500);
  }
  if (auth === "unauthorized") return fail("Unauthorized", 401);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return fail("Invalid request body");
  }

  const type = typeof body.type === "string" ? body.type : "";
  const orderId = Number(body.orderId);

  switch (type) {
    // ---- design approval -------------------------------------------------
    case "approve_design": {
      const order = await orderOrFail(orderId);
      if (!order) return fail("Order not found", 404);
      if (order.fulfilment_status === "in_production") {
        return NextResponse.json({ ok: true });
      }
      await updateOrder({ ...order, fulfilment_status: "in_production" });
      return NextResponse.json({ ok: true, fulfilment_status: "in_production" });
    }

    case "reject_design": {
      const order = await orderOrFail(orderId);
      if (!order) return fail("Order not found", 404);
      // Rejecting releases the hold — a released hold costs nothing and the
      // customer is never charged (Refund Policy).
      if (order.stripe_session_id && order.payment_status === "held") {
        const result = await releasePayment(order.stripe_session_id);
        if (!result.ok) return fail(result.error ?? "Could not release the hold.");
      }
      await updateOrder({
        ...order,
        payment_status: "released",
        fulfilment_status: "cancelled",
      });
      return NextResponse.json({ ok: true, payment_status: "released" });
    }

    // ---- money -----------------------------------------------------------
    case "capture": {
      const order = await orderOrFail(orderId);
      if (!order) return fail("Order not found", 404);
      const view = normalizeOrder(order);
      const hasCustom = (order.items ?? []).some((item) => item.kind === "custom");
      if (hasCustom && view.fulfilmentStatus === "pending_approval") {
        return fail("Approve the design before capturing this payment.");
      }
      if (!order.stripe_session_id) {
        return fail("This order has no Stripe session to capture.");
      }
      const result = await capturePayment(order.stripe_session_id);
      if (!result.ok) return fail(result.error ?? "Capture failed.");
      await updateOrder({ ...order, payment_status: "captured" });
      return NextResponse.json({ ok: true, payment_status: "captured" });
    }

    case "release": {
      const order = await orderOrFail(orderId);
      if (!order) return fail("Order not found", 404);
      if (order.stripe_session_id && order.payment_status === "held") {
        const result = await releasePayment(order.stripe_session_id);
        if (!result.ok) return fail(result.error ?? "Could not release the hold.");
      }
      await updateOrder({
        ...order,
        payment_status: "released",
        fulfilment_status: "cancelled",
      });
      return NextResponse.json({ ok: true, payment_status: "released" });
    }

    case "refund": {
      const order = await orderOrFail(orderId);
      if (!order) return fail("Order not found", 404);
      if (order.stripe_session_id) {
        const result = await refundPayment(order.stripe_session_id);
        if (!result.ok) return fail(result.error ?? "Refund failed.");
      }
      await updateOrder({ ...order, payment_status: "refunded" });
      return NextResponse.json({ ok: true, payment_status: "refunded" });
    }

    // ---- statuses --------------------------------------------------------
    case "set_fulfilment": {
      const order = await orderOrFail(orderId);
      if (!order) return fail("Order not found", 404);
      const status = body.status as FulfilmentStatus;
      if (!FULFILMENT.includes(status)) return fail("Unknown fulfilment status");
      await updateOrder({ ...order, fulfilment_status: status });
      return NextResponse.json({ ok: true, fulfilment_status: status });
    }

    case "set_payment": {
      const order = await orderOrFail(orderId);
      if (!order) return fail("Order not found", 404);
      const status = body.status as PaymentStatus;
      if (!PAYMENT.includes(status)) return fail("Unknown payment status");
      await updateOrder({ ...order, payment_status: status });
      return NextResponse.json({ ok: true, payment_status: status });
    }

    case "save_notes": {
      const order = await orderOrFail(orderId);
      if (!order) return fail("Order not found", 404);
      const notes = typeof body.notes === "string" ? body.notes : "";
      await updateOrder({ ...order, admin_notes: notes });
      return NextResponse.json({ ok: true });
    }

    case "set_repeat": {
      const order = await orderOrFail(orderId);
      if (!order) return fail("Order not found", 404);
      await updateOrder({ ...order, repeat_customer: body.repeat === true });
      return NextResponse.json({ ok: true });
    }

    case "save_stock": {
      const raw = (body.stock ?? {}) as {
        counts?: Record<string, unknown>;
        available?: Record<string, unknown>;
      };
      // Each admin form sends its whole subset (counted lines, or toggles), so
      // merge into the stored state rather than replacing it — saving counts
      // must not wipe the availability toggles and vice versa.
      const current = await getStockState();
      const counts: Record<string, number> = { ...current.counts };
      for (const [key, value] of Object.entries(
        (raw.counts ?? {}) as Record<string, unknown>
      )) {
        if (value === null || value === undefined || value === "") {
          delete counts[key];
          continue;
        }
        const n = Number(value);
        if (Number.isFinite(n) && n >= 0) counts[key] = Math.floor(n);
      }
      const available: Record<string, boolean> = { ...current.available };
      for (const [key, value] of Object.entries(
        (raw.available ?? {}) as Record<string, unknown>
      )) {
        if (typeof value === "boolean") available[key] = value;
      }
      const saved = await saveStockState({ counts, available });
      return NextResponse.json({ ok: true, stock: saved });
    }

    case "add_manual_order": {
      const input = body.order as ManualOrderInput | undefined;
      if (!input || typeof input !== "object") return fail("Missing order");
      if (!input.customerName || !input.customerName.trim()) {
        return fail("Customer name is required");
      }
      if (!Array.isArray(input.items) || input.items.length === 0) {
        return fail("Add at least one line");
      }
      const totalCents = Math.round(Number(input.totalCents));
      if (!Number.isFinite(totalCents) || totalCents < 0) {
        return fail("Total must be a positive amount");
      }
      const paymentStatus = PAYMENT.includes(input.paymentStatus)
        ? input.paymentStatus
        : "pending";
      const fulfilmentStatus = FULFILMENT.includes(input.fulfilmentStatus)
        ? input.fulfilmentStatus
        : "pending_approval";
      const id = await createManualOrder({
        ...input,
        customerName: input.customerName.trim(),
        totalCents,
        paymentStatus,
        fulfilmentStatus,
      });
      return NextResponse.json({ ok: true, orderId: id });
    }

    default:
      return fail("Unknown action");
  }
}
