import { ImageReveal, Reveal } from "@/components/motion/reveal";
import { BreadcrumbJsonLd } from "@/components/site/json-ld";
import { OfferCard } from "@/components/sections/offer-card";
import { PageIntro } from "@/components/sections/page-intro";
import { SectionHeading } from "@/components/sections/section-heading";
import { LinkButton } from "@/components/ui/button";
import { Img } from "@/components/ui/img";
import { sectionOf } from "@/lib/content/get";
import { getOffers, getSettings } from "@/lib/data/public";
import { loadPublicPage } from "@/lib/page-guard";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("offres");

const GROUPS = [
  { kinds: ["forfait"], title: "Forfaits d'entretien" },
  { kinds: ["formule"], title: "Formules modelage" },
  { kinds: ["parrainage", "promotion"], title: "Avantages & parrainage" },
] as const;

export default async function OffresPage() {
  const page = await loadPublicPage("offres");
  const [offers, settings] = await Promise.all([getOffers(), getSettings()]);
  const intro = sectionOf(page, "intro");
  const gift = sectionOf(page, "cadeau");
  const giftOffer = offers.find((o) => o.kind === "bon_cadeau");
  const temporary = offers.filter((o) => o.kind === "banniere");

  return (
    <>
      <PageIntro title={intro.text("title")} subtitle={intro.text("subtitle")} image={intro.image("image")} />

      {temporary.length > 0 && (
        <section className="panel bg-champagne py-12 text-noir md:py-14">
          <div className="container-x grid gap-6 md:grid-cols-12 md:items-center">
            {temporary.map((t) => (
              <div key={t.id} className="md:col-span-12 md:flex md:items-center md:justify-between md:gap-10">
                <div>
                  <p className="w-fit rounded-full bg-noir/10 px-3 py-1 text-sm">Offre du moment</p>
                  <h2 className="t-h2 mt-1">{t.title}</h2>
                  {t.description && <p className="mt-3 max-w-2xl">{t.description}</p>}
                  {t.endsAt && <p className="mt-2 text-sm">Jusqu&apos;au {new Date(t.endsAt).toLocaleDateString("fr-FR", { dateStyle: "long" })}</p>}
                </div>
                <LinkButton href={t.ctaHref || "/contact"} variant="solid" arrow className="mt-6 shrink-0 md:mt-0">
                  {t.ctaLabel || "En profiter"}
                </LinkButton>
              </div>
            ))}
          </div>
        </section>
      )}

      {GROUPS.map((g, gi) => {
        const items = offers.filter((o) => (g.kinds as readonly string[]).includes(o.kind));
        if (!items.length) return null;
        const dark = gi === 1;
        return (
          <section key={g.title} className={dark ? "panel on-dark grain relative overflow-hidden bg-noir py-20 md:py-28" : "bg-lin py-20 md:py-28"}>
            <div className="container-x">
              <SectionHeading title={g.title} />
              <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((o, i) => (
                  <Reveal as="li" key={o.id} delay={(i % 3) * 0.08}>
                    <OfferCard offer={o} tone={dark ? "dark" : "light"} />
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      {gift.visible && (
        <section id="bon-cadeau" className="panel bg-ivoire py-20 md:py-28">
          <div className="container-x grid items-center gap-14 md:grid-cols-12">
            <div className="md:col-span-5">
              {gift.image("image") && (
                <ImageReveal className="arch mx-auto aspect-[3/4] w-full max-w-[26rem]">
                  <Img src={gift.image("image")!.url} alt={gift.image("image")!.alt} fill sizes="(min-width:768px) 40vw, 92vw" className="object-cover" />
                </ImageReveal>
              )}
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <SectionHeading title={gift.text("title")} body={gift.text("body")} />
              <Reveal delay={0.2} className="mt-10 flex flex-wrap gap-3">
                <LinkButton href={`/contact?prestation=${encodeURIComponent("Bon cadeau")}`} variant="solid" arrow>
                  {giftOffer?.ctaLabel || "Demander un bon cadeau"}
                </LinkButton>
                {settings.modules.bijoux && (
                  <LinkButton href="/bijoux-cadeaux" variant="dark">
                    Les bijoux
                  </LinkButton>
                )}
              </Reveal>
            </div>
          </div>
        </section>
      )}
      <BreadcrumbJsonLd items={[{ name: "Forfaits & offres", path: "/forfaits-offres" }]} />
    </>
  );
}
