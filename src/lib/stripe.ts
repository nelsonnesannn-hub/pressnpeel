// Stripe server client — SERVER ONLY.
// Never import this from a client component; it reads STRIPE_SECRET_KEY.
import Stripe from "stripe";

let _stripe: Stripe | null = null;

// Read env at runtime. The key is assembled at runtime so the bundler cannot
// inline the build-time value — adding keys to .env.local and restarting is
// enough (no rebuild required).
function runtimeEnv(name: string[]): string {
  const env = process.env as Record<string, string | undefined>;
  return env[name.join("_")] ?? "";
}

export function stripeEnabled(): boolean {
  return Boolean(
    runtimeEnv(["STRIPE", "SECRET", "KEY"]) &&
      runtimeEnv(["NEXT_PUBLIC", "STRIPE", "PUBLISHABLE", "KEY"])
  );
}

export function getStripe(): Stripe | null {
  if (!stripeEnabled()) return null;
  if (!_stripe) {
    _stripe = new Stripe(runtimeEnv(["STRIPE", "SECRET", "KEY"]));
  }
  return _stripe;
}
