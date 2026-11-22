// Admin data — everything the admin screens render, in one authenticated call.
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, adminPasswordConfigured } from "@/lib/admin-auth";
import { getAdminData } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!adminPasswordConfigured()) {
    return NextResponse.json(
      { error: "Admin access is not configured on this deployment." },
      { status: 500 }
    );
  }
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await getAdminData();
  return NextResponse.json(data);
}
