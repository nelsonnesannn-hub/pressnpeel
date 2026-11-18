import { NextRequest, NextResponse } from "next/server";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { getProduct, getOption, computeTotal, toCents } from "@/lib/pricing";
import { createOrder, setStripeSession, setNotified } from "@/lib/orders";
import {
  sendTelegramMessage,
  sendTelegramDocument,
  buildOrderNotification,
  buildCartNotification,
} from "@/lib/telegram";
import {
  PACK_FEE_CENTS,
  isFinish,
  recomputeLineCents,
  roundCents,
  sheetFeeFor,
  stickerUnitCents,
  type CartItem,
} from "@/lib/cart";
import { itemsFromPayload, toPayloadItem } from "@/lib/cart-payload";
import { takeUpload } from "@/app/api/upload/route";

const WHATSAPP_URL = "https://wa.me/6587674511";
const DESIGN_REQUIRED_MESSAGE =
  "A design image is required — orders without an accurate design image will be cancelled.";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---- body shapes ---------------------------------------------------------

type IncomingItem = ReturnType<typeof toPayloadItem>;

type CartBody = {
  items: IncomingItem[];
  uploadTokens: Record<string, string>;
  customer: { name: string; email: string; phone: string; notes: string };
  discountCode: string;
};

type SingleBody = {
  productSlug: string;
  optionId: string;
  quantity: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
  nfcLink: string;
  fileName: string;
  discountCode: string;
};

function isCartBody(body: Record<string, unknown>): boolean {
  return Array.isArray(body.items);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---- shared helpers ------------------------------------------------------

async function resolvePromotion(discountCode: string): Promise<{
  promotionCodeId: string | null;
  discountPercent: number;
}> {
  if (!discountCode || !stripeEnabled()) {
    return { promotionCodeId: null, discountPercent: 0 };
  }
  const stripe = getStripe();
  if (!stripe) return { promotionCodeId: null, discountPercent: 0 };
  const found = await stripe.promotionCodes.list({
    code: discountCode,
    active: true,
    limit: 1,
    expand: ["data.promotion.coupon"],
  });
  const promotion = found.data.find((p) => p.active) ?? found.data[0];
  const coupon = promotion?.promotion?.coupon;
  if (promotion && coupon && typeof coupon === "object") {
    return {
      promotionCodeId: promotion.id,
      discountPercent: coupon.percent_off ?? 0,
    };
  }
  throw new Error("INVALID_DISCOUNT");
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (isCartBody(body)) {
    return handleCartCheckout(req, body as unknown as CartBody);
  }
  return handleSingleCheckout(req, body as unknown as SingleBody);
}

// ---- single-product checkout (/order) — unchanged behaviour --------------

async function handleSingleCheckout(req: NextRequest, body: SingleBody) {
  const productSlug = typeof body.productSlug === "string" ? body.productSlug : "";
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
  const fileName = typeof body.fileName === "string" ? body.fileName.trim() : "";
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
    orderId = await createOrder({
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
      captureMethod: "automatic",
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
  if (sent.ok && orderId) await setNotified(orderId, "submitted");

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

    if (orderId) await setStripeSession(orderId, session.id);

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

// ---- cart checkout -------------------------------------------------------

/** Rebuild a cart line from the posted fields, trusting nothing the client sent. */
function rebuildItem(raw: IncomingItem): CartItem | null {
  if (raw.kind === "fixed") {
    const product = getProduct(raw.productSlug ?? "");
    if (!product || !product.buyable || !raw.optionId) return null;
    const option = getOption(product, raw.optionId);
    const qty = Math.max(
      product.min_qty,
      Math.min(100000, Math.floor(Number(raw.quantity)) || product.min_qty)
    );
    return {
      id: raw.id,
      kind: "fixed",
      name: product.name,
      detail: `${option.label} · ${product.material} · ${product.cut_type}`,
      unitCents: roundCents(option.price * 100),
      quantity: qty,
      lineCents: roundCents(option.price * 100) * qty,
      image: option.image ?? product.image,
      productSlug: product.slug,
      optionId: option.id,
      priceUnit: product.price_unit,
      minQty: product.min_qty,
    };
  }

  const c = raw.custom;
  if (!c || !isFinish(c.finish)) return null;
  const unit = stickerUnitCents(c.finish, c.sizeCm);
  if (unit === null) return null;
  const count = Math.max(1, Math.floor(Number(c.stickerCount)) || 1);
  let lineCents = 0;
  let detail = "";
  let stickersPerPack = c.stickersPerPack;
  if (c.type === "kiss-cut") {
    lineCents = roundCents(count * unit);
    detail = `${c.finish} · ${c.sizeCm}cm · ${count} sticker${count === 1 ? "" : "s"}`;
  } else if (c.type === "die-cut") {
    lineCents = roundCents(count * unit);
    detail = `${c.finish} · ${c.sizeCm}cm · ${count} sticker${count === 1 ? "" : "s"}`;
  } else if (c.type === "sticker-packs") {
    const perPack = Math.max(1, Math.floor(Number(c.stickersPerPack)) || 1);
    stickersPerPack = perPack;
    lineCents = count * (roundCents(perPack * unit) + PACK_FEE_CENTS);
    detail = `${c.finish} · ${c.sizeCm}cm · ${count} pack${count === 1 ? "" : "s"} × ${perPack} sticker${perPack === 1 ? "" : "s"}`;
  } else {
    return null;
  }
  if (c.shape) detail += ` · shape: ${c.shape}`;
  if (c.whiteOffset) detail += " · white offset";
  if (c.notes) detail += ` · ${c.notes}`;
  if (c.files && c.files.length > 0) {
    detail += ` · design: ${c.files.map((f) => f.name).join(", ")}`;
  }

  return {
    id: raw.id,
    kind: "custom",
    name:
      c.type === "kiss-cut"
        ? "Kiss cut stickers"
        : c.type === "die-cut"
        ? "Die cut stickers"
        : "Sticker packs",
    detail,
    unitCents: unit,
    quantity: count,
    lineCents,
    custom: {
      type: c.type,
      finish: c.finish,
      sizeCm: c.sizeCm,
      stickerCount: count,
      stickersPerPack,
      shape: c.shape,
      whiteOffset: c.whiteOffset,
      notes: c.notes,
      files: c.files ?? [],
    },
  };
}

async function handleCartCheckout(req: NextRequest, body: CartBody) {
  const name =
    typeof body.customer?.name === "string" ? body.customer.name.trim() : "";
  const email =
    typeof body.customer?.email === "string" ? body.customer.email.trim() : "";
  const phone =
    typeof body.customer?.phone === "string" ? body.customer.phone.trim() : "";
  const notes =
    typeof body.customer?.notes === "string" ? body.customer.notes.trim() : "";
  const discountCode =
    typeof body.discountCode === "string" ? body.discountCode.trim() : "";
  const uploadTokens =
    body.uploadTokens && typeof body.uploadTokens === "object"
      ? (body.uploadTokens as Record<string, string>)
      : {};

  const payloadItems = itemsFromPayload(body.items);
  if (payloadItems.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }
  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  const items: CartItem[] = [];
  for (const raw of payloadItems) {
    const item = rebuildItem(raw);
    if (!item) {
      return NextResponse.json(
        { error: "An item in your cart is no longer available." },
        { status: 400 }
      );
    }
    if (item.kind === "custom") {
      // Design upload is REQUIRED for custom work. The file name travels with
      // the line; the bytes are pulled from the upload service by token.
      if (!item.custom?.files || item.custom.files.length === 0) {
        return NextResponse.json(
          { error: DESIGN_REQUIRED_MESSAGE },
          { status: 400 }
        );
      }
      if (!uploadTokens[item.id]) {
        return NextResponse.json(
          { error: DESIGN_REQUIRED_MESSAGE },
          { status: 400 }
        );
      }
    }
    items.push(item);
  }

  const lines = items.map((item) => ({
    ...item,
    lineCents: recomputeLineCents(item),
  }));
  const sheetFee = sheetFeeFor(lines);
  const subtotal = lines.reduce((sum, item) => sum + item.lineCents, 0);
  const hasCustom = lines.some((item) => item.kind === "custom");
  const captureMethod = hasCustom ? "manual" : "automatic";

  let promotion: { promotionCodeId: string | null; discountPercent: number };
  try {
    promotion = await resolvePromotion(discountCode);
  } catch {
    return NextResponse.json({ error: "Invalid discount code." }, { status: 400 });
  }
  const { promotionCodeId, discountPercent } = promotion;

  const discountCents =
    promotionCodeId && discountPercent
      ? Math.round(((subtotal + sheetFee) * discountPercent) / 100)
      : 0;
  const totalCents = Math.max(0, subtotal + sheetFee - discountCents);
  const total = totalCents / 100;

  // Pull the design files before the ping so the documents reach Nelson.
  const designFiles: { data: ArrayBuffer; filename: string; mimeType: string }[] =
    [];
  for (const item of lines) {
    if (item.kind !== "custom") continue;
    const token = uploadTokens[item.id];
    if (!token) {
      return NextResponse.json(
        { error: DESIGN_REQUIRED_MESSAGE },
        { status: 400 }
      );
    }
    const file = takeUpload(token);
    if (!file) {
      return NextResponse.json(
        {
          error:
            "Your design file has expired — please upload it again before checking out.",
        },
        { status: 400 }
      );
    }
    designFiles.push({
      data: file.data,
      filename: file.name,
      mimeType: file.mimeType,
    });
  }

  const combinedNotes = [
    notes,
    lines
      .filter((item) => item.kind === "custom")
      .map((item) => `${item.name}: ${item.detail}`)
      .join("\n"),
  ]
    .filter(Boolean)
    .join("\n");

  let orderId: number | null = null;
  try {
    orderId = await createOrder({
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      orderType: "b2c",
      total,
      notes: combinedNotes,
      designUrl: designFiles[0]?.filename ?? null,
      productSlug: "cart",
      productName: "Cart order",
      optionLabel: `${lines.length} item${lines.length === 1 ? "" : "s"}`,
      unitPrice: total,
      quantity: lines.reduce((sum, item) => sum + item.quantity, 0),
      items: lines.map((item) => ({
        kind: item.kind,
        name: item.name,
        detail: item.detail,
        unitCents: item.unitCents,
        quantity: item.quantity,
        lineCents: item.lineCents,
        image: item.image,
        productSlug: item.productSlug,
        optionId: item.optionId,
        priceUnit: item.priceUnit,
        custom: item.custom
          ? {
              type: item.custom.type,
              finish: item.custom.finish,
              sizeCm: item.custom.sizeCm,
              stickerCount: item.custom.stickerCount,
              stickersPerPack: item.custom.stickersPerPack,
              shape: item.custom.shape,
              whiteOffset: item.custom.whiteOffset,
              notes: item.custom.notes,
              files: item.custom.files,
            }
          : undefined,
      })),
      fees:
        sheetFee > 0
          ? [{ label: "Kiss cut sheet fee (flat per order)", amountCents: sheetFee }]
          : [],
      discountCents: discountCents || undefined,
      discountCode: promotionCodeId ? discountCode : undefined,
      captureMethod,
    });
  } catch (err) {
    console.error("Could not persist order:", err);
  }

  // UNCONDITIONAL Telegram ping. Nelson hears about every order, with the
  // capture status once the Stripe session exists.
  const captureLabel =
    captureMethod === "manual" ? "held (manual capture)" : "captured";
  const notification =
    orderId != null
      ? buildCartNotification({
          orderId,
          lines,
          sheetFee,
          discountCode: promotionCodeId ? discountCode : "",
          discountPercent: promotionCodeId ? discountPercent : 0,
          discountCents,
          totalCents,
          captureMethod,
          captureLabel,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          notes: combinedNotes,
          designFileNames: designFiles.map((f) => f.filename),
          status: stripeEnabled()
            ? `Awaiting Stripe checkout — payment ${captureLabel}`
            : "Stripe not configured — WhatsApp",
        })
      : buildOrderNotification({
          orderId: null,
          productName: "Cart order",
          optionLabel: `${lines.length} item${lines.length === 1 ? "" : "s"}`,
          quantity: lines.reduce((sum, item) => sum + item.quantity, 0),
          unitPrice: total,
          total,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          notes: combinedNotes,
          status: "Order recorded",
        });

  let sent: { ok: boolean; reason?: string };
  if (designFiles.length > 0) {
    sent = await sendTelegramDocument(notification, designFiles[0]);
    for (const file of designFiles.slice(1)) {
      await sendTelegramDocument(
        `<b>Design file</b>: ${escapeHtml(file.filename)}\n\n<i>Press N Peel website</i>`,
        file
      );
    }
  } else {
    sent = await sendTelegramMessage(notification);
  }
  if (sent.ok && orderId) await setNotified(orderId, "submitted");

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
    const lineItems: {
      quantity: number;
      price_data: {
        currency: "sgd";
        unit_amount: number;
        product_data: { name: string; description: string };
      };
    }[] = lines.map((item) => {
      if (item.kind === "fixed") {
        return {
          quantity: item.quantity,
          price_data: {
            currency: "sgd",
            unit_amount: item.unitCents,
            product_data: {
              name: item.name,
              description: item.detail,
            },
          },
        };
      }
      const c = item.custom!;
      const description = [
        c.finish,
        `${c.sizeCm}cm`,
        c.type === "sticker-packs"
          ? `${c.stickerCount} pack${c.stickerCount === 1 ? "" : "s"} × ${c.stickersPerPack} stickers`
          : `${c.stickerCount} sticker${c.stickerCount === 1 ? "" : "s"}`,
        c.shape ? `shape: ${c.shape}` : "",
        c.whiteOffset ? "white offset" : "",
        c.notes ? c.notes : "",
      ]
        .filter(Boolean)
        .join(" · ");
      return {
        quantity: 1,
        price_data: {
          currency: "sgd",
          unit_amount: item.lineCents,
          product_data: {
            name: item.name,
            description,
          },
        },
      };
    });

    // The flat $3.00 sheet fee is order-level, so it is its own Stripe line.
    if (sheetFee > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "sgd",
          unit_amount: sheetFee,
          product_data: {
            name: "Kiss cut sheet fee",
            description: "Flat $3.00 per order for the kiss-cut sheets.",
          },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: lineItems,
      ...(promotionCodeId
        ? { discounts: [{ promotion_code: promotionCodeId }] }
        : {}),
      // Custom work: authorise only. Nelson captures in the Stripe Dashboard
      // (Payments → UNCAPTURED) once the design is approved.
      ...(captureMethod === "manual"
        ? { payment_intent_data: { capture_method: "manual" } }
        : {}),
      metadata: {
        orderId: String(orderId ?? ""),
        cart: "1",
        itemCount: String(lines.length),
        captureMethod,
        subtotal: (subtotal / 100).toFixed(2),
        sheetFee: (sheetFee / 100).toFixed(2),
        discountCode: promotionCodeId ? discountCode : "",
        discountPercent: promotionCodeId ? String(discountPercent) : "",
        discountAmount: (discountCents / 100).toFixed(2),
        total: total.toFixed(2),
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        notes,
      },
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=1`,
    });

    if (orderId) await setStripeSession(orderId, session.id);

    return NextResponse.json({
      stripeReady: true,
      sessionId: session.id,
      url: session.url,
      subtotalCents: session.amount_subtotal,
      totalCents: session.amount_total,
      captureMethod,
      discountApplied: Boolean(promotionCodeId),
      telegram: sent,
    });
  } catch (err) {
    console.error("Stripe checkout failed:", err);
    return NextResponse.json({
      stripeReady: false,
      whatsappUrl: WHATSAPP_URL,
      telegram: sent,
      error: "Could not start checkout. Please order via WhatsApp instead.",
    });
  }
}
