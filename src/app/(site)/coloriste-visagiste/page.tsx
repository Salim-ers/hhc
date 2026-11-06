import Link from "next/link";
import { ImageReveal, Parallax, Reveal } from "@/components/motion/reveal";
import { BreadcrumbJsonLd } from "@/components/site/json-ld";
import { CtaBand } from "@/components/sections/cta-band";
import { PageIntro } from "@/components/sections/page-intro";
import { SectionHeading } from "@/components/sections/section-heading";
import { Img } from "@/components/ui/img";
import { sectionOf } from "@/lib/content/get";
import { getPage, getSettings } from "@/lib/data/public";
import { loadPublicPage } from "@/lib/page-guard";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("coloriste-visagiste");

export default async function ColoristePage() {
  const page = await loadPublicPage("coloriste-visagiste");
  const [settings, home] = await Promise.all([getSettings(), getPage("home")]);
  const intro = sectionOf(page, "intro");
  const diag = sectionOf(page, "diagnostic");
  const tech = sectionOf(page, "techniques");
  const harm = sectionOf(page, "harmonie");
  const visa = sectionOf(page, "visagisme");
  const cta = sectionOf(home, "cta");

  return (
    <>
      <PageIntro eyebrow={intro.text("eyebrow")} title={intro.text("title")} subtitle={intro.text("subtitle")} image={intro.image("image")} />

      {diag.visible && (
        <section className="bg-lin py-24 md:py-36">
          <div className="container-x grid items-center gap-14 md:grid-cols-12">
            <div className="md:col-span-5 md:col-start-2">
              {diag.image("image") && (
                <ImageReveal className="arc-tl aspect-square w-full">
                  <Img src={diag.image("image")!.url} alt={diag.image("image")!.alt} fill sizes="(min-width:768px) 40vw, 92vw" className="object-cover" />
                </ImageReveal>
              )}
            </div>
            <SectionHeading eyebrow={diag.text("eyebrow")} title={diag.text("title")} body={diag.text("body")} className="md:col-span-5 md:col-start-8" />
          </div>
        </section>
      )}

      {tech.visible && (
        <section className="on-dark grain relative bg-noir py-24 md:py-36">
          <div className="container-x">
            <SectionHeading eyebrow={tech.text("eyebrow")} title={tech.text("title")} body={tech.text("body")} className="max-w-3xl" />
            <ul className="mt-16 grid gap-px bg-ivoire/10 sm:grid-cols-2 lg:grid-cols-3">
              {tech.list<{ title: string; text: string }>("items").map((t, i) => (
                <Reveal as="li" key={t.title} delay={(i % 3) * 0.07} className="bg-noir p-8 md:p-10">
                  <h3 className="t-h3 text-ivoire">{t.title}</h3>
                  <p className="muted mt-4">{t.text}</p>
                </Reveal>
              ))}
            </ul>
            <div className="mt-12 flex flex-wrap gap-x-10 gap-y-3">
              <Link href="/tarifs#coloration" className="link-underline font-display text-xl italic text-champagne">
                Tarifs coloration
              </Link>
              <Link href="/tarifs#balayage-meches" className="link-underline font-display text-xl italic text-champagne">
                Tarifs balayage & mèches
              </Link>
              <Link href="/forfaits-offres" className="link-underline font-display text-xl italic text-champagne">
                Le forfait Beauty Color
              </Link>
            </div>
          </div>
        </section>
      )}

      {harm.visible && (
        <section className="on-dark relative isolate overflow-hidden bg-espresso">
          <div className="grid min-h-[90svh] items-end lg:grid-cols-12">
            {harm.image("image") && (
              <Parallax className="absolute inset-0 -z-10" strength={80}>
                <Img src={harm.image("image")!.url} alt={harm.image("image")!.alt} fill sizes="100vw" className="object-cover" />
              </Parallax>
            )}
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-espresso via-espresso/50 to-transparent lg:bg-gradient-to-r" />
            <div className="container-x py-24 lg:col-span-12">
              <SectionHeading eyebrow={harm.text("eyebrow")} title={harm.text("title")} body={harm.text("body")} className="max-w-2xl" />
            </div>
          </div>
        </section>
      )}

      {visa.visible && (
        <section className="bg-ivoire py-24 md:py-36">
          <div className="container-x grid items-center gap-14 md:grid-cols-12">
            <SectionHeading eyebrow={visa.text("eyebrow")} title={visa.text("title")} body={visa.text("body")} className="md:col-span-6" />
            <div className="md:col-span-5 md:col-start-8">
              {visa.image("image") && (
                <ImageReveal from="right" className="arc-tr aspect-[4/5] w-full">
                  <Img src={visa.image("image")!.url} alt={visa.image("image")!.alt} fill sizes="(min-width:768px) 40vw, 92vw" className="object-cover" />
                </ImageReveal>
              )}
            </div>
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
      <BreadcrumbJsonLd items={[{ name: "Coloriste & visagiste", path: "/coloriste-visagiste" }]} />
    </>
  );
}
