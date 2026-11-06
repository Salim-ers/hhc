import Link from "next/link";
import { ImageReveal, Parallax, Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { Img } from "@/components/ui/img";

export function ExpertiseSection(p: {
  eyebrow: string;
  title: string;
  body: string;
  image: { url: string; alt: string } | null;
  pillars: { title: string; text: string }[];
  cta: { label: string; href: string } | null;
}) {
  return (
    <section className="bg-lin py-24 md:py-36">
      <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-5">
          {p.image && (
            <ImageReveal className="arc-tl aspect-[4/5] w-full">
              <Parallax className="absolute inset-0" strength={40}>
                <Img src={p.image.url} alt={p.image.alt} fill sizes="(min-width:1024px) 40vw, 92vw" className="object-cover" />
              </Parallax>
            </ImageReveal>
          )}
        </div>
        <div className="lg:col-span-7 lg:pl-6">
          <SectionHeading eyebrow={p.eyebrow} title={p.title} body={p.body} />
          {p.pillars.length > 0 && (
            <ul className="mt-14 grid gap-8 border-t border-encre/12 pt-10 sm:grid-cols-3 sm:gap-0">
              {p.pillars.map((pi, i) => (
                <Reveal as="li" key={pi.title} delay={0.1 * i} className="sm:border-l sm:border-encre/12 sm:px-7 sm:first:border-l-0 sm:first:pl-0">
                  <h3 className="t-h3">{pi.title}</h3>
                  <p className="muted mt-3 text-[0.97rem]">{pi.text}</p>
                </Reveal>
              ))}
            </ul>
          )}
          {p.cta && (
            <Reveal delay={0.2} className="mt-12">
              <Link href={p.cta.href} className="link-underline font-display text-xl italic text-or-profond">
                {p.cta.label}
              </Link>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
