import Link from "next/link";
import { categories } from "@/lib/categories";

export const BRONZE = "#FFD60A";
export const BRONZE_LIGHT = "#FACC15";

export const WHATSAPP_URL = "https://wa.me/6587674511";
export const EMAIL = "nelsonnesan.nn@gmail.com";

// "Products" is a dropdown of the six shop categories, so it is rendered
// separately from the plain links.
export const NAV_LINKS = [
  { href: "/custom", label: "Custom Upload" },
  { href: "/b2b", label: "Signs & Labels" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const FOOTER_LINKS = [
  { href: "/products", label: "Products" },
  ...NAV_LINKS,
];

// The Products dropdown lists orderable categories only — teaser categories
// (e.g. Vinyl Decals, coming soon) are left out.
const NAV_CATEGORIES = categories.filter((c) => !c.comingSoon);

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.27-.25-.14-1.47-.74-1.69-.82-.23-.08-.37-.12-.56.12-.16.25-.64.81-.78.97-.15.17-.29.19-.53.07-.26-.13-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.12-.24-.01-.39.11-.5.11-.11.27-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.11-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43-.14 0-.3-.01-.47-.01z" />
    </svg>
  );
}

export function Header() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/70 bg-slate-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-3">
        <Link href="/" className="group flex items-center gap-2" aria-label="Press N Peel home">
          <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-800 transition-transform group-hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/press-n-peel-logo-light.jpg"
              alt=""
              className="h-full w-full object-cover"
            />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">
            Press N Peel
          </span>
        </Link>

        <ul className="hidden items-center gap-6 text-sm font-medium text-slate-300 lg:flex">
          {/* Products dropdown — the six shop categories */}
          <li className="group relative">
            <Link
              href="/products"
              className="flex items-center gap-1 transition-colors hover:text-[#FACC15]"
              aria-haspopup="true"
            >
              Products
              <svg
                className="h-3 w-3 transition-transform group-hover:rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Link>
            <div className="invisible absolute left-0 top-full z-50 w-72 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl">
                {NAV_CATEGORIES.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/products/${category.slug}`}
                    className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-900"
                  >
                    <span className="block text-sm font-medium text-white">
                      {category.name}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-slate-400">
                      {category.tagline}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </li>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-[#FACC15]">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
          >
            <WhatsAppIcon className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <Link
            href="/order"
            className="hidden items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-950 shadow transition-transform hover:scale-[1.02] md:inline-flex"
            style={{ backgroundColor: BRONZE }}
          >
            Start Order
          </Link>
          <Link
            href="/contact"
            className="hidden items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white sm:inline-flex"
          >
            Contact
          </Link>

          {/* Mobile menu (no JS required) */}
          <details className="group relative lg:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-700 text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white [&::-webkit-details-marker]:hidden">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
              <ul className="flex flex-col p-2 text-sm font-medium text-slate-300">
                <li className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Products
                </li>
                {NAV_CATEGORIES.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/products/${category.slug}`}
                      className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-900 hover:text-white"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
                <li className="my-1 border-t border-slate-800" />
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-900 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li className="my-1 border-t border-slate-800" />
                <li>
                  <Link
                    href="/order"
                    className="block rounded-lg px-3 py-2.5 text-center font-semibold text-slate-950"
                    style={{ backgroundColor: BRONZE }}
                  >
                    Start Order
                  </Link>
                </li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
          <div className="flex items-center gap-2 text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/press-n-peel-logo-light.jpg"
                alt=""
                className="h-full w-full object-cover"
              />
            </span>
            <span className="text-base font-semibold tracking-tight">Press N Peel</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400" aria-label="Footer">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-[#FACC15]">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-center gap-2 sm:items-end">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-300 transition-colors hover:text-emerald-200"
            >
              <WhatsAppIcon className="h-4 w-4" />
              +65 8767 4511
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="text-sm text-slate-400 transition-colors hover:text-[#FACC15]"
            >
              {EMAIL}
            </a>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-800/70 pt-5 text-center">
          <p className="text-xs text-slate-500">
            {"\u00A9"} {new Date().getFullYear()} Press N Peel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
