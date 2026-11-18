import type { VideoGroup } from "@/lib/videos";

export default function VideoGallery({ groups }: { groups: VideoGroup[] }) {
  const visibleGroups = groups.filter((g) => !g.hidden);
  return (
    <div className="space-y-14">
      {visibleGroups.map((g) => (
        <div key={g.id}>
          <h3
            className="mb-6 text-xl font-semibold sm:text-2xl"
            style={{ color: "#FACC15" }}
          >
            {g.title}
          </h3>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((item) => (
              <figure
                key={item.src}
                className="overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/40 transition-all hover:border-[#FFD60A]/40 hover:shadow-lg"
              >
                <video
                  src={item.src}
                  poster={item.poster}
                  controls
                  preload="none"
                  playsInline
                  className="aspect-video w-full bg-slate-950 object-cover"
                />
                <figcaption className="px-4 py-3">
                  <span className="block text-sm font-semibold text-white">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-400">
                    {item.caption}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
