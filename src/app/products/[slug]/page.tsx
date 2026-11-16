import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products } from "@/lib/catalog";
import { categories, categoryBySlug } from "@/lib/categories";
import CategoryPage from "@/components/category-page";
import ProductDetail from "./product-detail";

export function generateStaticParams() {
  const slugs = new Set<string>();
  for (const category of categories) slugs.add(category.slug);
  for (const product of products) slugs.add(product.slug);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (category) {
    return {
      title: `${category.title} | Press N Peel`,
      description: category.description,
    };
  }
  const product = products.find((p) => p.slug === slug);
  if (product) {
    return {
      title: `${product.name} | Press N Peel`,
      description: product.description,
    };
  }
  return { title: "Products | Press N Peel" };
}

export default async function ProductOrCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;

  // The six shop categories own these URLs.
  const category = categoryBySlug(slug);
  if (category) return <CategoryPage category={category} />;

  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  return <ProductDetail product={product} searchParams={searchParams} />;
}
