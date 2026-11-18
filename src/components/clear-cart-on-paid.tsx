"use client";

// Clears the browser cart only once the payment is confirmed. Mounted on the
// order success page — the checkout page itself never clears the cart, so a
// customer who returns from Stripe without paying keeps every item, quantity
// and total exactly as it was.
import { useEffect } from "react";
import { useCart } from "@/components/cart-store";

const UPLOAD_PREFIX = "pnp:upload:";

function clearUploadTokens() {
  if (typeof window === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      if (key && key.startsWith(UPLOAD_PREFIX)) keys.push(key);
    }
    for (const key of keys) window.sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export default function ClearCartOnPaid({ paid }: { paid: boolean }) {
  const { clear } = useCart();
  useEffect(() => {
    if (!paid) return;
    clear();
    clearUploadTokens();
  }, [paid, clear]);
  return null;
}
