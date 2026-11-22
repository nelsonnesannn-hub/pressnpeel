// Public stock availability — what the storefront needs to show "Sold out".
// Counts stay private; only availability, sold-out and low-stock flags leave
// the server.
import { NextResponse } from "next/server";
import {
  getStockState,
  isLineAvailable,
  isSoldOut,
  isLowStock,
} from "@/lib/stock";
import { STOCK_LINES } from "@/lib/stock-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getStockState();
  const lines: Record<
    string,
    { available: boolean; soldOut: boolean; low: boolean }
  > = {};
  for (const line of STOCK_LINES) {
    lines[line.key] = {
      available: isLineAvailable(state, line.key),
      soldOut: isSoldOut(state, line.key),
      low: isLowStock(state, line.key, line.lowAt),
    };
  }
  return NextResponse.json(
    { lines },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
