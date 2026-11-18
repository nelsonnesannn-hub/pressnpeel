"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/images/work/pnp-cards/01.jpg", alt: "Press N Peel logo vinyl stickers" },
  { src: "/images/work/pnp-cards/02.jpg", alt: "Press N Peel wordmark stickers" },
  { src: "/images/work/pnp-cards/03.jpg", alt: "Press N Peel logo stickers" },
  { src: "/images/work/pnp-cards/04.jpg", alt: "Press N Peel sticker pile" },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      4500
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-3xl border-[3px] border-[#FFD60A] bg-slate-900 shadow-2xl">
      {SLIDES.map((slide, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div
        className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2"
        role="tablist"
        aria-label="Hero images"
      >
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show image ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              i === index
                ? "bg-[#FFD60A]"
                : "bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
