// Admin authentication — SERVER ONLY.
//
// The admin page is gated by a single password held in the ADMIN_PASSWORD env
// var (Nelson sets it in Vercel). Nothing here hardcodes or prints a password:
// the cookie only ever carries a SHA-256 digest of it, and the digest is
// compared timing-safely. When ADMIN_PASSWORD is unset the gate denies
// everything, so a deploy without the env var exposes no order data.
//
// Never import this from a client component.

import { createHash, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "pnp_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Runtime env read (computed key) so the bundler cannot inline the value. */
function runtimeEnv(name: string): string {
  const env = process.env as Record<string, string | undefined>;
  return env[name] ?? "";
}

export function adminPasswordConfigured(): boolean {
  return runtimeEnv("ADMIN_PASSWORD").length > 0;
}

/** Digest of the configured password — the only value ever stored in a cookie. */
export function adminToken(): string {
  return adminTokenFor(runtimeEnv("ADMIN_PASSWORD"));
}

export function adminTokenFor(password: string): string {
  return createHash("sha256")
    .update(`pressnpeel:admin:${password}`)
    .digest("hex");
}

/** Check a submitted password against the configured one, timing-safely. */
export function checkAdminPassword(password: string): boolean {
  if (!adminPasswordConfigured()) return false;
  if (!password) return false;
  const expected = Buffer.from(adminToken(), "utf8");
  const given = Buffer.from(adminTokenFor(password), "utf8");
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}

export function isAdminToken(token: string | null | undefined): boolean {
  if (!adminPasswordConfigured()) return false;
  if (!token) return false;
  const expected = Buffer.from(adminToken(), "utf8");
  const given = Buffer.from(token, "utf8");
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}

/** Check a request's admin cookie. */
export async function isAdminRequest(
  req: Request
): Promise<boolean> {
  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === ADMIN_COOKIE) return isAdminToken(rest.join("="));
  }
  return false;
}
