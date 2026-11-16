import Link from "next/link";
import { WHATSAPP_URL } from "@/components/nav";

const NFC_POINTS = [
  "Tap a phone on the keychain to open any link",
  "No app needed — works on iPhone and Android",
  "Printed in any shape with your design or logo",
  "Ideal for events, brands, and gifts",
];

export default function NfcSection() {
  return (
    <section className="border-t border-slate-800/60 bg-slate-900/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy */}
          <div>
            <span
              className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#0f172a", backgroundColor: "#FFD60A" }}
            >
              NFC Keychains
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Tap to Open.{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(to right, #FFD60A, #FACC15)",
                }}
              >
                Print to Last.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
              Our acrylic NFC keychains carry a tap-to-open chip — one tap on a
              phone opens your social media link, Instagram, or website. No app
              needed. Printed in any shape with your design.
            </p>

            <ul className="mt-8 space-y-3">
              {NFC_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3 text-slate-300">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: "#FFD60A" }}
                    aria-hidden
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/products/keychains"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold text-slate-950 shadow transition-transform hover:scale-[1.03]"
                style={{ backgroundColor: "#FFD60A" }}
              >
                Enquire About NFC Keychains
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-7 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Visual */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <span className="block overflow-hidden rounded-2xl border border-slate-800/70 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/work/keychains/07.jpg"
                  alt="NFC keychains — tap to open a link"
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
              </span>
              <span className="block overflow-hidden rounded-2xl border border-slate-800/70 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/work/keychains/04.jpg"
                  alt="Acrylic keychain with iridescent jellyfish"
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
              </span>
            </div>
            <video
              src="/videos/VID_20261113_022800_555.mp4"
              poster="/videos/posters/VID_20261113_022800_555.jpg"
              controls
              preload="none"
              playsInline
              className="aspect-video w-full rounded-2xl border border-slate-800/70 bg-slate-950 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
