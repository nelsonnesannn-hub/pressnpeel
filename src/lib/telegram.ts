// Telegram order notifications — SERVER ONLY.
// Sends a message to Nelson's chat through the Press N Peel bot.
import type { CartItem } from "./cart";

const DEFAULT_CHAT_ID = "1388929935";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export type OrderNotification = {
  orderId: number | null;
  productName: string;
  optionLabel: string;
  quantity: number;
  unitPrice: number;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  status: string;
};

function chatId(): string {
  return (
    process.env.TELEGRAM_ORDER_CHAT_ID ||
    process.env.TELEGRAM_CHAT_ID ||
    DEFAULT_CHAT_ID
  );
}

export async function sendTelegramMessage(
  text: string
): Promise<{ ok: boolean; reason?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, reason: "TELEGRAM_BOT_TOKEN is not set" };

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId(),
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      description?: string;
    };
    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        reason: data.description ?? `Telegram HTTP ${res.status}`,
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "network error",
    };
  }
}

export async function sendTelegramDocument(
  caption: string,
  file: { data: ArrayBuffer; filename: string; mimeType: string }
): Promise<{ ok: boolean; reason?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, reason: "TELEGRAM_BOT_TOKEN is not set" };

  try {
    const form = new FormData();
    form.append("chat_id", chatId());
    form.append("caption", caption);
    form.append(
      "document",
      new Blob([file.data], { type: file.mimeType || "application/octet-stream" }),
      file.filename
    );
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendDocument`,
      { method: "POST", body: form }
    );
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      description?: string;
    };
    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        reason: data.description ?? `Telegram HTTP ${res.status}`,
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "network error",
    };
  }
}

export function buildOrderNotification(order: OrderNotification): string {
  const lines = [
    `<b>New order${order.orderId ? ` #${order.orderId}` : ""} — Press N Peel</b>`,
    `Product: ${escapeHtml(order.productName)} (${escapeHtml(order.optionLabel)})`,
    `Quantity: ${order.quantity} × $${order.unitPrice.toFixed(2)} = <b>$${order.total.toFixed(2)} SGD</b>`,
    `Customer: ${escapeHtml(order.customerName)}`,
    `Email: ${escapeHtml(order.customerEmail)}`,
  ];
  if (order.customerPhone) {
    lines.push(`Phone: ${escapeHtml(order.customerPhone)}`);
  }
  if (order.notes) {
    lines.push(`Notes: ${escapeHtml(order.notes)}`);
  }
  lines.push(`Payment: ${escapeHtml(order.status)}`);
  return lines.join("\n");
}

export type CartNotification = {
  orderId: number | null;
  lines: CartItem[];
  sheetFee: number;
  discountCode: string;
  discountPercent: number;
  discountCents: number;
  totalCents: number;
  captureMethod: string;
  captureLabel: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  designFileNames: string[];
  status: string;
};

function formatCents(value: number): string {
  return `$${(value / 100).toFixed(2)}`;
}

/** A multi-line cart order — every line, the fees, the discount, the capture. */
export function buildCartNotification(order: CartNotification): string {
  const lines = [
    `<b>New cart order${order.orderId ? ` #${order.orderId}` : ""} — Press N Peel</b>`,
  ];
  for (const item of order.lines) {
    const unit =
      item.kind === "fixed"
        ? `${formatCents(item.unitCents)} each`
        : `${formatCents(item.unitCents)} per sticker`;
    lines.push(
      `• ${escapeHtml(item.name)} — ${escapeHtml(item.detail)}\n  ${item.quantity} × ${unit} = <b>${formatCents(item.lineCents)}</b>`
    );
  }
  if (order.sheetFee > 0) {
    lines.push(`• Kiss cut sheet fee = <b>${formatCents(order.sheetFee)}</b>`);
  }
  lines.push(`Subtotal: <b>${formatCents(order.totalCents + order.discountCents - order.sheetFee)}</b>`);
  if (order.discountCents > 0) {
    lines.push(
      `Discount (${escapeHtml(order.discountCode)} −${order.discountPercent}%): −<b>${formatCents(order.discountCents)}</b>`
    );
  }
  lines.push(`Total: <b>${formatCents(order.totalCents)} SGD</b>`);
  lines.push(`Capture: <b>${escapeHtml(order.captureLabel)}</b>`);
  if (order.captureMethod === "manual") {
    lines.push(
      `<i>Card held, not charged. Capture in Stripe Dashboard → Payments → UNCAPTURED after design approval.</i>`
    );
  }
  lines.push(`Customer: ${escapeHtml(order.customerName)}`);
  lines.push(`Email: ${escapeHtml(order.customerEmail)}`);
  if (order.customerPhone) {
    lines.push(`Phone: ${escapeHtml(order.customerPhone)}`);
  }
  if (order.designFileNames.length > 0) {
    lines.push(`Design files: ${escapeHtml(order.designFileNames.join(", "))}`);
  }
  if (order.notes) {
    lines.push(`Notes: ${escapeHtml(order.notes)}`);
  }
  lines.push(`Payment: ${escapeHtml(order.status)}`);
  return lines.join("\n");
}

export function buildPaymentNotification(order: OrderNotification): string {
  return [
    `<b>Payment received — order #${order.orderId ?? ""}</b>`,
    `${escapeHtml(order.productName)} (${escapeHtml(order.optionLabel)}) × ${order.quantity} — <b>$${order.total.toFixed(2)} SGD</b>`,
    `Customer: ${escapeHtml(order.customerName)} (${escapeHtml(order.customerEmail)})`,
  ].join("\n");
}
