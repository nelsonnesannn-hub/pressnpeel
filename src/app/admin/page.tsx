import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminPasswordConfigured, isAdminToken } from "@/lib/admin-auth";
import AdminLogin from "@/components/admin/admin-login";
import AdminApp from "@/components/admin/admin-app";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin | Press N Peel",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const store = await cookies();
  const authed = isAdminToken(store.get(ADMIN_COOKIE)?.value);

  // The gate is server-side: no order data is rendered or shipped without a
  // valid cookie, and the cookie only ever carries a digest of ADMIN_PASSWORD.
  if (!authed) {
    return <AdminLogin configured={adminPasswordConfigured()} />;
  }
  return <AdminApp />;
}
