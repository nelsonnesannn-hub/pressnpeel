// Design-file staging — SERVER ONLY.
//
// Uploaded design bytes are held in the shared KV (Redis) store so that ANY
// serverless instance can resolve them at checkout — not just the instance
// that received the upload. Each token maps to one staged file and expires
// after UPLOAD_TTL_SECONDS (1 hour), so the store self-cleans. takeUpload()
// deletes the key as it reads, so a token is single-use.
//
// When KV is not configured (local dev) an in-process Map with the same TTL is
// used as a fallback. Never import this from a client component.
import { createClient, type VercelKV } from "@vercel/kv";

export type StagedUpload = {
  name: string;
  mimeType: string;
  dataBase64: string;
};

export type TakenUpload = {
  name: string;
  mimeType: string;
  data: ArrayBuffer;
};

const UPLOAD_PREFIX = "pnp:upload:";
const UPLOAD_TTL_SECONDS = 60 * 60; // 1 hour — long enough for a checkout
                                    // session, short enough to self-clean.

function kvCredentials(): { url: string; token: string } | null {
  // Same credential resolution as src/lib/orders.ts: Vercel KV injects
  // KV_REST_API_URL / KV_REST_API_TOKEN, and the Upstash Marketplace store
  // injects the UPSTASH_* equivalents.
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

export function uploadsKvEnabled(): boolean {
  return kvCredentials() !== null;
}

// ---- in-process fallback (local dev / KV outage) -------------------------

const memoryUploads = new Map<
  string,
  StagedUpload & { expires: number }
>();

function sweepMemory(): void {
  const now = Date.now();
  for (const [token, entry] of memoryUploads) {
    if (entry.expires <= now) memoryUploads.delete(token);
  }
}

// ---- public API ---------------------------------------------------------

export function newUploadToken(): string {
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Stage one uploaded file under a fresh token. Resolves from any instance
 * when KV is configured; otherwise falls back to this process's Map.
 */
export async function stageUpload(
  input: StagedUpload
): Promise<{ token: string }> {
  const token = newUploadToken();
  const key = `${UPLOAD_PREFIX}${token}`;
  const c = client();
  if (c) {
    try {
      await c.set(key, input, { ex: UPLOAD_TTL_SECONDS });
      return { token };
    } catch (err) {
      console.error("KV upload staging failed, falling back to memory:", err);
    }
  }
  sweepMemory();
  memoryUploads.set(token, {
    ...input,
    expires: Date.now() + UPLOAD_TTL_SECONDS * 1000,
  });
  return { token };
}

/**
 * Read a staged file back and consume its token (single use). Returns null
 * when the token is unknown or has expired.
 */
export async function takeUpload(token: string): Promise<TakenUpload | null> {
  const key = `${UPLOAD_PREFIX}${token}`;
  const c = client();
  if (c) {
    try {
      const raw = await c.get<StagedUpload>(key);
      if (raw) {
        await c.del(key);
        return {
          name: raw.name,
          mimeType: raw.mimeType,
          data: decodeBase64(raw.dataBase64),
        };
      }
    } catch (err) {
      console.error("KV upload read failed, falling back to memory:", err);
    }
  }

  const entry = memoryUploads.get(token);
  if (!entry) return null;
  memoryUploads.delete(token);
  if (entry.expires <= Date.now()) return null;
  return {
    name: entry.name,
    mimeType: entry.mimeType,
    data: decodeBase64(entry.dataBase64),
  };
}

function decodeBase64(base64: string): ArrayBuffer {
  const buf = Buffer.from(base64, "base64");
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength
  ) as ArrayBuffer;
}
