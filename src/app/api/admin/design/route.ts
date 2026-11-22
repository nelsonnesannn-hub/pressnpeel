// Admin design image — serves an archived design file for the order-detail
// thumbnail. Requires the admin cookie; the bytes never leave the server.
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, adminPasswordConfigured } from "@/lib/admin-auth";
import { getOrderById } from "@/lib/orders";
import { getDesign } from "@/lib/designs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!adminPasswordConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orderId = Number(req.nextUrl.searchParams.get("order"));
  const index = Number(req.nextUrl.searchParams.get("index") ?? "0");
  if (!Number.isFinite(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Unknown order" }, { status: 404 });
  }

  const order = await getOrderById(orderId);
  if (!order) return NextResponse.json({ error: "Unknown order" }, { status: 404 });
  const entry = (order.design_files ?? [])[index];
  if (!entry) return NextResponse.json({ error: "No design file" }, { status: 404 });

  const design = await getDesign(orderId, entry.itemId);
  if (!design) {
    return NextResponse.json({ error: "No design file" }, { status: 404 });
  }

  const bytes = Buffer.from(design.dataBase64, "base64");
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": design.mimeType || "application/octet-stream",
      "Cache-Control": "private, no-store",
      "Content-Disposition": `inline; filename="${encodeURIComponent(design.name)}"`,
    },
  });
}
