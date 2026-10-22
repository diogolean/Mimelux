import Link from "next/link";
import type { Creator } from "@/lib/gateway";

export function CreatorShowcase({
  creators,
  plain = false,
}: {
  creators: Creator[];
  plain?: boolean;
}) {
  return (
    <section
      data-testid="creator-showcase"
      className={plain ? "mt-6" : "mx-auto w-full max-w-6xl px-4 pb-20 sm:px-8"}
    >
      {creators.length === 0 ? (
        <p className="rounded-[24px] border border-border bg-elevated px-5 py-8 text-sm text-muted">
          Nenhum criador publicado ainda.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator, index) => (
            <Link
              key={creator.id}
              href={`/creator/${creator.username}`}
              data-testid="showcase-card"
              className="card-lift min-w-0"
            >
              <div className="overflow-hidden rounded-[28px] border border-border bg-elevated">
                <div className="relative h-44 overflow-hidden sm:h-52">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={creator.cover}
                    alt=""
                    className="h-full w-full object-cover"
                    loading={index < 2 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </div>
                <div className="flex items-center gap-3 px-4 py-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="size-14 shrink-0 rounded-full object-cover"
                    loading={index < 2 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold">{creator.name}</p>
                    <p className="truncate text-xs text-muted">
                      @{creator.username} · {creator.category}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
