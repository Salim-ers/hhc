import { Mail, MessageCircle, Phone } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { BreadcrumbJsonLd } from "@/components/site/json-ld";
import { RequestForm } from "@/components/site/request-form";
import { PageIntro } from "@/components/sections/page-intro";
import { sectionOf } from "@/lib/content/get";
import { getAreas, getServiceChoices, getSettings } from "@/lib/data/public";
import { loadPublicPage } from "@/lib/page-guard";
import { pageMetadata } from "@/lib/seo";
import { telHref } from "@/lib/utils";

export const generateMetadata = () => pageMetadata("contact");

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ prestation?: string }> }) {
  const page = await loadPublicPage("contact");
  const [settings, areas, sp] = await Promise.all([getSettings(), getAreas(), searchParams]);
  const intro = sectionOf(page, "intro");
  const voice = sectionOf(page, "messagerie");
  const b = settings.business;
  const prefill = sp.prestation?.slice(0, 120);

  return (
    <>
      <PageIntro eyebrow={intro.text("eyebrow")} title={intro.text("title")} subtitle={intro.text("subtitle")} image={intro.image("image")} />
      <section className="bg-lin py-20 md:py-28">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <aside className="space-y-10 lg:col-span-4">
            <Reveal>
              <h2 className="t-h3">Directement</h2>
              <ul className="mt-6 space-y-3">
                <li>
                  <a href={telHref(b.phoneE164)} className="group flex items-center gap-4 border border-encre/15 p-5 transition-colors hover:border-or-profond/50">
                    <Phone className="h-5 w-5 text-or-profond" aria-hidden />
                    <span>
                      <span className="block font-display text-2xl">{b.phone}</span>
                      <span className="text-sm text-taupe">{settings.hours.calls}</span>
                    </span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${b.email}`} className="flex items-center gap-4 border border-encre/15 p-5 transition-colors hover:border-or-profond/50">
                    <Mail className="h-5 w-5 text-or-profond" aria-hidden />
                    <span className="break-all">{b.email}</span>
                  </a>
                </li>
                {b.whatsappEnabled && b.whatsappNumber && (
                  <li>
                    <a
                      href={`https://wa.me/${b.whatsappNumber.replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 border border-encre/15 p-5 transition-colors hover:border-or-profond/50"
                    >
                      <MessageCircle className="h-5 w-5 text-or-profond" aria-hidden />
                      WhatsApp
                    </a>
                  </li>
                )}
              </ul>
            </Reveal>
            {voice.visible && (
              <Reveal delay={0.1} className="border-t border-encre/15 pt-8">
                <h2 className="t-h3">{voice.text("title")}</h2>
                <p className="muted mt-3">{voice.text("body")}</p>
              </Reveal>
            )}
            <Reveal delay={0.15} className="border-t border-encre/15 pt-8">
              <h2 className="t-h3">Horaires & déplacement</h2>
              <p className="muted mt-3">{settings.hours.summary}.</p>
              <p className="muted mt-2">{settings.travel.included}</p>
              <p className="muted mt-2 text-sm">{settings.hours.extra}</p>
            </Reveal>
          </aside>
          <div className="lg:col-span-7 lg:col-start-6">
            <h2 className="t-h2">Demande de rendez-vous</h2>
            <p className="muted mt-4 max-w-xl">
              Ce formulaire envoie une demande : elle n&apos;est pas une réservation automatique. Angèle vous recontacte pour confirmer.
            </p>
            <div className="mt-12">
              <RequestForm
                services={getServiceChoices()}
                communes={areas.map((a) => a.name)}
                defaultService={prefill}
                phone={b.phone}
                phoneE164={b.phoneE164}
                source="contact"
              />
            </div>
          </div>
        </div>
      </section>
      <BreadcrumbJsonLd items={[{ name: "Contact", path: "/contact" }]} />
    </>
  );
}
