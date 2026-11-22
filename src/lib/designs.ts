// Design-file archive — SERVER ONLY.
//
// The upload token bucket (src/lib/uploads.ts) is single-use and expires after
// an hour, so it cannot back the admin's per-item design thumbnail. At checkout
// the already-fetched design bytes are copied into a permanent key per order
// line:  pnp:order:design:<orderId>:<itemId>  ->  { name, mimeType, dataBase64 }
//
// Nothing else about the upload flow changes: the token is still consumed
// exactly as before, and the archive is additive.

import { createClient, type VercelKV } from "@vercel/kv";

const PREFIX = "pnp:order:design:";

function kvCredentials(): { url: string; token: string } | null {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.UPSTASH_REST_TOKEN ||
    "";
  if (!url || !token) return null;
  return { url, token };
}

let _client: VercelKV | null = null;

function client(): VercelKV | null {
  const creds = kvCredentials();
  if (!creds) return null;
  if (!_client) {
    _client = createClient({ url: creds.url, token: creds.token });
  }
  return _client;
}

export type ArchivedDesign = {
  name: string;
  mimeType: string;
  dataBase64: string;
};

function key(orderId: number, itemId: string): string {
  return `${PREFIX}${orderId}:${itemId}`;
}

function encode(data: ArrayBuffer): string {
  return Buffer.from(data).toString("base64");
}

export async function archiveDesign(
  orderId: number,
  itemId: string,
  file: { name: string; mimeType: string; data: ArrayBuffer }
): Promise<void> {
  const c = client();
  if (!c) return;
  try {
    const payload: ArchivedDesign = {
      name: file.name,
      mimeType: file.mimeType || "application/octet-stream",
      dataBase64: encode(file.data),
    };
    await c.set(key(orderId, itemId), payload);
  } catch (err) {
    console.error("Could not archive design file:", err);
  }
}

export async function getDesign(
  orderId: number,
  itemId: string
): Promise<ArchivedDesign | null> {
  const c = client();
  if (!c) return null;
  try {
    const raw = await c.get<ArchivedDesign>(key(orderId, itemId));
    if (raw && typeof raw.dataBase64 === "string") return raw;
  } catch (err) {
    console.error("Could not read archived design:", err);
  }
  return null;
}

/** All archived designs for an order, in insertion order. */
export async function listDesigns(
  orderId: number
): Promise<{ itemId: string; design: ArchivedDesign }[]> {
  const c = client();
  if (!c) return [];
  const out: { itemId: string; design: ArchivedDesign }[] = [];
  let cursor = "0";
  const match = `${PREFIX}${orderId}:*`;
  do {
    const [next, keys] = await c.scan(cursor, { match, count: 100 });
    cursor = next;
    for (const k of keys) {
      const design = await c.get<ArchivedDesign>(k);
      if (design) {
        out.push({ itemId: k.slice(match.length - 1), design });
      }
    }
  } while (cursor !== "0");
  return out;
}
