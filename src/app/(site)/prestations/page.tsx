import Link from "next/link";
import { ImageReveal, Reveal } from "@/components/motion/reveal";
import { BreadcrumbJsonLd } from "@/components/site/json-ld";
import { CtaBand } from "@/components/sections/cta-band";
import { PageIntro } from "@/components/sections/page-intro";
import { SectionHeading } from "@/components/sections/section-heading";
import { Img } from "@/components/ui/img";
import { sectionOf } from "@/lib/content/get";
import { getExpertises, getPage, getSettings } from "@/lib/data/public";
import { loadPublicPage } from "@/lib/page-guard";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const generateMetadata = () => pageMetadata("prestations");

export default async function PrestationsPage() {
  const page = await loadPublicPage("prestations");
  const [expertises, settings, home] = await Promise.all([getExpertises(), getSettings(), getPage("home")]);
  const intro = sectionOf(page, "intro");
  const dom = sectionOf(page, "domicile");
  const cta = sectionOf(home, "cta");

  return (
    <>
      <PageIntro eyebrow={intro.text("eyebrow")} title={intro.text("title")} subtitle={intro.text("subtitle")} image={intro.image("image")} />

      <section className="bg-lin py-24 md:py-32" aria-label="Nos expertises">
        <div className="container-x">
          <ul className="space-y-24 md:space-y-36">
            {expertises.map((e, i) => {
              const flip = i % 2 === 1;
              return (
                <li key={e.id} id={e.slug} className="grid scroll-mt-32 items-center gap-10 md:grid-cols-12 md:gap-14">
                  <div className={cn("md:col-span-6", flip && "md:order-2 md:col-start-7")}>
                    {e.imageUrl && (
                      <ImageReveal from={flip ? "right" : "left"} className={cn("aspect-[4/5] w-full md:aspect-[5/6]", flip ? "arc-tr" : "arc-tl")}>
                        <Img src={e.imageUrl} alt={e.imageAlt ?? ""} fill sizes="(min-width:768px) 48vw, 92vw" className="object-cover" />
                      </ImageReveal>
                    )}
                  </div>
                  <div className={cn("md:col-span-5", flip ? "md:order-1 md:col-start-1" : "md:col-start-8")}>
                    <Reveal y={10}>
                      <p className="eyebrow">{e.kicker}</p>
                    </Reveal>
                    <Reveal delay={0.05}>
                      <h2 className="t-h2 mt-5">{e.title}</h2>
                      <p className="t-lead muted mt-6">{e.summary}</p>
                      {e.highlights.length > 0 && (
                        <ul className="mt-8 flex flex-wrap gap-2">
                          {e.highlights.map((h) => (
                            <li key={h} className="border border-encre/15 px-3.5 py-1.5 text-sm text-encre/80">
                              {h}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
                        {e.priceCategorySlug && (
                          <Link href={`/tarifs#${e.priceCategorySlug}`} className="link-underline font-display text-xl italic text-or-profond">
                            Voir les tarifs
                          </Link>
                        )}
                        <Link href={`/contact?prestation=${encodeURIComponent(e.title)}`} className="link-underline text-encre/80">
                          Demander un rendez-vous
                        </Link>
                      </div>
                    </Reveal>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {dom.visible && (
        <section className="on-dark bg-espresso py-24 md:py-32">
          <div className="container-x grid gap-14 lg:grid-cols-12">
            <SectionHeading eyebrow={dom.text("eyebrow")} title={dom.text("title")} body={dom.text("body")} className="lg:col-span-6" />
            <ul className="space-y-8 lg:col-span-5 lg:col-start-8 lg:pt-14">
              {dom.list<{ title: string; text: string }>("items").map((it, i) => (
                <Reveal as="li" key={it.title} delay={i * 0.08} className="border-t border-ivoire/15 pt-6">
                  <h3 className="t-h3 text-ivoire">{it.title}</h3>
                  <p className="muted mt-2">{it.text}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CtaBand
        eyebrow={cta.text("eyebrow")}
        title={cta.text("title")}
        body={cta.text("body")}
        image={cta.image("image")}
        phone={settings.business.phone}
        phoneE164={settings.business.phoneE164}
      />
      <BreadcrumbJsonLd items={[{ name: "Prestations", path: "/prestations" }]} />
    </>
  );
}
