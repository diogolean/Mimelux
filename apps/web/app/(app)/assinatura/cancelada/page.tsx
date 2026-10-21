import Link from "next/link";

export default function SubscriptionCanceledPage() {
  return (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-lg place-items-center px-4 py-10">
      <section className="w-full rounded-[32px] border border-border bg-elevated p-8 text-center">
        <h1 className="text-2xl font-extrabold tracking-[-.04em]">Pagamento cancelado</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Nenhuma cobrança foi feita. Você pode assinar de novo quando quiser.
        </p>
        <Link href="/assinaturas" className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-ink">
          Minhas assinaturas
        </Link>
      </section>
    </main>
  );
}
