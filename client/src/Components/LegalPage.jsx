import { useTitle } from "../useTitle";

/**
 * A long document with a contents list beside it on wide screens.
 * @param {{ title: string, updated: string, intro: React.ReactNode,
 *   sections: { id: string, title: string, body: React.ReactNode }[] }} props
 */
export default function LegalPage({ title, updated, intro, sections }) {
  useTitle(title);
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <header className="max-w-3xl border-b border-line pb-10 pt-16 sm:pt-24">
        <p className="eyebrow">Legal</p>
        <h1 className="font-display mt-5 text-[2.6rem] font-extrabold leading-[1.02] sm:text-6xl">{title}</h1>
        <p className="mt-4 text-sm text-subtle">Last updated {updated}</p>
        <div className="mt-6 max-w-2xl text-lg leading-8 text-muted">{intro}</div>
      </header>

      <div className="grid gap-12 py-12 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">On this page</p>
            <ol className="mt-4 space-y-1 border-l border-line">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="-ml-px block border-l border-transparent py-1 pl-4 text-sm text-muted transition-colors hover:border-fg hover:text-fg"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="max-w-3xl space-y-12">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`}>
              <h2 id={`${s.id}-title`} className="flex items-baseline gap-3 text-xl font-semibold">
                <span className="text-sm font-bold tabular-nums text-subtle">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              <div className="prose-doc mt-4">{s.body}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
