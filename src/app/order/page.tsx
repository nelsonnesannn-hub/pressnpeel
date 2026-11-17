import OrderForm from "./OrderForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Place Your Order | Press N Peel",
  description:
    "Order printable vinyl, NFC and acrylic keychains online. Pay securely with Stripe or order via WhatsApp.",
};

export default function OrderPage() {
  // Runtime env read (computed key) so the bundler cannot inline the
  // build-time value — adding keys to .env.local + restart is enough.
  const env = process.env as Record<string, string | undefined>;
  const secretKey = env["STRIPE" + "_SECRET_KEY"] ?? "";
  const publishableKey = env["NEXT_PUBLIC" + "_STRIPE_PUBLISHABLE_KEY"] ?? "";
  const stripeReady = Boolean(secretKey && publishableKey);

  return (
    <OrderForm stripeReady={stripeReady} publishableKey={publishableKey} />
  );
}
