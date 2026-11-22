// Admin login — exchanges the password for an httpOnly cookie.
// The password comes from ADMIN_PASSWORD; nothing is hardcoded or echoed back.
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  adminPasswordConfigured,
  adminToken,
  checkAdminPassword,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!adminPasswordConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Admin access is not configured on this deployment. Set the ADMIN_PASSWORD environment variable.",
      },
      { status: 500 }
    );
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    password = "";
  }

  if (!checkAdminPassword(password)) {
    return NextResponse.json(
      { ok: false, error: "Wrong password." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
