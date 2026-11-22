"use client";

// Print trigger for the invoice page.
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print rounded-lg px-4 py-2 text-sm font-semibold text-slate-950"
      style={{ backgroundColor: "#FFD60A" }}
    >
      Print / save as PDF
    </button>
  );
}
