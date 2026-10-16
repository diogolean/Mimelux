import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { creators, posts } from "@/lib/mock-data";

export default function FeedPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-7 px-4 py-6 sm:px-8 lg:grid-cols-[minmax(0,640px)_300px] lg:py-9">
      <section>
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#B16E35]">Para você</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-[-.04em]">Seu feed</h1>
        </div>

        <div className="mb-5 flex gap-3 overflow-x-auto pb-2">
          {creators.slice(0, 7).map((creator, index) => (
            <Link key={creator.id} href={`/creator/${creator.username}`} className="shrink-0 text-center">
              <div className={`rounded-full p-[2px] ${index < 4 ? "bg-gradient-to-br from-[#E9A15E] to-[#E9B0A7]" : "bg-black/10"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={creator.avatar} alt={creator.name} className="size-14 rounded-full border-2 border-background object-cover sm:size-16" />
              </div>
              <p className="mt-1.5 w-16 truncate text-[8px] font-semibold">{creator.name.split(" ")[0]}</p>
            </Link>
          ))}
          <button className="shrink-0 text-center">
            <span className="grid size-[60px] place-items-center rounded-full border border-dashed border-black/20 bg-white/40 sm:size-[68px]"><Plus className="size-5 text-muted" /></span>
            <span className="mt-1.5 block text-[8px] font-semibold">Descobrir</span>
          </button>
        </div>

        <div className="space-y-5">
          {posts.map((post) => {
            const creator = creators.find((item) => item.id === post.creatorId);
            return creator ? <PostCard key={post.id} post={post} creator={creator} /> : null;
          })}
        </div>
      </section>

      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          <div className="rounded-[26px] bg-[#202027] p-5 text-white">
            <Sparkles className="size-5 text-[#E9A15E]" />
            <h2 className="mt-4 text-base font-extrabold">Feito para descobrir</h2>
            <p className="mt-2 text-[10px] leading-5 text-white/60">Seu feed fica melhor conforme você acompanha e apoia novos criadores.</p>
            <Link href="/topcreators?tab=destaques" className="mt-4 inline-block text-[10px] font-bold text-[#E9A15E]">Explorar destaques →</Link>
          </div>
          <div className="rounded-[26px] border border-black/5 bg-white/55 p-5 dark:bg-white/5">
            <h3 className="text-xs font-extrabold">Sugestões para você</h3>
            <div className="mt-3 space-y-4">
              {creators.slice(4, 7).map((creator) => (
                <Link key={creator.id} href={`/creator/${creator.username}`} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={creator.avatar} alt="" className="size-10 rounded-full object-cover" />
                  <span className="min-w-0 flex-1"><b className="block truncate text-[10px]">{creator.name}</b><small className="block truncate text-[8px] text-muted">{creator.category}</small></span>
                  <span className="text-[9px] font-bold text-[#B16E35]">Ver</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
