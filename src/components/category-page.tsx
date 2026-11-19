import Link from "next/link";
import type { Category, CategorySample } from "@/lib/categories";
import { products } from "@/lib/catalog";
import CategoryOrderForm from "./category-order-form";
import CustomOrderForm from "./custom-order-form";
import AddToCartButton from "./add-to-cart-button";
import SampleBuyButton from "./sample-buy-button";
import OrderJumpBar, { orderSectionIds } from "./order-jump-bar";
import DeliveryNote from "./delivery-note";
import { WHATSAPP_URL } from "./nav";
import EnquireButton from "./enquire-button";
import { ENQUIRE_LABELS, ENQUIRE_LINKS } from "@/lib/enquire";

// One WhatsApp enquiry button per orderable product type, placed in that
// product's own order section. Coming-soon pages never reach these branches.
const SECTION_ENQUIRE: Record<string, { label: string; href: string }> = {
  "stickers-and-labels:kiss-cut": {
    label: ENQUIRE_LABELS.kissCut,
    href: ENQUIRE_LINKS.kissCut,
  },
  "stickers-and-labels:die-cut": {
    label: ENQUIRE_LABELS.dieCut,
    href: ENQUIRE_LINKS.dieCut,
  },
  "stickers-and-labels:sticker-packs": {
    label: ENQUIRE_LABELS.stickerPacks,
    href: ENQUIRE_LINKS.stickerPacks,
  },
};

const PAGE_ENQUIRE: Record<string, { label: string; href: string }> = {
  keychains: {
    label: ENQUIRE_LABELS.acrylicKeychains,
    href: ENQUIRE_LINKS.acrylicKeychains,
  },
  "printable-vinyl": {
    label: ENQUIRE_LABELS.printableVinyl,
    href: ENQUIRE_LINKS.printableVinyl,
  },
};

function SampleGrid({
  samples,
  buySlug,
}: {
  samples: CategorySample[];
  buySlug?: string;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {samples.map((sample) => (
        <article
          key={sample.src + sample.caption}
          className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40 transition-all hover:border-[#FFD60A]/30 hover:bg-slate-900/70"
        >
          <span className="block overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sample.src}
              alt={sample.caption}
              className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </span>
          <div className="flex flex-1 flex-col p-5">
            <p className="flex-1 text-sm font-medium leading-relaxed text-slate-200">
              {sample.caption}
            </p>
            {sample.badge ? (
              <span className="mt-3 inline-flex w-fit rounded-full border border-[#FFD60A]/40 bg-[#FFD60A]/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#FFD60A]">
                {sample.badge}
              </span>
            ) : null}
            {sample.priceLabel ? (
              <p
                className="mt-3 text-lg font-bold"
                style={{ color: "#FFD60A" }}
              >
                {sample.priceLabel}
              </p>
            ) : null}
            {sample.buyOption && buySlug ? (
              <SampleBuyButton slug={buySlug} optionId={sample.buyOption} />
            ) : sample.orderHref ? (
              <Link
                href={sample.orderHref}
                className="mt-3 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: "#FFD60A" }}
              >
                Buy Now
              </Link>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export default function CategoryPage({ category }: { category: Category }) {
  const comingSoon = category.orderable === false;
  const sectionIds = orderSectionIds(category);
  const buyProduct = category.buySlug
    ? products.find((p) => p.slug === category.buySlug && p.buyable)
    : undefined;
  const pageEnquire = PAGE_ENQUIRE[category.slug];

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      {/* Header */}
      <div className="mb-14 text-center">
        <span className="mb-4 inline-block rounded-full border border-[#FFD60A]/30 bg-[#FFD60A]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#FFD60A]">
          {category.tagline}
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {category.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">
          {category.description}
        </p>
      </div>

      {/* Quick-jump shortcuts to the order sections (orderable pages only) */}
      <OrderJumpBar category={category} />

      {/* Samples */}
      <section className="mb-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="mb-2 inline-block rounded-full border border-[#FFD60A]/40 bg-[#FFD60A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#FACC15]">
              Samples
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              What&apos;s Available
            </h2>
            {category.samplesIntro ? (
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                {category.samplesIntro}
              </p>
            ) : null}
          </div>
          <Link
            href="/products"
            className="hidden rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white sm:inline-flex"
          >
            All Products
          </Link>
        </div>

        {category.sampleGroups ? (
          category.sampleGroups.map((group, index) => (
            <div
              key={group.title ?? `samples-${index}`}
              className={index > 0 ? "mt-12" : undefined}
            >
              {group.title ? (
                <div className="mb-6">
                  <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                    {group.title}
                  </h3>
                  <span
                    className="mt-3 block h-1 w-16 rounded-full"
                    style={{ backgroundColor: "#FFD60A" }}
                  />
                </div>
              ) : null}
              <SampleGrid samples={group.samples} buySlug={category.buySlug} />
            </div>
          ))
        ) : category.samples.length > 0 ? (
          <SampleGrid samples={category.samples} buySlug={category.buySlug} />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-6 py-16 text-center text-slate-400">
            Samples coming soon — upload your design and we&apos;ll print it.
          </div>
        )}

        {category.samplesNote ? (
          <p className="mt-6 text-center text-sm text-slate-500">
            {category.samplesNote}
          </p>
        ) : null}
      </section>

      {/* Colour options (Vinyl Decals & HTV) */}
      {category.colours && category.colours.length > 0 ? (
        <section className="mb-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-3 inline-block rounded-full border border-[#FFD60A]/40 bg-[#FFD60A]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#FACC15]">
              Colours
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Colour Options
            </h2>
            <p className="mt-3 text-slate-400">
              Available for both vinyl decals and HTV.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {category.colours.map((colour) => (
                <span
                  key={colour}
                  className="rounded-full border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-200"
                >
                  {colour}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Custom order form */}
      <section id="order" className="scroll-mt-24">
        <div className="mb-10 text-center">
          <span
            className="mb-3 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-950"
            style={{ backgroundColor: "#FFD60A" }}
          >
            {comingSoon ? "Coming Soon" : buyProduct ? "Add to Cart" : "Custom Order"}
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {category.orderTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            {category.orderSubtitle}
          </p>
          {!comingSoon ? (
            <div className="mx-auto mt-6 max-w-2xl text-left">
              <DeliveryNote />
            </div>
          ) : null}
        </div>

        {comingSoon ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-[#FFD60A]/30 bg-[#FFD60A]/10 p-10 text-center">
            <h3 className="text-2xl font-bold text-white">
              {category.comingSoonTitle ??
                (category.comingSoon
                  ? "Vinyl decals & HTV are coming soon."
                  : "Coaster packs are coming soon.")}
            </h3>
            <p className="mt-3 text-slate-300">
              {category.orderSubtitle}
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-slate-950"
              style={{ backgroundColor: "#FFD60A" }}
            >
              Chat on WhatsApp
            </a>
          </div>
        ) : category.quoteSections ? (
          category.quoteSections.map((section, index) => {
            const enquire = SECTION_ENQUIRE[`${category.slug}:${section.id}`];
            return (
              <div
                key={section.id}
                id={sectionIds[index]}
                className="mb-14 scroll-mt-24 last:mb-0"
              >
                <div className="mb-6 text-center">
                  <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {section.title}
                  </h3>
                  {section.blurb ? (
                    <p className="mx-auto mt-2 max-w-2xl text-slate-400">
                      {section.blurb}
                    </p>
                  ) : null}
                </div>
                <div className="mb-8">
                  <SampleGrid samples={section.samples} buySlug={category.buySlug} />
                </div>
                {section.cartType ? (
                  <CustomOrderForm type={section.cartType} sectionId={section.id} />
                ) : (
                  <CategoryOrderForm
                    category={category}
                    sectionTitle={section.title}
                    form={section.form}
                  />
                )}
                {enquire ? (
                  <div className="mt-8 text-center">
                    <EnquireButton href={enquire.href} label={enquire.label} />
                  </div>
                ) : null}
              </div>
            );
          })
        ) : buyProduct ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-slate-800/70 bg-slate-900/40 p-8">
            <AddToCartButton slug={buyProduct.slug} />
          </div>
        ) : (
          <CategoryOrderForm category={category} form={category.form} />
        )}

        {!comingSoon && !category.quoteSections && pageEnquire ? (
          <div className="mt-8 text-center">
            <EnquireButton href={pageEnquire.href} label={pageEnquire.label} />
          </div>
        ) : null}
      </section>
    </div>
  );
}
