import { ImageReveal, Parallax, Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { Img } from "@/components/ui/img";

export function ExperienceSection(p: {
  eyebrow: string;
  title: string;
  body: string;
  image: { url: string; alt: string } | null;
  items: { title: string; text: string }[];
}) {
  return (
    <section className="on-dark relative overflow-hidden bg-espresso py-24 md:py-36">
      <div className="container-x">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading eyebrow={p.eyebrow} title={p.title} body={p.body} />
          </div>
          <div className="lg:col-span-5 lg:pt-16">
            {p.image && (
              <ImageReveal from="right" className="arc-tr aspect-[5/6] w-full">
                <Parallax className="absolute inset-0" strength={50}>
                  <Img src={p.image.url} alt={p.image.alt} fill sizes="(min-width:1024px) 38vw, 92vw" className="object-cover" />
                </Parallax>
              </ImageReveal>
            )}
          </div>
        </div>
        <dl className="mt-20 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {p.items.map((it, i) => (
            <Reveal key={it.title} delay={(i % 3) * 0.08} className="border-t border-ivoire/15 pt-8">
              <dt className="t-h3 text-ivoire">{it.title}</dt>
              <dd className="muted mt-3">{it.text}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
