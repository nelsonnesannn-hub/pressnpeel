import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, sendTelegramDocument } from "@/lib/telegram";
import { createEnquiry } from "@/lib/orders";
import {
  formatKissCutUnit,
  formatSGD,
  kissCutSizeCm,
  kissCutStickerCents,
  kissCutTotalCents,
} from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

type UploadedFile = {
  id: string;
  label: string;
  data: ArrayBuffer;
  filename: string;
  mimeType: string;
};

export async function POST(req: NextRequest) {
  const fields: Record<string, string> = {};
  const labels: Record<string, string> = {};
  const rawFiles: UploadedFile[] = [];

  try {
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const entries = Array.from(form.entries());

      // First pass: text fields + human labels for each upload field.
      for (const [key, value] of entries) {
        if (typeof value !== "string") continue;
        if (key.startsWith("upload_label:")) {
          labels[key.slice("upload_label:".length)] = value;
        } else {
          fields[key] = value;
        }
      }

      // Second pass: every uploaded file, labelled by its field.
      for (const [key, value] of entries) {
        if (typeof value === "string") continue;
        if (!value || typeof value !== "object" || !("arrayBuffer" in value)) {
          continue;
        }
        const uploaded = value as File;
        const id = key.startsWith("file:") ? key.slice(5) : key;
        rawFiles.push({
          id,
          label: labels[id] ?? (key === "file" ? "file" : id),
          data: await uploaded.arrayBuffer(),
          filename: uploaded.name,
          mimeType: uploaded.type,
        });
      }
    } else {
      Object.assign(fields, await req.json());
    }
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: `Failed to parse request: ${String(error)}` },
      { status: 400 }
    );
  }

  const source = fields.source || "Website enquiry";
  const ignored = new Set(["source", "paymentMethod"]);

  // Kiss-cut sticker pricing. The browser sends its own computed price, but
  // the server is the source of truth: recompute the per-sticker price and
  // total from the posted finish / size / sticker count, store that enquiry,
  // and put the server's numbers in Nelson's notification.
  let kissCut: {
    sizeCm: number;
    finish: string;
    stickerCount: number;
    perStickerCents: number;
    totalCents: number;
  } | null = null;
  if (fields.kissCut === "1") {
    const sizeCm = kissCutSizeCm(fields.size ?? "");
    const finish = fields.finish || fields.vinyl || "";
    const stickerCount = Math.max(
      1,
      Math.floor(Number(fields.stickerCount ?? fields.quantity ?? 1)) || 1
    );
    const perStickerCents = kissCutStickerCents(finish, sizeCm);
    const totalCents = kissCutTotalCents(finish, sizeCm, stickerCount);
    if (perStickerCents != null && totalCents != null) {
      kissCut = { sizeCm, finish, stickerCount, perStickerCents, totalCents };
    }
  }

  if (kissCut) {
    try {
      await createEnquiry({
        source,
        fields,
        sizeCm: kissCut.sizeCm,
        finish: kissCut.finish,
        stickerCount: kissCut.stickerCount,
        perStickerCents: kissCut.perStickerCents,
        totalCents: kissCut.totalCents,
      });
    } catch (err) {
      console.error("Could not store quote enquiry:", err);
    }
  }

  // Required design images. Custom order/quote forms flag `requireDesign`, and
  // the sticker-pack section additionally lists each upload field it needs.
  // An empty upload must never reach Nelson's Telegram.
  const requireDesign = fields.requireDesign === "1";
  const requiredUploadIds = (fields.requiredUploads ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const filesById: Record<string, number> = {};
  for (const file of rawFiles) {
    filesById[file.id] = (filesById[file.id] ?? 0) + 1;
  }
  const DESIGN_REQUIRED_MESSAGE =
    "A design image is required — orders without an accurate design image will be cancelled.";
  if (requireDesign && rawFiles.length === 0) {
    return NextResponse.json(
      { ok: false, error: DESIGN_REQUIRED_MESSAGE },
      { status: 400 }
    );
  }
  const missingUploadId = requiredUploadIds.find((id) => !filesById[id]);
  if (missingUploadId) {
    return NextResponse.json(
      {
        ok: false,
        error: `Please attach ${labels[missingUploadId] ?? missingUploadId} — ${DESIGN_REQUIRED_MESSAGE}`,
      },
      { status: 400 }
    );
  }

  // Client-computed prices are never trusted — they are dropped here and
  // replaced by the server's recomputed values below.
  const clientOnly = new Set(["pricePerSticker", "priceTotal"]);
  const lines = Object.entries(fields)
    .filter(
      ([key, value]) =>
        !ignored.has(key) && !clientOnly.has(key) && value !== ""
    )
    .map(([key, value]) => `<b>${escapeHtml(key)}</b>: ${escapeHtml(String(value))}`);

  if (kissCut) {
    lines.push(
      `<b>Price per sticker</b>: ${formatKissCutUnit(kissCut.perStickerCents)} (${kissCut.sizeCm}cm ${kissCut.finish})`,
      `<b>Order total</b>: ${formatSGD(kissCut.totalCents / 100)} (${kissCut.stickerCount} sticker${kissCut.stickerCount === 1 ? "" : "s"} + $3.00 sheet fee) — server computed`
    );
  }

  for (const file of rawFiles) {
    lines.push(`<b>${escapeHtml(file.label)}</b>: ${escapeHtml(file.filename)}`);
  }

  const text = `<b>New ${escapeHtml(source)}</b>\n\n${lines.join("\n")}\n\n<i>Press N Peel website</i>`;
  // Telegram captions are limited to 1024 characters — keep the enquiry text
  // safe when many upload fields are present.
  const caption = text.length > 1000 ? `${text.slice(0, 1000)}…` : text;

  let result: { ok: boolean; reason?: string };
  if (rawFiles.length === 0) {
    result = await sendTelegramMessage(text);
  } else {
    // First document carries the full enquiry; the rest follow as their own
    // documents so nothing is dropped.
    result = await sendTelegramDocument(caption, rawFiles[0]);
    for (const file of rawFiles.slice(1)) {
      await sendTelegramDocument(
        `<b>${escapeHtml(file.label)}</b>: ${escapeHtml(file.filename)}\n\n<i>Press N Peel website</i>`,
        file
      );
    }
  }

  return NextResponse.json({ ok: result.ok === true, telegram: result });
}
