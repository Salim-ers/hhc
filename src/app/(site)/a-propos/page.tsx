import { Monogram } from "@/components/brand/monogram";
import { ImageReveal, Reveal, TextReveal } from "@/components/motion/reveal";
import { BreadcrumbJsonLd } from "@/components/site/json-ld";
import { PageIntro } from "@/components/sections/page-intro";
import { SectionHeading } from "@/components/sections/section-heading";
import { Img } from "@/components/ui/img";
import { sectionOf } from "@/lib/content/get";
import { loadPublicPage } from "@/lib/page-guard";
import { pageMetadata } from "@/lib/seo";
import { paragraphs } from "@/lib/utils";

export const generateMetadata = () => pageMetadata("a-propos");

export default async function AProposPage() {
  const page = await loadPublicPage("a-propos");
  const intro = sectionOf(page, "intro");
  const portrait = sectionOf(page, "portrait");
  const parcours = sectionOf(page, "parcours");
  const concept = sectionOf(page, "concept");
  const passion = sectionOf(page, "passion");
  const photo = portrait.image("image");

  return (
    <>
      <PageIntro title={intro.text("title")} subtitle={intro.text("subtitle")} />

      <section className="bg-lin py-20 md:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-20">
          {portrait.visible && (
            <figure className="lg:col-span-5">
              <div className="mx-auto max-w-[26rem] lg:sticky lg:top-28 lg:max-w-none">
                {photo ? (
                  <ImageReveal className="arch aspect-[3/4] w-full">
                    <Img src={photo.url} alt={photo.alt || "Portrait d'Angèle"} fill sizes="(min-width:1024px) 38vw, 92vw" className="object-cover" />
                  </ImageReveal>
                ) : (
                  // Emplacement réservé au vrai portrait d'Angèle (à importer depuis l'administration).
                  <div className="arch grain relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden bg-espresso">
                    <Monogram title="" aria-hidden className="w-1/2 text-champagne/80" />
                  </div>
                )}
                {portrait.text("caption") && <figcaption className="muted mt-4 text-center font-display text-lg">{portrait.text("caption")}</figcaption>}
              </div>
            </figure>
          )}
          <div className="lg:col-span-7">
            {parcours.visible && <SectionHeading title={parcours.text("title")} body={parcours.text("body")} />}
            {concept.visible && (
              <div className="mt-20">
                <SectionHeading title={concept.text("title")} body={concept.text("body")} />
                {concept.image("image") && (
                  <ImageReveal from="right" className="mt-10 aspect-[16/10] w-full rounded-[2rem]">
                    <Img src={concept.image("image")!.url} alt={concept.image("image")!.alt} fill sizes="(min-width:1024px) 52vw, 92vw" className="object-cover" />
                  </ImageReveal>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {passion.visible && (
        <section className="panel on-dark grain relative overflow-hidden bg-noir py-24 md:py-36">
          <div className="container-x relative">
            <blockquote className="max-w-5xl">
              <TextReveal text={`« ${passion.text("quote")} »`} as="p" stagger={0.06} className="t-h1 text-ivoire" />
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

      <BreadcrumbJsonLd items={[{ name: "À propos", path: "/a-propos" }]} />
    </>
  );
}
