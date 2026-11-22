// Invoice CSV export — every order is an invoice; nothing is ever deleted.
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, adminPasswordConfigured } from "@/lib/admin-auth";
import { getAdminData } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  const escaped = text.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function GET(req: NextRequest) {
  if (!adminPasswordConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getAdminData();
  const header = [
    "Invoice",
    "Date",
    "Customer",
    "Email",
    "Phone",
    "Items",
    "Subtotal (SGD)",
    "Delivery (SGD)",
    "Discount (SGD)",
    "Total (SGD)",
    "Payment status",
    "Fulfilment status",
    "Delivery weekend",
    "Source",
    "Stripe reference",
  ];
  const rows = data.orders.map((order) => {
    const subtotal = order.totalCents + order.discountCents - order.deliveryCents;
    return [
      `INV-${order.number}`,
      order.date,
      order.customerName,
      order.customerEmail,
      order.customerPhone ?? "",
      order.itemsSummary,
      (subtotal / 100).toFixed(2),
      (order.deliveryCents / 100).toFixed(2),
      (order.discountCents / 100).toFixed(2),
      (order.totalCents / 100).toFixed(2),
      order.paymentStatus,
      order.fulfilmentStatus,
      order.deliveryWeekend ?? "",
      order.source,
      order.stripeSessionId ?? "",
    ]
      .map(csvCell)
      .join(",");
  });

  const csv = [header.map(csvCell).join(","), ...rows].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="press-n-peel-invoices.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
