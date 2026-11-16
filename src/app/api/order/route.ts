import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage, sendTelegramDocument } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

type UploadedFile = { data: ArrayBuffer; filename: string; mimeType: string };

export async function POST(req: NextRequest) {
  const fields: Record<string, string> = {};
  let file: UploadedFile | undefined;

  try {
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      for (const [key, value] of form.entries()) {
        if (typeof value === "string") {
          fields[key] = value;
        } else if (value && typeof value === "object" && "arrayBuffer" in value) {
          const uploaded = value as File;
          file = {
            data: await uploaded.arrayBuffer(),
            filename: uploaded.name,
            mimeType: uploaded.type,
          };
        }
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

  const lines = Object.entries(fields)
    .filter(([key, value]) => !ignored.has(key) && value !== "")
    .map(([key, value]) => `<b>${escapeHtml(key)}</b>: ${escapeHtml(String(value))}`);

  if (file) {
    lines.push(`<b>file</b>: ${escapeHtml(file.filename)}`);
  }

  const text = `<b>New ${escapeHtml(source)}</b>\n\n${lines.join("\n")}\n\n<i>Press N Peel website</i>`;
  const result = file
    ? await sendTelegramDocument(text, file)
    : await sendTelegramMessage(text);

  return NextResponse.json({ ok: result.ok === true, telegram: result });
}
