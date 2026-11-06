import { ImageReveal, Parallax, Reveal } from "@/components/motion/reveal";
import { BreadcrumbJsonLd } from "@/components/site/json-ld";
import { PageIntro } from "@/components/sections/page-intro";
import { SectionHeading } from "@/components/sections/section-heading";
import { LinkButton } from "@/components/ui/button";
import { Img } from "@/components/ui/img";
import { sectionOf } from "@/lib/content/get";
import { loadPublicPage } from "@/lib/page-guard";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("coloriste-visagiste");

export default async function ColoristePage() {
  const page = await loadPublicPage("coloriste-visagiste");
  const intro = sectionOf(page, "intro");
  const diag = sectionOf(page, "diagnostic");
  const tech = sectionOf(page, "techniques");
  const harm = sectionOf(page, "harmonie");
  const visa = sectionOf(page, "visagisme");

  return (
    <>
      <PageIntro title={intro.text("title")} subtitle={intro.text("subtitle")} image={intro.image("image")} />

      {diag.visible && (
        <section className="bg-lin py-20 md:py-28">
          <div className="container-x grid items-center gap-12 md:grid-cols-12">
            <div className="md:col-span-5 md:col-start-2">
              {diag.image("image") && (
                <ImageReveal className="aspect-square w-full rounded-[2rem]">
                  <Img src={diag.image("image")!.url} alt={diag.image("image")!.alt} fill sizes="(min-width:768px) 40vw, 92vw" className="object-cover" />
                </ImageReveal>
              )}
            </div>
            <SectionHeading title={diag.text("title")} body={diag.text("body")} className="md:col-span-5 md:col-start-8" />
          </div>
        </section>
      )}

      {tech.visible && (
        <section className="panel on-dark grain relative overflow-hidden bg-noir py-20 md:py-28">
          <div className="container-x">
            <SectionHeading title={tech.text("title")} body={tech.text("body")} className="max-w-3xl" />
            <ul className="mt-12 grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
              {tech.list<{ title: string; text: string }>("items").map((t, i) => (
                <Reveal
                  as="li"
                  key={t.title}
                  delay={(i % 3) * 0.07}
                  className="rounded-[1.5rem] bg-ivoire/[0.05] p-7 ring-1 ring-inset ring-ivoire/10 transition-colors duration-500 hover:bg-ivoire/[0.09] md:p-9"
                >
                  <h3 className="t-h3 text-ivoire">{t.title}</h3>
                  <p className="muted mt-3">{t.text}</p>
                </Reveal>
              ))}
            </ul>
            <Reveal className="mt-10 flex flex-wrap gap-3">
              <LinkButton href="/prestations#coloration" variant="light" arrow>
                Tarifs coloration
              </LinkButton>
              <LinkButton href="/prestations#balayage-meches" variant="light" arrow>
                Tarifs balayage & mèches
              </LinkButton>
            </Reveal>
          </div>
        </section>
      )}

      {harm.visible && (
        <section className="panel on-dark relative isolate overflow-hidden bg-espresso">
          {harm.image("image") && (
            <Parallax className="absolute inset-0 -z-10" strength={80}>
              <Img src={harm.image("image")!.url} alt={harm.image("image")!.alt} fill sizes="100vw" className="object-cover" />
            </Parallax>
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-espresso via-espresso/55 to-transparent lg:bg-gradient-to-r" />
          <div className="container-x flex min-h-[80svh] items-end py-20 md:py-24">
            <div className="max-w-2xl">
              <SectionHeading title={harm.text("title")} body={harm.text("body")} />
              <Reveal delay={0.2} className="mt-9">
                <LinkButton href="/forfaits-offres" arrow>
                  Le forfait Beauty Color
                </LinkButton>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {visa.visible && (
        <section className="bg-lin py-20 md:py-28">
          <div className="container-x grid items-center gap-12 md:grid-cols-12">
            <SectionHeading title={visa.text("title")} body={visa.text("body")} className="md:col-span-6" />
            <div className="md:col-span-5 md:col-start-8">
              {visa.image("image") && (
                <ImageReveal from="right" className="arch mx-auto aspect-[3/4] w-full max-w-[26rem]">
                  <Img src={visa.image("image")!.url} alt={visa.image("image")!.alt} fill sizes="(min-width:768px) 40vw, 92vw" className="object-cover" />
                </ImageReveal>
              )}
            </div>
          </div>
        </section>
      )}

      <BreadcrumbJsonLd items={[{ name: "Coloriste & visagiste", path: "/coloriste-visagiste" }]} />
    </>
  );
}
