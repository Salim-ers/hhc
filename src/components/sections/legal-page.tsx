import { PageIntro } from "@/components/sections/page-intro";

/** Texte simple : un titre par bloc (première ligne), puis paragraphes. */
export function LegalBody({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="max-w-3xl space-y-10">
      {blocks.map((b, i) => {
        const [first, ...rest] = b.split("\n");
        return rest.length ? (
          <div key={i}>
            <h2 className="t-h3">{first}</h2>
            {rest.map((r, j) => (
              <p key={j} className="muted mt-3">
                {r}
              </p>
            ))}
          </div>
        ) : (
          <p key={i} className="muted">
            {first}
          </p>
        );
      })}
    </div>
  );
}

export function LegalShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <PageIntro title={title} />
      <section className="bg-lin py-20 md:py-28">
        <div className="container-x">{children}</div>
      </section>
    </>
  );
}
