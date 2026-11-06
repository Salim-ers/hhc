import { LineReveal, Parallax, Reveal } from "@/components/motion/reveal";
import { LinkButton } from "@/components/ui/button";
import { Img } from "@/components/ui/img";
import { paragraphs } from "@/lib/utils";

/** Grande photographie artistique, texte posé sur un panneau ivoire qui la chevauche. */
export function ColoristeSection(p: {
  eyebrow: string;
  title: string;
  body: string;
  image: { url: string; alt: string } | null;
  cta: { label: string; href: string } | null;
}) {
  return (
    <section className="relative bg-ivoire">
      <div className="grid lg:grid-cols-12">
        <div className="relative h-[72svh] min-h-[28rem] lg:col-span-7 lg:h-[100svh]">
          {p.image && (
            <Parallax className="absolute inset-0" strength={90}>
              <Img src={p.image.url} alt={p.image.alt} fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover" />
            </Parallax>
          )}
        </div>
        <div className="relative lg:col-span-5">
          <div className="relative z-10 -mt-24 mx-[var(--gutter)] bg-lin p-8 shadow-[0_50px_100px_-60px_rgba(56,43,39,0.6)] sm:p-12 lg:absolute lg:-left-40 lg:top-1/2 lg:mx-0 lg:mt-0 lg:w-[calc(100%+6rem)] lg:-translate-y-1/2 lg:p-16">
            <Reveal y={10}>
              <p className="eyebrow">{p.eyebrow}</p>
            </Reveal>
            <LineReveal text={p.title} className="t-h2 mt-5" />
            <Reveal delay={0.15}>
              <div className="muted mt-7 space-y-4">
                {paragraphs(p.body).map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </div>
              {p.cta && (
                <LinkButton href={p.cta.href} variant="dark" className="mt-10">
                  {p.cta.label}
                </LinkButton>
              )}
            </Reveal>
          </div>
          <div className="h-16 lg:hidden" />
        </div>
      </div>
    </section>
  );
}
