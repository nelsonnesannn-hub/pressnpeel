import { NextRequest, NextResponse } from "next/server";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { getProduct, getOption, computeTotal, toCents } from "@/lib/pricing";
import { createOrder, setStripeSession, setNotified } from "@/lib/orders";
import {
  sendTelegramMessage,
  buildOrderNotification,
} from "@/lib/telegram";

const WHATSAPP_URL = "https://wa.me/6587674511";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const productSlug =
    typeof body.productSlug === "string" ? body.productSlug : "";
  const optionId = typeof body.optionId === "string" ? body.optionId : "";
  const quantityRaw = Number(body.quantity);
  const requestedQuantity = Number.isFinite(quantityRaw)
    ? Math.max(1, Math.min(100000, Math.floor(quantityRaw)))
    : 1;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  const nfcLink = typeof body.nfcLink === "string" ? body.nfcLink.trim() : "";
  const fileName =
    typeof body.fileName === "string" ? body.fileName.trim() : "";
  const discountCode =
    typeof body.discountCode === "string" ? body.discountCode.trim() : "";

  const product = getProduct(productSlug);
  if (!product) {
    return NextResponse.json({ error: "Unknown product" }, { status: 400 });
  }
  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }
  if (product.slug === "nfc-keychains" && !nfcLink) {
    return NextResponse.json(
      { error: "Please provide the social media link to program." },
      { status: 400 }
    );
  }

  const quantity = Math.max(product.min_qty, requestedQuantity);
  const option = getOption(product, optionId);
  const unitPrice = option.price;
  const subtotal = computeTotal(unitPrice, quantity);

  // Campaign codes are resolved against Stripe so the promotion code behind
  // the on-page preview is the same one applied to the Checkout Session.
  // Codes the browser rejected never reach this point.
  let promotionCodeId: string | null = null;
  let discountPercent = 0;
  if (discountCode && stripeEnabled()) {
    const lookup = getStripe();
    if (lookup) {
      try {
        const found = await lookup.promotionCodes.list({
          code: discountCode,
          active: true,
          limit: 1,
          expand: ["data.promotion.coupon"],
        });
        const promotion = found.data.find((p) => p.active) ?? found.data[0];
        const coupon = promotion?.promotion?.coupon;
        if (promotion && coupon && typeof coupon === "object") {
          promotionCodeId = promotion.id;
          discountPercent = coupon.percent_off ?? 0;
        }
        if (!promotionCodeId || !discountPercent) {
          return NextResponse.json(
            { error: "Invalid discount code." },
            { status: 400 }
          );
        }
      } catch (err) {
        console.error("Discount code lookup failed:", err);
        return NextResponse.json(
          {
            error:
              "Could not verify that discount code. Please remove it and try again.",
          },
          { status: 502 }
        );
      }
    }
  }

  const discountValue =
    promotionCodeId && discountPercent
      ? Math.round(((subtotal * discountPercent) / 100) * 100) / 100
      : 0;
  const total = Math.round((subtotal - discountValue) * 100) / 100;

  const orderType = product.category === "signs" ? "b2b" : "b2c";
  const combinedNotes = [
    notes,
    nfcLink ? `NFC link to program: ${nfcLink}` : "",
    fileName ? `Design file: ${fileName}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  // Record the order locally so the success page can look it up.
  // A DB failure must never block the order — Nelson is still pinged below.
  let orderId: number | null = null;
  try {
    orderId = createOrder({
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      orderType,
      total,
      notes: combinedNotes,
      designUrl: fileName || undefined,
      productSlug: product.slug,
      productName: product.name,
      optionLabel: option.label,
      unitPrice,
      quantity,
    });
  } catch (err) {
    console.error("Could not persist order:", err);
  }

  // UNCONDITIONAL Telegram ping — Nelson hears about every order, even when
  // Stripe is not configured or the checkout request fails.
  const notification = buildOrderNotification({
    orderId,
    productName: product.name,
    optionLabel: option.label,
    quantity,
    unitPrice,
    total,
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    notes: combinedNotes,
    status: stripeEnabled()
      ? "Awaiting Stripe checkout"
      : "Stripe not configured — WhatsApp",
  });
  const sent = await sendTelegramMessage(notification);
  if (sent.ok && orderId) setNotified(orderId, "submitted");

  if (!stripeEnabled()) {
    return NextResponse.json({
      stripeReady: false,
      whatsappUrl: WHATSAPP_URL,
      telegram: sent,
    });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({
      stripeReady: false,
      whatsappUrl: WHATSAPP_URL,
      telegram: sent,
    });
  }

  const origin = req.nextUrl.origin;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          quantity,
          price_data: {
            currency: "sgd",
            unit_amount: toCents(unitPrice),
            product_data: {
              name: product.name,
              description: `${option.label} · ${product.material} · ${product.cut_type}`,
            },
          },
        },
      ],
      // Applies the same campaign code the customer entered on the form, so
      // the 10% comes off the amount Stripe charges — not just the on-page sum.
      ...(promotionCodeId
        ? { discounts: [{ promotion_code: promotionCodeId }] }
        : {}),
      metadata: {
        orderId: String(orderId ?? ""),
        productSlug: product.slug,
        productName: product.name,
        optionLabel: option.label,
        quantity: String(quantity),
        unitPrice: unitPrice.toFixed(2),
        subtotal: subtotal.toFixed(2),
        discountCode: promotionCodeId ? discountCode : "",
        discountPercent: promotionCodeId ? String(discountPercent) : "",
        discountAmount: discountValue.toFixed(2),
        total: total.toFixed(2),
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        notes,
        nfcLink,
      },
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/order?canceled=1`,
    });

    if (orderId) setStripeSession(orderId, session.id);

    return NextResponse.json({
      stripeReady: true,
      sessionId: session.id,
      url: session.url,
      subtotalCents: session.amount_subtotal,
      totalCents: session.amount_total,
      discountApplied: Boolean(promotionCodeId),
      telegram: sent,
    });
  } catch (err) {
    // Do not leak Stripe internals to the browser. The order is already
    // recorded and Nelson has already been pinged — offer WhatsApp instead.
    console.error("Stripe checkout failed:", err);
    return NextResponse.json({
      stripeReady: false,
      whatsappUrl: WHATSAPP_URL,
      telegram: sent,
      error: "Could not start checkout. Please order via WhatsApp instead.",
    });
  }
}
