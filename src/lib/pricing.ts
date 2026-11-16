// Pricing helpers — PUBLIC, client-safe (imports only the catalog).
// The server recomputes every total from here; the client only displays it.
import { products, type ProductRow, type PriceOption } from "./catalog";

export function getProduct(slug: string): ProductRow | undefined {
  return products.find((p) => p.slug === slug);
}

export function getOption(product: ProductRow, optionId: string): PriceOption {
  return (
    product.options.find((o) => o.id === optionId) ?? product.options[0]
  );
}

export function computeTotal(unitPrice: number, quantity: number): number {
  return Math.round(unitPrice * quantity * 100) / 100;
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function formatSGD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
