import Link from "next/link";

export const metadata = {
  title: "Signs & Safety Labels | Press N Peel",
  description:
    "Printed safety and compliance signs — hazard, danger, caution, no-smoking, and equipment labels. A4 or A3 on durable vinyl.",
};

export default function B2BPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-16 text-center">
        <span className="mb-4 inline-block rounded-full border border-[#D4A017]/30 bg-[#D4A017]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#D4A017]">
          For Businesses
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Signs &amp; Safety Labels
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
          Printed safety and compliance signs for workplaces, equipment, and
          public spaces — hazard warnings, danger notices, caution signs, and
          no-smoking. A4 or A3 on durable vinyl.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/order?type=signs"
            className="rounded-xl px-7 py-3.5 text-base font-semibold text-slate-950 shadow-lg transition-transform hover:scale-[1.03]"
            style={{ backgroundColor: "#D4A017" }}
          >
            Request a Quote
          </Link>
          <Link
            href="/custom?type=signs"
            className="rounded-xl border border-slate-700 px-7 py-3.5 text-base font-medium text-slate-300 transition-colors hover:bg-slate-900/60 hover:text-white"
          >
            Upload Your Artwork
          </Link>
        </div>
      </div>

      <div className="mb-16 overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40">
        <span className="block overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/no-smoking-label.jpg"
            alt="Printed safety sign"
            className="h-64 w-full object-cover"
          />
        </span>
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-white">Printed Signs</h2>
          <p className="mt-2 max-w-2xl text-slate-400">
            A4 and A3 printed signs on durable vinyl — hazard warnings, danger
            notices, caution signs, no-smoking, and custom compliance labels.
            Send us your artwork or we can typeset from your text.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-500">
            <span className="rounded-full border border-slate-700 px-3 py-1">A4</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">A3</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">Durable vinyl</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">Indoor &amp; outdoor</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-8 sm:p-10">
        <h2 className="text-2xl font-bold text-white">Why businesses order from us</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Quoted per job",
              body: "Send your spec and quantity — we quote individually. No published prices, no surprises.",
            },
            {
              title: "Durable materials",
              body: "Vinyl rated for industrial and outdoor use. Printed, not handwritten.",
            },
            {
              title: "Fast turnaround",
              body: "Printed and cut to order, packed and shipped ready to put up.",
            },
          ].map((f) => (
            <div key={f.title}>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
