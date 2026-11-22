"use client";

// Storefront stock status — one fetch of /api/stock, shared by every buy
// button. Counts stay private; only availability / sold-out / low flags are
// published. The server re-checks the same state on every checkout submission,
// so this is display only.
import { useEffect, useState } from "react";

export type StockFlags = {
  available: boolean;
  soldOut: boolean;
  low: boolean;
};

export const DEFAULT_STOCK_FLAGS: StockFlags = {
  available: true,
  soldOut: false,
  low: false,
};

let stockPromise: Promise<Record<string, StockFlags>> | null = null;

function loadStock(): Promise<Record<string, StockFlags>> {
  if (!stockPromise) {
    stockPromise = fetch("/api/stock", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { lines: {} }))
      .then((data) => (data.lines ?? {}) as Record<string, StockFlags>)
      .catch(() => ({}));
  }
  return stockPromise;
}

export function useStock(): Record<string, StockFlags> {
  const [lines, setLines] = useState<Record<string, StockFlags>>({});
  useEffect(() => {
    let active = true;
    void loadStock().then((data) => {
      if (active) setLines(data);
    });
    return () => {
      active = false;
    };
  }, []);
  return lines;
}

export function flagsFor(
  lines: Record<string, StockFlags>,
  key: string
): StockFlags {
  return lines[key] ?? DEFAULT_STOCK_FLAGS;
}
