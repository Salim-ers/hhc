import { FaqJsonLd } from "@/components/site/json-ld";
import { CtaBand } from "@/components/sections/cta-band";
import { FaqList } from "@/components/sections/faq-list";
import { Hero } from "@/components/sections/hero";
import { ColoristeSection } from "@/components/sections/home/coloriste";
import { ExperienceSection } from "@/components/sections/home/experience";
import { ExpertiseSection } from "@/components/sections/home/expertise";
import { GalleryPreview } from "@/components/sections/home/gallery-preview";
import { SignaturesSection } from "@/components/sections/home/signatures";
import { TestimonialsSection } from "@/components/sections/home/testimonials";
import { OfferCard } from "@/components/sections/offer-card";
import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { LinkButton } from "@/components/ui/button";
import { sectionOf, sectionOrder } from "@/lib/content/get";
import { getFaqs, getGallery, getOffers, getPage, getSettings, getTestimonials } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("home");

export default async function HomePage() {
  const [page, settings, offers, gallery, faqs, testimonials] = await Promise.all([
    getPage("home"),
    getSettings(),
    getOffers(),
    getGallery(),
    getFaqs("home"),
    getTestimonials(),
  ]);

  const featured = offers.filter((o) => o.highlight && o.kind !== "banniere").slice(0, 3);

  const render = (key: string) => {
    const s = sectionOf(page, key);
    if (!s.visible && key !== "hero") return null;
    switch (key) {
      case "hero":
        return (
          <Hero
            key={key}
            eyebrow={s.text("eyebrow")}
            title={s.text("title")}
            subtitle={s.text("subtitle")}
            image={s.image("image")}
            ctaPrimary={s.link("ctaPrimary")}
            ctaSecondary={s.link("ctaSecondary")}
          />
        );
      case "expertise":
        return (
          <ExpertiseSection
            key={key}
            eyebrow={s.text("eyebrow")}
            title={s.text("title")}
            body={s.text("body")}
            image={s.image("image")}
            pillars={s.list<{ title: string; text: string }>("pillars")}
            cta={s.link("cta")}
          />
        );
      case "signatures":
        return <SignaturesSection key={key} eyebrow={s.text("eyebrow")} title={s.text("title")} items={s.list("items")} />;
      case "experience":
        return (
          <ExperienceSection
            key={key}
            eyebrow={s.text("eyebrow")}
            title={s.text("title")}
            body={s.text("body")}
            image={s.image("image")}
            items={s.list<{ title: string; text: string }>("items")}
          />
        );
      case "coloriste":
        return (
          <ColoristeSection key={key} eyebrow={s.text("eyebrow")} title={s.text("title")} body={s.text("body")} image={s.image("image")} cta={s.link("cta")} />
        );
      case "offres":
        if (!featured.length) return null;
        return (
          <section key={key} className="bg-lin py-24 md:py-36">
            <div className="container-x">
              <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
                <SectionHeading eyebrow={s.text("eyebrow")} title={s.text("title")} body={s.text("body")} />
                {s.link("cta") && (
                  <LinkButton href={s.link("cta")!.href} variant="dark" className="shrink-0">
                    {s.link("cta")!.label}
                  </LinkButton>
                )}
              </div>
              <ul className="mt-16 grid gap-5 md:grid-cols-3">
                {featured.map((o, i) => (
                  <Reveal as="li" key={o.id} delay={i * 0.1}>
                    <OfferCard offer={o} tone={i === 1 ? "dark" : "light"} />
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>
        );
      case "galerie":
        return <GalleryPreview key={key} eyebrow={s.text("eyebrow")} title={s.text("title")} cta={s.link("cta")} items={gallery} />;
      case "avis":
        if (!settings.modules.testimonials) return null;
        return (
          <TestimonialsSection key={key} eyebrow={s.text("eyebrow")} title={s.text("title")} body={s.text("body")} cta={s.link("cta")} items={testimonials} />
        );
      case "faq":
        if (!faqs.length) return null;
        return (
          <section key={key} className="bg-lin py-24 md:py-32">
            <div className="container-x grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-32">
                  <SectionHeading eyebrow={s.text("eyebrow")} title={s.text("title")} />
                </div>
              </div>
              <div className="lg:col-span-8">
                <FaqList faqs={faqs} />
              </div>
            </div>
            <FaqJsonLd faqs={faqs} />
          </section>
        );
      case "cta":
        return (
          <CtaBand
            key={key}
            eyebrow={s.text("eyebrow")}
            title={s.text("title")}
            body={s.text("body")}
            image={s.image("image")}
            phone={settings.business.phone}
            phoneE164={settings.business.phoneE164}
          />
        );
      default:
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
