import { notFound } from "next/navigation";
import { ImageReveal, Reveal } from "@/components/motion/reveal";
import { BreadcrumbJsonLd } from "@/components/site/json-ld";
import { PageIntro } from "@/components/sections/page-intro";
import { SectionHeading } from "@/components/sections/section-heading";
import { LinkButton } from "@/components/ui/button";
import { Img } from "@/components/ui/img";
import { sectionOf } from "@/lib/content/get";
import { getSettings } from "@/lib/data/public";
import { loadPublicPage } from "@/lib/page-guard";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("bijoux");

/** Activité complémentaire : activable / désactivable dans Paramètres → Modules. */
export default async function BijouxPage() {
  const settings = await getSettings();
  if (!settings.modules.bijoux) notFound();
  const page = await loadPublicPage("bijoux");
  const intro = sectionOf(page, "intro");
  const col = sectionOf(page, "collection");
  const reu = sectionOf(page, "reunions");
  return (
    <>
      <PageIntro title={intro.text("title")} subtitle={intro.text("subtitle")} image={intro.image("image")} />
      {col.visible && (
        <section className="bg-lin py-20 md:py-28">
          <div className="container-x">
            <SectionHeading title={col.text("title")} body={col.text("body")} className="max-w-3xl" />
            <ul className="mt-12 grid gap-4 sm:grid-cols-3 md:gap-5">
              {col.list<{ title: string; image?: { url: string; alt: string } }>("items").map((it, i) => (
                <li key={it.title}>
                  {it.image?.url && (
                    <ImageReveal delay={i * 0.08} className={i === 1 ? "arch aspect-[3/4]" : "aspect-[3/4] rounded-[2rem]"}>
                      <Img src={it.image.url} alt={it.image.alt} fill sizes="(min-width:640px) 31vw, 92vw" className="object-cover" />
                    </ImageReveal>
                  )}
                  <Reveal delay={0.1 + i * 0.08}>
                    <h3 className="t-h3 mt-5">{it.title}</h3>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {reu.visible && (
        <section className="panel on-dark grain relative overflow-hidden bg-espresso py-20 md:py-28">
          <div className="container-x grid gap-10 md:grid-cols-12 md:items-end">
            <SectionHeading title={reu.text("title")} body={reu.text("body")} className="md:col-span-8" />
            <Reveal className="flex flex-wrap gap-3 md:col-span-4 md:justify-end">
              <LinkButton href={`/contact?prestation=${encodeURIComponent("Catalogue bijoux / réunion")}`} arrow>
                Demander le catalogue
              </LinkButton>
              {settings.social.facebookBijoux && (
                <LinkButton href={settings.social.facebookBijoux} variant="light">
                  Page Facebook
                </LinkButton>
              )}
            </Reveal>
          </div>
        </section>
      )}
      <BreadcrumbJsonLd items={[{ name: "Bijoux & cadeaux", path: "/bijoux-cadeaux" }]} />
    </>
  );
}
