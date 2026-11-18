// Shared cart-checkout payload — used by the checkout page (client) and the
// /api/checkout route (server). The server rebuilds every price from these
// fields; the client's totals are display-only and never trusted.
import type { CartItem } from "./cart";

export type CartUpload = {
  name: string;
  mimeType: string;
  dataBase64: string;
  /** Upload-service token so the server can pull the bytes by reference. */
  token?: string;
};
export type CartItemPayload = {
  id: string;
  kind: "fixed" | "custom";
  name: string;
  detail: string;
  unitCents: number;
  quantity: number;
  lineCents: number;
  image?: string;
  productSlug?: string;
  optionId?: string;
  priceUnit?: string;
  minQty?: number;
  custom?: {
    type: "kiss-cut" | "die-cut" | "sticker-packs";
    finish: string;
    sizeCm: number;
    stickerCount: number;
    stickersPerPack?: number;
    shape?: string;
    whiteOffset?: boolean;
    notes?: string;
    files: { name: string; size: number; type: string }[];
  };
};

export type CartCheckoutPayload = {
  items: CartItemPayload[];
  /** item.id -> upload token issued by /api/upload. */
  uploadTokens: Record<string, string>;
  customer: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
  discountCode: string;
};

export function toPayloadItem(item: CartItem): CartItemPayload {
  return {
    id: item.id,
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
    minQty: item.minQty,
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
  };
}

export function itemsFromPayload(raw: unknown): CartItemPayload[] {
  if (!Array.isArray(raw)) return [];
  const out: CartItemPayload[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Partial<CartItemPayload>;
    if (
      (item.kind === "fixed" || item.kind === "custom") &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.detail === "string" &&
      Number.isFinite(item.unitCents) &&
      Number.isFinite(item.quantity)
    ) {
      out.push({
        id: item.id,
        kind: item.kind,
        name: item.name,
        detail: item.detail,
        unitCents: Number(item.unitCents),
        quantity: Math.max(1, Math.floor(Number(item.quantity))),
        lineCents: Number(item.lineCents) || 0,
        image: item.image,
        productSlug: item.productSlug,
        optionId: item.optionId,
        priceUnit: item.priceUnit,
        minQty: item.minQty,
        custom: item.custom,
      });
    }
  }
  return out;
}
