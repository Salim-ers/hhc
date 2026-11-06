import type { SiteSettings } from "@/lib/content/seed-data";

export type { SiteSettings };

export type PublicVariant = { label: string; priceCents: number };

export type PublicService = {
  id: string;
  section: string | null;
  name: string;
  description: string | null;
  durationMinutes: number | null;
  priceCents: number | null;
  priceFrom: boolean;
  compareAtCents: number | null;
  supplementLabel: string | null;
  supplementCents: number | null;
  conditions: string | null;
  badge: string | null;
  /** Promotion temporaire active (dates vérifiées côté serveur). */
  promoLabel: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  variants: PublicVariant[];
};

export type PublicCategory = {
  id: string;
  slug: string;
  label: string;
  intro: string | null;
  footnote: string | null;
  services: PublicService[];
};

export type PublicExpertise = {
  id: string;
  slug: string;
  kicker: string | null;
  title: string;
  summary: string;
  highlights: string[];
  imageUrl: string | null;
  imageAlt: string | null;
  priceCategorySlug: string | null;
};

export type PublicOffer = {
  id: string;
  slug: string;
  kind: "forfait" | "formule" | "promotion" | "parrainage" | "bon_cadeau" | "banniere";
  title: string;
  subtitle: string | null;
  description: string | null;
  priceCents: number | null;
  compareAtCents: number | null;
  priceLabel: string | null;
  items: string[];
  conditions: string | null;
  code: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  highlight: boolean;
  endsAt: string | null;
};

export type PublicSection = {
  key: string;
  visible: boolean;
  content: Record<string, unknown>;
};

export type PublicPage = {
  key: string;
  title: string;
  path: string;
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string | null;
  status: "draft" | "published";
  sections: PublicSection[];
};

export type PublicFaq = { id: string; question: string; answer: string };
export type PublicGalleryItem = {
  id: string;
  imageUrl: string;
  alt: string;
  caption: string | null;
  category: string;
  layout: string;
  isStock: boolean;
};
export type PublicTestimonial = { id: string; author: string; context: string | null; quote: string; rating: number | null };
export type PublicArea = { id: string; name: string; postalCode: string | null; travelIncluded: boolean; note: string | null };
