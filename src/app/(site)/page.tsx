import { FaqJsonLd } from "@/components/site/json-ld";
import { FaqList } from "@/components/sections/faq-list";
import { Hero } from "@/components/sections/hero";
import { ExperienceSection } from "@/components/sections/home/experience";
import { ExpertiseSection } from "@/components/sections/home/expertise";
import { GalleryPreview } from "@/components/sections/home/gallery-preview";
import { SignaturesSection } from "@/components/sections/home/signatures";
import { TestimonialsSection } from "@/components/sections/home/testimonials";
import { SectionHeading } from "@/components/sections/section-heading";
import { sectionOf, sectionOrder } from "@/lib/content/get";
import { getFaqs, getGallery, getPage, getSettings, getTestimonials } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("home");

type Item = { title: string; text: string; image?: { url: string; alt: string }; href?: string };

/**
 * L'accueil donne envie et oriente, sans recopier les pages intérieures :
 * Hero → Angèle → prestations signatures → la coiffure à domicile → galerie → avis → questions.
 * L'invitation au rendez-vous est portée par le pied de page, commun à tout le site.
 */
export default async function HomePage() {
  const [page, settings, gallery, faqs, testimonials] = await Promise.all([
    getPage("home"),
    getSettings(),
    getGallery(),
    getFaqs("home"),
    getTestimonials(),
  ]);

  // Les photos déjà montrées plus haut ne reviennent pas dans le ruban de la galerie.
  const shown = new Set<string>();
  for (const key of ["hero", "expertise", "experience"]) {
    const s = sectionOf(page, key);
    const url = s.image("image")?.url;
    if (url) shown.add(url);
  }
  for (const it of sectionOf(page, "signatures").list<Item>("items")) if (it.image?.url) shown.add(it.image.url);

  const render = (key: string) => {
    const s = sectionOf(page, key);
    if (!s.visible && key !== "hero") return null;
    switch (key) {
      case "hero":
        return (
          <Hero
            key={key}
            title={s.text("title")}
            subtitle={s.text("subtitle")}
            video={s.text("video")}
            image={s.image("image")}
            ctaPrimary={s.link("ctaPrimary")}
            ctaSecondary={s.link("ctaSecondary")}
            phone={settings.business.phone}
            phoneE164={settings.business.phoneE164}
            hours={settings.hours.summary}
            travel={settings.travel.included}
          />
        );
      case "expertise":
        return <ExpertiseSection key={key} title={s.text("title")} body={s.text("body")} image={s.image("image")} cta={s.link("cta")} />;
      case "signatures":
        return <SignaturesSection key={key} title={s.text("title")} items={s.list<Item>("items")} />;
      case "experience":
        return (
          <ExperienceSection
            key={key}
            title={s.text("title")}
            body={s.text("body")}
            image={s.image("image")}
            items={s.list<{ title: string; text: string }>("items")}
          />
        );
      case "galerie":
        return <GalleryPreview key={key} title={s.text("title")} cta={s.link("cta")} items={gallery.filter((g) => !shown.has(g.imageUrl))} />;
      case "avis":
        if (!settings.modules.testimonials) return null;
        return <TestimonialsSection key={key} title={s.text("title")} body={s.text("body")} cta={s.link("cta")} items={testimonials} />;
      case "faq":
        if (!faqs.length) return null;
        return (
          <section key={key} className="bg-lin py-20 md:py-28">
            <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <SectionHeading title={s.text("title")} />
                </div>
              </div>
              <div className="lg:col-span-8">
                <FaqList faqs={faqs} />
              </div>
            </div>
            <FaqJsonLd faqs={faqs} />
          </section>
        );
      default:
        // « cta » (pied de page) et anciennes sections éventuellement présentes en base : rien ici.
        return null;
    }
  };

  // Le Hero reste toujours en tête ; les autres sections suivent l'ordre défini dans l'administration.
  const order = sectionOrder(page).filter((k) => k !== "hero");
  return (
    <>
      {render("hero")}
      {order.map(render)}
    </>
  );
}
