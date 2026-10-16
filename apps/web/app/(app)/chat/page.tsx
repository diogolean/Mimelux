import Link from "next/link";
import { ChevronRight, MessageCircle, Search } from "lucide-react";
import { conversations, creators } from "@/lib/mock-data";

export default function ChatPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 lg:py-9">
      <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#B16E35]">Conexões</p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-[-.04em]">Conversas</h1>
      <p className="mt-2 text-xs text-muted">Mensagens e experiências de quem você acompanha.</p>
      <div className="relative mt-6">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input placeholder="Pesquisar conversas" className="h-12 w-full rounded-full border border-black/5 bg-[#F0E8DE]/60 pl-11 pr-4 text-xs outline-none focus:border-[#E9A15E] dark:bg-white/5" />
      </div>

      <section className="mt-6 overflow-hidden rounded-[28px] border border-black/5 bg-white/60 dark:bg-white/5">
        {conversations.map((conversation, index) => {
          const creator = creators.find((item) => item.id === conversation.creatorId)!;
          return (
            <Link key={conversation.id} href={`/chat/${conversation.id}`} className={`flex items-center gap-3 p-4 transition hover:bg-[#F0E8DE]/50 sm:p-5 dark:hover:bg-white/5 ${index > 0 ? "border-t border-black/5" : ""}`}>
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={creator.avatar} alt={creator.name} className="size-13 rounded-full object-cover sm:size-14" />
                {index < 3 && <i className="absolute bottom-0 right-0 size-3.5 rounded-full border-[3px] border-background bg-emerald-500" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><h2 className="truncate text-xs font-extrabold">{creator.name}</h2><span className="text-[8px] text-muted">{conversation.time}</span></div>
                <p className={`mt-1 truncate text-[10px] ${conversation.unread ? "font-semibold text-foreground" : "text-muted"}`}>{conversation.preview}</p>
              </div>
              {conversation.unread > 0 ? <span className="grid size-6 place-items-center rounded-full bg-[#E9A15E] text-[9px] font-black text-[#202027]">{conversation.unread}</span> : <ChevronRight className="size-4 text-muted" />}
            </Link>
          );
        })}
      </section>
      <div className="mt-6 flex items-center gap-3 rounded-[24px] bg-gradient-to-r from-[#E9A15E]/18 to-[#E9B0A7]/20 p-4">
        <span className="grid size-10 place-items-center rounded-2xl bg-white/60"><MessageCircle className="size-4 text-[#B16E35]" /></span>
        <div><p className="text-[10px] font-extrabold">Dica do Mimelux</p><p className="mt-1 text-[9px] text-muted">Criadores nunca pedirão dados de pagamento pelo chat.</p></div>
      </div>
    </div>
  );
}
