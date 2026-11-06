import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { BreadcrumbJsonLd, OfferCatalogJsonLd } from "@/components/site/json-ld";
import { PriceMenu } from "@/components/site/price-menu";
import { PageIntro } from "@/components/sections/page-intro";
import { sectionOf } from "@/lib/content/get";
import { getPriceCatalog, getSettings } from "@/lib/data/public";
import { loadPublicPage } from "@/lib/page-guard";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("prestations");

/**
 * Prestations & tarifs, réunis sur une seule page : chaque onglet présente une catégorie et ses prix.
 * Les forfaits et formules ont leur propre page (Offres) : un renvoi remplace le doublon.
 */
export default async function PrestationsPage() {
  const page = await loadPublicPage("prestations");
  const [catalog, settings] = await Promise.all([getPriceCatalog(), getSettings()]);
  const intro = sectionOf(page, "intro");
  const notes = sectionOf(page, "notes");
  const categories = catalog.filter((c) => c.slug !== "forfaits" && c.services.length > 0);

  return (
    <>
      <PageIntro title={intro.text("title")} subtitle={intro.text("subtitle")} />
      <section className="bg-lin pb-20 pt-10 md:pb-28 md:pt-14">
        <div className="container-x">
          <PriceMenu categories={categories} />

          <div className="mt-20 grid gap-4 md:grid-cols-12">
            <Reveal className="md:col-span-7">
              <div className="h-full rounded-[1.75rem] bg-ivoire p-8 text-sm text-taupe md:p-10">
                <h2 className="font-display text-2xl text-encre">Bon à savoir</h2>
                <div className="mt-4 space-y-2">
                  {notes.text("validity") && <p>{notes.text("validity")}</p>}
                  {notes.text("supplement") && <p>{notes.text("supplement")}</p>}
                  {notes.text("extra") && <p>{notes.text("extra")}</p>}
                  <p>
                    {settings.travel.included} {settings.travel.outside}
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="md:col-span-5">
              <Link
                href="/forfaits-offres"
                className="on-dark group relative flex h-full min-h-[14rem] flex-col justify-between overflow-hidden rounded-[1.75rem] bg-noir p-8 md:p-10"
              >
                <span className="t-h3 max-w-[18rem] text-ivoire">Forfaits Beauty Color, formules modelage et parrainage</span>
                <span className="mt-8 flex items-center justify-between gap-4">
                  <span className="muted text-sm">Des tarifs privilégiés pour un rendez-vous régulier.</span>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-champagne text-noir transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:rotate-45 group-hover:scale-110">
                    <ArrowUpRight className="h-5 w-5" aria-hidden />
                  </span>
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
      <OfferCatalogJsonLd
        name="Prestations et tarifs Hair Home Concept"
        items={categories.flatMap((c) => c.services.map((s) => ({ name: `${c.label} : ${s.name}`, price: s.priceCents })))}
      />
      <BreadcrumbJsonLd items={[{ name: "Prestations & tarifs", path: "/prestations" }]} />
    </>
  );
}
