import type { PublicFaq, SiteSettings } from "@/lib/data/types";
import { siteUrl } from "@/lib/utils";

function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/**
 * Données structurées : activité de coiffure SANS accueil physique (service à domicile).
 * Pas d'adresse de rue publiée : seules la commune de rattachement et la zone desservie (areaServed).
 */
export function BusinessJsonLd({ settings, areas }: { settings: SiteSettings; areas: string[] }) {
  const b = settings.business;
  const data = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "@id": siteUrl("/#entreprise"),
    name: b.name,
    slogan: b.tagline,
    description: settings.seo.defaultDescription,
    url: siteUrl("/"),
    telephone: b.phoneE164,
    email: b.email,
    image: siteUrl("/brand/icon-512.png"),
    logo: siteUrl("/brand/icon-512.png"),
    priceRange: "6 € – 85 €",
    currenciesAccepted: "EUR",
    address: { "@type": "PostalAddress", addressLocality: b.city, postalCode: b.postalCode, addressRegion: b.region, addressCountry: "FR" },
    areaServed: areas.map((name) => ({ "@type": "City", name })),
    geo: { "@type": "GeoCoordinates", latitude: settings.travel.lat, longitude: settings.travel.lng },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: settings.hours.days, opens: settings.hours.opens, closes: settings.hours.closes },
    ],
    founder: { "@type": "Person", name: b.ownerName, jobTitle: b.ownerTitle },
    knowsAbout: ["Coupe de cheveux", "Coloration", "Balayage", "Mèches", "Visagisme", "Coiffure de cérémonie"],
    sameAs: [settings.social.facebook, settings.social.instagram].filter(Boolean),
  };
  return <JsonLd data={data} />;
}

export function FaqJsonLd({ faqs }: { faqs: PublicFaq[] }) {
  if (!faqs.length) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [{ name: "Accueil", path: "/" }, ...items].map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          item: siteUrl(it.path),
        })),
      }}
    />
  );
}

export function OfferCatalogJsonLd({ name, items }: { name: string; items: { name: string; price: number | null }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "OfferCatalog",
        name,
        provider: { "@id": siteUrl("/#entreprise") },
        itemListElement: items
          .filter((i) => i.price != null)
          .map((i) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: i.name },
            price: (i.price! / 100).toFixed(2),
            priceCurrency: "EUR",
          })),
      }}
    />
  );
}
