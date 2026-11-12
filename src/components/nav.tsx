import Link from "next/link";

export const BRONZE = "#C5A059";
export const BRONZE_LIGHT = "#D4B87A";

export const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/custom", label: "Custom Upload" },
  { href: "/b2b", label: "Signs & Labels" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-2" aria-label="Press N Peel home">
          <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full shadow-lg transition-transform group-hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/press-n-peel-dog-logo.jpg"
              alt=""
              className="h-full w-full object-cover"
            />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">
            Press N Peel
          </span>
        </Link>

        <ul className="hidden items-center gap-8 text-sm font-medium text-slate-300 sm:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-[#D4B87A]">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/order"
            className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-950 shadow transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: BRONZE }}
          >
            Start Order
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-white">
            <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/press-n-peel-dog-logo.jpg"
                alt=""
                className="h-full w-full object-cover"
              />
            </span>
            <span className="text-base font-semibold tracking-tight">Press N Peel</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400" aria-label="Footer">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-[#D4B87A]">
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Press N Peel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
