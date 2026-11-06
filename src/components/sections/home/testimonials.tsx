import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import type { PublicTestimonial } from "@/lib/data/types";

/** Uniquement des témoignages authentiques ; à défaut, une invitation honnête et compacte à laisser un avis. */
export function TestimonialsSection({
  title,
  body,
  cta,
  items,
}: {
  title: string;
  body: string;
  cta: { label: string; href: string } | null;
  items: PublicTestimonial[];
}) {
  if (items.length) {
    return (
      <section className="panel bg-sable py-20 md:py-28">
        <div className="container-x">
          <SectionHeading title="Ce qu'elles et ils en disent." />
          <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t, i) => (
              <Reveal as="li" key={t.id} delay={i * 0.08} className="rounded-[1.75rem] bg-lin p-8 md:p-10">
                <blockquote>
                  <p className="font-display text-2xl leading-snug">« {t.quote} »</p>
                  <footer className="muted mt-6 text-sm">
                    {t.author}
                    {t.context ? `, ${t.context}` : ""}
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    );
  }
  return (
    <section className="py-6 md:py-10">
      <div className="container-x">
        <div className="grid items-end gap-8 rounded-[1.75rem] bg-sable p-8 sm:p-12 md:rounded-[2.5rem] lg:grid-cols-12 lg:p-16">
          <SectionHeading title={title} body={body} className="lg:col-span-8" />
          {cta && (
            <Reveal className="lg:col-span-4 lg:text-right">
              <LinkButton href={cta.href} variant="dark" arrow>
                {cta.label}
              </LinkButton>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
