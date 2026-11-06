import { Reveal } from "@/components/motion/reveal";
import { BreadcrumbJsonLd, OfferCatalogJsonLd } from "@/components/site/json-ld";
import { PriceMenu } from "@/components/site/price-menu";
import { PageIntro } from "@/components/sections/page-intro";
import { LinkButton } from "@/components/ui/button";
import { sectionOf } from "@/lib/content/get";
import { getOffers, getPriceCatalog, getSettings } from "@/lib/data/public";
import { loadPublicPage } from "@/lib/page-guard";
import { pageMetadata } from "@/lib/seo";
import { telHref } from "@/lib/utils";

export const generateMetadata = () => pageMetadata("tarifs");

export default async function TarifsPage() {
  const page = await loadPublicPage("tarifs");
  const [catalog, offers, settings] = await Promise.all([getPriceCatalog(), getOffers(), getSettings()]);
  const intro = sectionOf(page, "intro");
  const notes = sectionOf(page, "notes");
  const forfaits = offers.filter((o) => o.kind === "forfait" || o.kind === "formule");
  const categories = catalog.filter((c) => c.services.length > 0 || (c.slug === "forfaits" && forfaits.length > 0));

  return (
    <>
      <PageIntro eyebrow={intro.text("eyebrow")} title={intro.text("title")} subtitle={intro.text("subtitle")} compact />
      <section className="bg-lin pb-24 md:pb-32">
        <div className="container-x">
          <PriceMenu categories={categories} forfaits={forfaits} />

          <Reveal className="mt-24 grid gap-10 border-t border-encre/15 pt-12 md:grid-cols-12">
            <div className="space-y-2 text-sm text-taupe md:col-span-7">
              {notes.text("validity") && <p>{notes.text("validity")}</p>}
              {notes.text("supplement") && <p>{notes.text("supplement")}</p>}
              {notes.text("extra") && <p>{notes.text("extra")}</p>}
              <p>{settings.travel.included} {settings.travel.outside}</p>
            </div>
            <div className="flex flex-wrap gap-3 md:col-span-5 md:justify-end">
              <LinkButton href="/contact" variant="solid">
                Demander un rendez-vous
              </LinkButton>
              <LinkButton href={telHref(settings.business.phoneE164)} variant="dark">
                {settings.business.phone}
              </LinkButton>
            </div>
          </Reveal>
        </div>
      </section>
      <OfferCatalogJsonLd
        name="Tarifs Hair Home Concept"
        items={catalog.flatMap((c) => c.services.map((s) => ({ name: `${c.label} — ${s.name}`, price: s.priceCents })))}
      />
      <BreadcrumbJsonLd items={[{ name: "Tarifs", path: "/tarifs" }]} />
    </>
  );
}
