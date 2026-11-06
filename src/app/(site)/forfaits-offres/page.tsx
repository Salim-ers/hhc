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
  { kinds: ["forfait"], title: "Forfaits", eyebrow: "Entretien & fidélité" },
  { kinds: ["formule"], title: "Formules modelage", eyebrow: "Votre brushing, en toute liberté" },
  { kinds: ["parrainage", "promotion"], title: "Avantages & parrainage", eyebrow: "Partager, c'est gagner" },
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
      <PageIntro eyebrow={intro.text("eyebrow")} title={intro.text("title")} subtitle={intro.text("subtitle")} image={intro.image("image")} />

      {temporary.length > 0 && (
        <section className="bg-champagne py-14 text-noir">
          <div className="container-x grid gap-6 md:grid-cols-12 md:items-center">
            {temporary.map((t) => (
              <div key={t.id} className="md:col-span-12 md:flex md:items-center md:justify-between md:gap-10">
                <div>
                  <p className="font-display text-lg italic">Offre du moment</p>
                  <h2 className="t-h2 mt-1">{t.title}</h2>
                  {t.description && <p className="mt-3 max-w-2xl">{t.description}</p>}
                  {t.endsAt && <p className="mt-2 text-sm">Jusqu&apos;au {new Date(t.endsAt).toLocaleDateString("fr-FR", { dateStyle: "long" })}</p>}
                </div>
                <LinkButton href={t.ctaHref || "/contact"} variant="solid" className="mt-6 shrink-0 md:mt-0">
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
          <section key={g.title} className={dark ? "on-dark bg-noir py-24 md:py-32" : "bg-lin py-24 md:py-32"}>
            <div className="container-x">
              <SectionHeading eyebrow={g.eyebrow} title={g.title} />
              <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
        <section id="bon-cadeau" className="bg-ivoire py-24 md:py-32">
          <div className="container-x grid items-center gap-14 md:grid-cols-12">
            <div className="md:col-span-5">
              {gift.image("image") && (
                <ImageReveal className="arc-tl aspect-[4/5] w-full">
                  <Img src={gift.image("image")!.url} alt={gift.image("image")!.alt} fill sizes="(min-width:768px) 40vw, 92vw" className="object-cover" />
                </ImageReveal>
              )}
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <SectionHeading eyebrow={gift.text("eyebrow")} title={gift.text("title")} body={gift.text("body")} />
              <Reveal delay={0.2} className="mt-10 flex flex-wrap gap-3">
                <LinkButton href={`/contact?prestation=${encodeURIComponent("Bon cadeau")}`} variant="solid">
                  {giftOffer?.ctaLabel || "Demander un bon cadeau"}
                </LinkButton>
                {settings.modules.bijoux && (
                  <LinkButton href="/bijoux-cadeaux" variant="dark">
                    Découvrir les bijoux
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
