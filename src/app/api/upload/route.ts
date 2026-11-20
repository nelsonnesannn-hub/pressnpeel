import { NextRequest, NextResponse } from "next/server";
import { stageUpload } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILES = 8;
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB per file
const MAX_TOTAL_BYTES = 24 * 1024 * 1024; // 24 MB per cart

/**
 * Upload the design files attached to cart items so they survive the browser
 * session and can be sent with the order. Returns a token -> file map the
 * checkout page stores in sessionStorage and posts back to /api/checkout.
 *
 * The bytes are staged in the shared KV store (see src/lib/uploads.ts), so the
 * token resolves from ANY serverless instance — the checkout request does not
 * have to land on the same instance as the upload. Each token expires after
 * one hour and is deleted as soon as /api/checkout consumes it.
 */

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid upload." }, { status: 400 });
  }

  const files = form.getAll("files").filter((v): v is File => v instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ ok: false, error: "No files uploaded." }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { ok: false, error: `Too many files (max ${MAX_FILES}).` },
      { status: 400 }
    );
  }

  let total = 0;
  for (const f of files) total += f.size;
  if (total > MAX_TOTAL_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Design files are too large (max 24 MB total)." },
      { status: 400 }
    );
  }

  const stored: Record<string, { name: string; mimeType: string; size: number }> = {};
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { ok: false, error: `${file.name} is too large (max 8 MB).` },
        { status: 400 }
      );
    }
    const dataBase64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const { token } = await stageUpload({
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      dataBase64,
    });
    stored[token] = { name: file.name, mimeType: file.type || "", size: file.size };
  }

  return NextResponse.json({ ok: true, files: stored });
}
