"use client";

import { useState } from "react";
import Link from "next/link";
import type { WorkGroup } from "@/lib/work";

export default function WorkGallery({ groups }: { groups: WorkGroup[] }) {
  const [active, setActive] = useState<string>("all");

  const visible =
    active === "all" ? groups : groups.filter((g) => g.id === active);

  return (
    <div>
      {/* Filter pills */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setActive("all")}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            active === "all"
              ? "text-slate-950"
              : "border border-slate-700 text-slate-400 hover:text-white"
          }`}
          style={active === "all" ? { backgroundColor: "#FFD60A" } : undefined}
        >
          All Work
        </button>
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setActive(g.id)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              active === g.id
                ? "text-slate-950"
                : "border border-slate-700 text-slate-400 hover:text-white"
            }`}
            style={
              active === g.id ? { backgroundColor: "#FFD60A" } : undefined
            }
          >
            {g.title}
          </button>
        ))}
      </div>

      {/* Groups */}
      <div className="space-y-14">
        {visible.map((g) => (
          <div key={g.id}>
            <div className="mb-6">
              <h3
                className="text-xl font-semibold sm:text-2xl"
                style={{ color: "#FACC15" }}
              >
                {g.title}
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-400">
                {g.blurb}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {g.items.map((item) => (
                <figure
                  key={item.src}
                  className="group overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40 transition-all hover:border-[#FFD60A]/40 hover:shadow-lg"
                >
                  <Link
                    href={item.href ?? g.href}
                    className="block"
                    aria-label={`${item.caption} — view ordering options`}
                  >
                    <span className="block overflow-hidden bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.src}
                        alt={item.caption}
                        className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </span>
                    <figcaption className="px-3 py-2.5 text-xs leading-snug text-slate-400">
                      {item.caption}
                    </figcaption>
                  </Link>
                </figure>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
