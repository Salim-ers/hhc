/**
 * MODE DÉMONSTRATION — utilisé uniquement quand DATABASE_URL n'est pas configuré.
 * Construit les mêmes structures que la base à partir des données initiales,
 * pour que le site public puisse être présenté avant la création de la base Neon.
 */
import { PAGES } from "@/lib/content/section-registry";
import {
  LONG_HAIR,
  SUPPLEMENT,
  defaultSettings,
  seedAreas,
  seedCategories,
  seedFaqs,
  seedGallery,
  seedOffers,
} from "@/lib/content/seed-data";
import type {
  PublicArea,
  PublicCategory,
  PublicFaq,
  PublicGalleryItem,
  PublicOffer,
  PublicPage,
} from "./types";

const cents = (v?: number | null) => (v == null ? null : Math.round(v * 100));

export function fallbackCatalog(): PublicCategory[] {
  return seedCategories.map((c, ci) => ({
    id: `cat-${ci}`,
    slug: c.slug,
    label: c.label,
    intro: c.intro ?? null,
    footnote: c.footnote ?? null,
    services: c.services.map((s, si) => ({
      id: `svc-${ci}-${si}`,
      section: s.section ?? null,
      name: s.name,
      description: s.description ?? null,
      durationMinutes: null,
      priceCents: cents(s.price),
      priceFrom: Boolean(s.from),
      compareAtCents: cents(s.compareAt),
      supplementLabel: s.supplement ? SUPPLEMENT.label : null,
      supplementCents: s.supplement ? cents(SUPPLEMENT.amount) : null,
      conditions: s.conditions ?? null,
      badge: s.badge ?? null,
      promoLabel: null,
      imageUrl: s.image?.url ?? null,
      imageAlt: s.image?.alt ?? null,
      variants: s.long != null ? [{ label: LONG_HAIR, priceCents: cents(s.long)! }] : [],
    })),
  }));
}

export function fallbackOffers(): PublicOffer[] {
  return seedOffers
    .filter((o) => o.status === "published")
    .map((o, i) => ({
      id: `offer-${i}`,
      slug: o.slug,
      kind: o.kind,
      title: o.title,
      subtitle: o.subtitle ?? null,
      description: o.description ?? null,
      priceCents: cents(o.price),
      compareAtCents: cents(o.compareAt),
      priceLabel: o.priceLabel ?? null,
      items: o.items,
      conditions: o.conditions ?? null,
      code: null,
      ctaLabel: o.ctaLabel ?? null,
      ctaHref: o.ctaHref ?? null,
      imageUrl: o.image?.url ?? null,
      imageAlt: o.image?.alt ?? null,
      highlight: Boolean(o.highlight),
      endsAt: null,
    }));
}

export function fallbackPage(key: string): PublicPage | null {
  const def = PAGES.find((p) => p.key === key);
  if (!def) return null;
  return {
    key: def.key,
    title: def.title,
    path: def.path,
    seoTitle: def.seoTitle,
    seoDescription: def.seoDescription,
    ogImageUrl: null,
    status: "published",
    sections: def.sections.map((s) => ({ key: s.key, visible: true, content: s.defaults })),
  };
}

export const fallbackFaqs = (): PublicFaq[] => seedFaqs.map((f, i) => ({ id: `faq-${i}`, question: f.q, answer: f.a }));

export const fallbackGallery = (): PublicGalleryItem[] =>
  seedGallery.map((g, i) => ({
    id: `g-${i}`,
    imageUrl: g.image.url,
    alt: g.image.alt,
    caption: null,
    category: g.category,
    layout: g.layout,
    isStock: true,
  }));

export const fallbackAreas = (): PublicArea[] =>
  seedAreas.map((a, i) => ({ id: `a-${i}`, name: a.name, postalCode: a.postalCode, travelIncluded: a.included, note: null }));

export const fallbackSettings = () => defaultSettings;
