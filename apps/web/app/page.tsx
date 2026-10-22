import { CreatorShowcase } from "@/components/creator-showcase";
import { LandingHeader } from "@/components/landing-header";
import { creators } from "@/lib/gateway";

export default function Home() {
  return (
    <main className="min-h-dvh bg-background">
      <LandingHeader />
      <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-10 sm:px-8 sm:pt-14">
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary-strong">Patrocino</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">
          Os criadores mais recentes, primeiro.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
          As estreias ficam no topo. O catálogo de demonstração continua abaixo, com a capa e o retrato de cada perfil.
        </p>
      </section>
      <CreatorShowcase creators={creators} />
    </main>
  );
}
