"use client";

// Admin password gate. The password is never stored or echoed — it is posted
// once and exchanged for an httpOnly cookie by /api/admin/login.
import { useState } from "react";
import { btnPrimary, inputClass } from "./admin-shared";

export default function AdminLogin({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not sign in.");
        setBusy(false);
        return;
      }
      window.location.href = "/admin";
    } catch {
      setError("Could not reach the server.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/press-n-peel-logo-light.jpg"
              alt=""
              className="h-full w-full object-cover"
            />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-white">Press N Peel</h1>
          <p className="mt-1 text-sm text-slate-400">Admin sign in</p>
        </div>

        {configured ? (
          <form
            onSubmit={submit}
            className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5"
          >
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-400">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
                className={inputClass}
                placeholder="Enter the admin password"
              />
            </label>
            {error ? (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={busy || !password}
              className={`${btnPrimary} w-full`}
              style={{ backgroundColor: "#FFD60A" }}
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-200">
            <p className="font-semibold">Admin access is not configured yet.</p>
            <p className="mt-2 text-amber-200/80">
              Set the <code className="font-mono">ADMIN_PASSWORD</code>{" "}
              environment variable in Vercel, then reload this page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
