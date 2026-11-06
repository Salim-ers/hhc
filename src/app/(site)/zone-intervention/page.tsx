import { Reveal } from "@/components/motion/reveal";
import { BreadcrumbJsonLd } from "@/components/site/json-ld";
import { RequestForm } from "@/components/site/request-form";
import { ServiceMap } from "@/components/site/service-map";
import { PageIntro } from "@/components/sections/page-intro";
import { SectionHeading } from "@/components/sections/section-heading";
import { LinkButton } from "@/components/ui/button";
import { sectionOf } from "@/lib/content/get";
import { getAreas, getServiceChoices, getSettings } from "@/lib/data/public";
import { loadPublicPage } from "@/lib/page-guard";
import { pageMetadata } from "@/lib/seo";
import { telHref } from "@/lib/utils";

export const generateMetadata = () => pageMetadata("zone");

export default async function ZonePage() {
  const page = await loadPublicPage("zone");
  const [settings, areas] = await Promise.all([getSettings(), getAreas()]);
  const intro = sectionOf(page, "intro");
  const dep = sectionOf(page, "deplacement");
  const included = areas.filter((a) => a.travelIncluded);
  const extra = areas.filter((a) => !a.travelIncluded);

  return (
    <>
      <PageIntro eyebrow={intro.text("eyebrow")} title={intro.text("title")} subtitle={intro.text("subtitle")} compact>
        <div className="mt-10 flex flex-wrap gap-3">
          <LinkButton href={telHref(settings.business.phoneE164)}>Appeler le {settings.business.phone}</LinkButton>
          <LinkButton href="#demande" variant="light">
            Demander une prestation
          </LinkButton>
        </div>
      </PageIntro>

      <section className="bg-lin py-20 md:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <ServiceMap query={settings.travel.mapQuery} lat={settings.travel.lat} lng={settings.travel.lng} />
          </Reveal>
          <div className="lg:col-span-5">
            <h2 className="t-h2">Communes desservies</h2>
            <p className="muted mt-4">{settings.travel.included}</p>
            <ul className="mt-8 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              {included.map((a) => (
                <li key={a.id} className="flex items-baseline justify-between gap-3 border-b border-encre/10 py-3">
                  <span className="font-display text-lg">{a.name}</span>
                  {a.postalCode && <span className="tabular text-sm text-taupe">{a.postalCode}</span>}
                </li>
              ))}
            </ul>
            {extra.length > 0 && (
              <>
                <h3 className="t-h3 mt-12">Avec frais de déplacement</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {extra.map((a) => (
                    <li key={a.id} className="border border-encre/15 px-3 py-1.5 text-sm">
                      {a.name}
                      {a.note ? ` — ${a.note}` : ""}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="muted mt-8 text-sm">Votre commune n&apos;apparaît pas ? Contactez Angèle : un déplacement est souvent possible.</p>
          </div>
        </div>
      </section>

      {dep.visible && (
        <section className="bg-ivoire py-20 md:py-28">
          <div className="container-x grid gap-12 md:grid-cols-12">
            <SectionHeading eyebrow={dep.text("eyebrow")} title={dep.text("title")} body={dep.text("body")} className="md:col-span-6" />
            <dl className="space-y-8 md:col-span-5 md:col-start-8 md:pt-12">
              <div className="border-t border-encre/15 pt-6">
                <dt className="t-h3">Hors zone</dt>
                <dd className="muted mt-2">{dep.text("outside")}</dd>
              </div>
              <div className="border-t border-encre/15 pt-6">
                <dt className="t-h3">Horaires d&apos;intervention</dt>
                <dd className="muted mt-2">{settings.hours.summary}.</dd>
                <dd className="muted mt-1 text-sm">{settings.hours.calls}</dd>
              </div>
              <div className="border-t border-encre/15 pt-6">
                <dt className="t-h3">En dehors des horaires</dt>
                <dd className="muted mt-2">{dep.text("afterHours")}</dd>
              </div>
            </dl>
          </div>
        </section>
      )}

      <section id="demande" className="on-dark scroll-mt-24 bg-noir py-24 md:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <SectionHeading eyebrow="Demande de prestation" title="Où et quand souhaitez-vous être coiffé·e ?" className="lg:col-span-4" />
          <div className="lg:col-span-7 lg:col-start-6">
            <RequestForm
              tone="dark"
              services={getServiceChoices()}
              communes={areas.map((a) => a.name)}
              phone={settings.business.phone}
              phoneE164={settings.business.phoneE164}
              source="zone-intervention"
            />
          </div>
        </div>
      </section>
      <BreadcrumbJsonLd items={[{ name: "Zone d'intervention", path: "/zone-intervention" }]} />
    </>
  );
}
