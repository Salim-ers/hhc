import { Reveal } from "@/components/motion/reveal";
import { BreadcrumbJsonLd } from "@/components/site/json-ld";
import { ServiceMap } from "@/components/site/service-map";
import { PageIntro } from "@/components/sections/page-intro";
import { SectionHeading } from "@/components/sections/section-heading";
import { LinkButton } from "@/components/ui/button";
import { sectionOf } from "@/lib/content/get";
import { getAreas, getSettings } from "@/lib/data/public";
import { loadPublicPage } from "@/lib/page-guard";
import { pageMetadata } from "@/lib/seo";
import { telHref } from "@/lib/utils";

export const generateMetadata = () => pageMetadata("zone");

/** Où et quand Angèle intervient. La demande de rendez-vous se fait sur la page Contact (un seul formulaire). */
export default async function ZonePage() {
  const page = await loadPublicPage("zone");
  const [settings, areas] = await Promise.all([getSettings(), getAreas()]);
  const intro = sectionOf(page, "intro");
  const dep = sectionOf(page, "deplacement");
  const included = areas.filter((a) => a.travelIncluded);
  const extra = areas.filter((a) => !a.travelIncluded);

  return (
    <>
      <PageIntro title={intro.text("title")} subtitle={intro.text("subtitle")}>
        <div className="mt-9 flex flex-wrap gap-3">
          <LinkButton href="/contact" variant="solid" arrow>
            Demander un rendez-vous
          </LinkButton>
          <LinkButton href={telHref(settings.business.phoneE164)} variant="dark">
            Appeler le {settings.business.phone}
          </LinkButton>
        </div>
      </PageIntro>

      <section className="bg-lin py-16 md:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="overflow-hidden rounded-[2rem]">
              <ServiceMap query={settings.travel.mapQuery} lat={settings.travel.lat} lng={settings.travel.lng} />
            </div>
          </Reveal>
          <div className="lg:col-span-5">
            <h2 className="t-h2">Communes desservies</h2>
            <p className="muted mt-4">{settings.travel.included}</p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {included.map((a, i) => (
                <Reveal as="li" key={a.id} delay={Math.min(i * 0.025, 0.4)} y={10}>
                  <span className="inline-flex items-baseline gap-2 rounded-full bg-ivoire px-4 py-2">
                    <span className="font-display text-lg">{a.name}</span>
                    {a.postalCode && <span className="tabular text-xs text-taupe">{a.postalCode}</span>}
                  </span>
                </Reveal>
              ))}
            </ul>
            {extra.length > 0 && (
              <>
                <h3 className="t-h3 mt-12">Avec frais de déplacement</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {extra.map((a) => (
                    <li key={a.id} className="rounded-full border border-encre/15 px-4 py-1.5 text-sm">
                      {a.name}
                      {a.note ? ` (${a.note})` : ""}
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
        <section className="panel bg-sable py-16 md:py-24">
          <div className="container-x grid gap-12 md:grid-cols-12">
            <SectionHeading title={dep.text("title")} body={dep.text("body")} className="md:col-span-6" />
            <dl className="grid gap-3 md:col-span-6">
              {[
                { t: "Hors zone", d: dep.text("outside") },
                { t: "Horaires d'intervention", d: `${settings.hours.summary}.`, note: settings.hours.calls },
                { t: "En dehors des horaires", d: dep.text("afterHours") },
              ].map((row, i) => (
                <Reveal key={row.t} delay={i * 0.08} className="rounded-[1.5rem] bg-lin p-6 md:p-8">
                  <dt className="t-h3">{row.t}</dt>
                  <dd className="muted mt-2">{row.d}</dd>
                  {row.note && <dd className="muted mt-1 text-sm">{row.note}</dd>}
                </Reveal>
              ))}
            </dl>
          </div>
        </section>
      )}

      <BreadcrumbJsonLd items={[{ name: "Zone d'intervention", path: "/zone-intervention" }]} />
    </>
  );
}
