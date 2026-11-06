import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import type { PublicTestimonial } from "@/lib/data/types";

/** Uniquement des témoignages authentiques ; à défaut, une invitation honnête à laisser un avis. */
export function TestimonialsSection({
  eyebrow,
  title,
  body,
  cta,
  items,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string } | null;
  items: PublicTestimonial[];
}) {
  return (
    <section className="bg-sable py-24 md:py-32">
      <div className="container-x">
        {items.length ? (
          <>
            <SectionHeading eyebrow={eyebrow} title="Ce qu'elles et ils en disent." />
            <ul className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {items.map((t, i) => (
                <Reveal as="li" key={t.id} delay={i * 0.08} className="border-t border-encre/15 pt-8">
                  <blockquote>
                    <p className="font-display text-2xl font-light leading-snug">« {t.quote} »</p>
                    <footer className="muted mt-6 text-sm">
                      {t.author}
                      {t.context ? ` — ${t.context}` : ""}
                    </footer>
                  </blockquote>
                </Reveal>
              ))}
            </ul>
          </>
        ) : (
          <div className="grid items-end gap-10 lg:grid-cols-12">
            <SectionHeading eyebrow={eyebrow} title={title} body={body} className="lg:col-span-8" />
            {cta && (
              <Reveal className="lg:col-span-4 lg:text-right">
                <LinkButton href={cta.href} variant="dark">
                  {cta.label}
                </LinkButton>
              </Reveal>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
