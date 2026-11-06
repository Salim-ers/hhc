import { Monogram } from "@/components/brand/monogram";
import { ImageReveal, LineReveal, Reveal } from "@/components/motion/reveal";
import { BreadcrumbJsonLd } from "@/components/site/json-ld";
import { CtaBand } from "@/components/sections/cta-band";
import { PageIntro } from "@/components/sections/page-intro";
import { SectionHeading } from "@/components/sections/section-heading";
import { Img } from "@/components/ui/img";
import { sectionOf } from "@/lib/content/get";
import { getPage, getSettings } from "@/lib/data/public";
import { loadPublicPage } from "@/lib/page-guard";
import { pageMetadata } from "@/lib/seo";
import { paragraphs } from "@/lib/utils";

export const generateMetadata = () => pageMetadata("a-propos");

export default async function AProposPage() {
  const page = await loadPublicPage("a-propos");
  const [settings, home] = await Promise.all([getSettings(), getPage("home")]);
  const intro = sectionOf(page, "intro");
  const portrait = sectionOf(page, "portrait");
  const parcours = sectionOf(page, "parcours");
  const concept = sectionOf(page, "concept");
  const passion = sectionOf(page, "passion");
  const atouts = sectionOf(page, "atouts");
  const cta = sectionOf(home, "cta");
  const photo = portrait.image("image");

  return (
    <>
      <PageIntro eyebrow={intro.text("eyebrow")} title={intro.text("title")} subtitle={intro.text("subtitle")} compact />

      <section className="bg-lin py-24 md:py-36">
        <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-20">
          {portrait.visible && (
            <figure className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                {photo ? (
                  <ImageReveal className="arc-tl aspect-[4/5] w-full">
                    <Img src={photo.url} alt={photo.alt || "Portrait d'Angèle"} fill sizes="(min-width:1024px) 38vw, 92vw" className="object-cover" />
                  </ImageReveal>
                ) : (
                  // Emplacement réservé au vrai portrait d'Angèle (à importer depuis l'administration).
                  <div className="arc-tl grain relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-espresso">
                    <Monogram title="" aria-hidden className="w-1/2 text-champagne/80" />
                  </div>
                )}
                {portrait.text("caption") && <figcaption className="muted mt-4 font-display italic">{portrait.text("caption")}</figcaption>}
              </div>
            </figure>
          )}
          <div className="lg:col-span-7">
            {parcours.visible && <SectionHeading eyebrow={parcours.text("eyebrow")} title={parcours.text("title")} body={parcours.text("body")} />}
            {concept.visible && (
              <div className="mt-24">
                <SectionHeading eyebrow={concept.text("eyebrow")} title={concept.text("title")} body={concept.text("body")} />
                {concept.image("image") && (
                  <ImageReveal from="right" className="arc-tr mt-12 aspect-[16/10] w-full">
                    <Img src={concept.image("image")!.url} alt={concept.image("image")!.alt} fill sizes="(min-width:1024px) 52vw, 92vw" className="object-cover" />
                  </ImageReveal>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {passion.visible && (
        <section className="on-dark grain relative overflow-hidden bg-noir py-28 md:py-40">
          <Monogram title="" aria-hidden className="pointer-events-none absolute -right-[10%] top-1/2 w-[60vw] -translate-y-1/2 text-champagne/[0.06]" />
          <div className="container-x relative">
            <Reveal y={10}>
              <p className="eyebrow">{passion.text("eyebrow")}</p>
            </Reveal>
            <blockquote className="mt-8 max-w-5xl">
              <LineReveal text={`« ${passion.text("quote")} »`} as="p" className="t-h1 italic text-ivoire" />
            </blockquote>
            <Reveal delay={0.2}>
              <div className="t-lead muted mt-10 max-w-2xl space-y-4">
                {paragraphs(passion.text("body")).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {atouts.visible && (
        <section className="bg-ivoire py-24 md:py-32">
          <div className="container-x">
            <Reveal y={10}>
              <p className="eyebrow">{atouts.text("eyebrow")}</p>
            </Reveal>
            <ul className="mt-10 grid gap-10 md:grid-cols-3">
              {atouts.list<{ title: string; text: string }>("items").map((a, i) => (
                <Reveal as="li" key={a.title} delay={i * 0.08} className="border-t border-encre/15 pt-8">
                  <h2 className="t-h2">{a.title}</h2>
                  <p className="muted mt-4">{a.text}</p>
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
      <BreadcrumbJsonLd items={[{ name: "À propos", path: "/a-propos" }]} />
    </>
  );
}
