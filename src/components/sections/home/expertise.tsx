import { ImageReveal, Parallax, Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { LinkButton } from "@/components/ui/button";
import { Img } from "@/components/ui/img";

/** Qui est Angèle : un portrait dans l'arche du miroir, un texte, un lien vers son parcours. */
export function ExpertiseSection(p: {
  title: string;
  body: string;
  image: { url: string; alt: string } | null;
  cta: { label: string; href: string } | null;
}) {
  return (
    <section className="bg-lin py-20 md:py-28 lg:py-32">
      <div className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
        <div className="mx-auto w-full max-w-[26rem] lg:col-span-5 lg:max-w-none">
          {p.image && (
            <ImageReveal className="arch aspect-[3/4] w-full">
              <Parallax className="absolute inset-0" strength={40}>
                <Img src={p.image.url} alt={p.image.alt} fill sizes="(min-width:1024px) 40vw, 92vw" className="object-cover" />
              </Parallax>
            </ImageReveal>
          )}
        </div>
        <div className="lg:col-span-7 lg:pl-4">
          <SectionHeading title={p.title} body={p.body} />
          {p.cta && (
            <Reveal delay={0.25} className="mt-10">
              <LinkButton href={p.cta.href} variant="dark" arrow>
                {p.cta.label}
              </LinkButton>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
