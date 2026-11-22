// Stripe actions for the admin screen — SERVER ONLY.
// Capture / release / refund a manual-capture PaymentIntent behind a Checkout
// session. Every failure is returned as a plain message; Stripe internals are
// never leaked to the browser.

import Stripe from "stripe";
import { getStripe } from "./stripe";

export type StripeActionResult = {
  ok: boolean;
  error?: string;
  paymentStatus?: string;
};

async function paymentIntentId(
  stripe: Stripe,
  sessionId: string
): Promise<{ id: string | null; error?: string }> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });
    const intent = session.payment_intent;
    if (!intent) {
      return {
        id: null,
        error:
          "This session has no payment intent yet — the customer has not completed payment.",
      };
    }
    return { id: typeof intent === "string" ? intent : intent.id };
  } catch (err) {
    return {
      id: null,
      error: `Could not read the Stripe session: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
}

export async function capturePayment(sessionId: string): Promise<StripeActionResult> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, error: "Stripe is not configured." };
  const { id, error } = await paymentIntentId(stripe, sessionId);
  if (error) return { ok: false, error };
  if (!id) return { ok: false, error: "No payment intent to capture." };
  try {
    const intent = await stripe.paymentIntents.capture(id);
    return { ok: true, paymentStatus: intent.status };
  } catch (err) {
    return {
      ok: false,
      error: `Capture failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export async function releasePayment(sessionId: string): Promise<StripeActionResult> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, error: "Stripe is not configured." };
  const { id, error } = await paymentIntentId(stripe, sessionId);
  if (error) return { ok: false, error };
  if (!id) return { ok: false, error: "No payment intent to release." };
  try {
    const intent = await stripe.paymentIntents.cancel(id);
    return { ok: true, paymentStatus: intent.status };
  } catch (err) {
    return {
      ok: false,
      error: `Release failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export async function refundPayment(sessionId: string): Promise<StripeActionResult> {
  const stripe = getStripe();
  if (!stripe) return { ok: false, error: "Stripe is not configured." };
  const { id, error } = await paymentIntentId(stripe, sessionId);
  if (error) return { ok: false, error };
  if (!id) return { ok: false, error: "No payment intent to refund." };
  try {
    await stripe.refunds.create({ payment_intent: id });
    return { ok: true, paymentStatus: "refunded" };
  } catch (err) {
    return {
      ok: false,
      error: `Refund failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
