import "server-only";
import { and, asc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { getDb, getPublicDb, hasDatabase, schema } from "@/lib/db";
import { PAGES, getPageDef } from "@/lib/content/section-registry";
import { defaultSettings } from "@/lib/content/seed-data";
import * as fb from "./fallback";
import type {
  PublicArea,
  PublicCategory,
  PublicFaq,
  PublicGalleryItem,
  PublicOffer,
  PublicPage,
  PublicTestimonial,
  SiteSettings,
} from "./types";

/** Toutes les données publiques partagent ce tag : chaque publication l'invalide. */
export const SITE_TAG = "site-content";
const cache = <T,>(fn: () => Promise<T>, key: string) =>
  unstable_cache(fn, [key], { tags: [SITE_TAG], revalidate: 3600 });

export async function isPreview() {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

/* ─────────────────────────────── Paramètres ─────────────────────────────── */

function mergeSettings(rows: { key: string; value: Record<string, unknown> }[]): SiteSettings {
  const out = structuredClone(defaultSettings) as Record<string, Record<string, unknown>>;
  for (const r of rows) {
    if (r.key in out) out[r.key] = { ...out[r.key], ...r.value };
  }
  return out as unknown as SiteSettings;
}

export const getSettings = async (): Promise<SiteSettings> => {
  if (!hasDatabase) return fb.fallbackSettings();
  return cache(async () => {
    const rows = await getPublicDb().select().from(schema.settings);
    return mergeSettings(rows);
  }, "settings")();
};

/* ─────────────────────────────── Pages & sections ─────────────────────────────── */

async function loadPage(key: string, preview: boolean): Promise<PublicPage | null> {
  const def = getPageDef(key);
  if (!def) return null;
  // L'aperçu (brouillons) nécessite la connexion propriétaire ; le public n'y a pas accès.
  const db = preview ? getDb() : getPublicDb();
  const [page] = await db.select().from(schema.pages).where(eq(schema.pages.key, key));
  if (!page) return preview ? fb.fallbackPage(key) : null;
  const t = schema.sections;
  const rows = await db
    .select({ key: t.key, visible: t.visible, published: t.published, ...(preview ? { draft: t.draft } : {}) })
    .from(t)
    .where(eq(t.pageKey, key))
    .orderBy(asc(t.sortOrder));
  const sections = rows.map((r) => {
    const defaults = def.sections.find((s) => s.key === r.key)?.defaults ?? {};
    const stored = ((preview && "draft" in r ? r.draft : r.published) ?? {}) as Record<string, unknown>;
    return { key: r.key, visible: r.visible, content: { ...defaults, ...stored } };
  });
  // Sections déclarées dans le code mais absentes de la base (ajout ultérieur) : valeurs par défaut.
  for (const s of def.sections) {
    if (!sections.find((x) => x.key === s.key)) sections.push({ key: s.key, visible: true, content: s.defaults });
  }
  return {
    key: page.key,
    title: page.title,
    path: page.path,
    seoTitle: page.seoTitle ?? def.seoTitle,
    seoDescription: page.seoDescription ?? def.seoDescription,
    ogImageUrl: page.ogImageUrl,
    status: page.status,
    sections,
  };
}

export async function getPage(key: string): Promise<PublicPage | null> {
  if (!hasDatabase) return fb.fallbackPage(key);
  const preview = await isPreview();
  if (preview) return loadPage(key, true);
  return cache(() => loadPage(key, false), `page:${key}`)();
}

/** Statut public des pages (pour la navigation, le sitemap et les 404 des brouillons). */
export async function getPageStatuses(): Promise<Record<string, "draft" | "published">> {
  const base = Object.fromEntries(PAGES.map((p) => [p.key, "published" as const]));
  if (!hasDatabase) return base;
  return cache(async () => {
    // Le rôle public ne voit que les pages publiées : toute page absente est un brouillon.
    const rows = await getPublicDb().select({ key: schema.pages.key, status: schema.pages.status }).from(schema.pages);
    const visible = new Set(rows.filter((r) => r.status === "published").map((r) => r.key));
    return Object.fromEntries(PAGES.map((p) => [p.key, visible.has(p.key) ? "published" : "draft"])) as Record<
      string,
      "draft" | "published"
    >;
  }, "page-statuses")();
}

/* ─────────────────────────────── Tarifs ─────────────────────────────── */

export async function getPriceCatalog(): Promise<PublicCategory[]> {
  if (!hasDatabase) return fb.fallbackCatalog();
  return cache(async () => {
    const db = getPublicDb();
    const now = new Date();
    const cats = await db
      .select()
      .from(schema.priceCategories)
      .where(eq(schema.priceCategories.isPublished, true))
      .orderBy(asc(schema.priceCategories.sortOrder));
    const svcs = await db
      .select()
      .from(schema.services)
      .where(eq(schema.services.isPublished, true))
      .orderBy(asc(schema.services.sortOrder));
    const vars = await db.select().from(schema.serviceVariants).orderBy(asc(schema.serviceVariants.sortOrder));
    return cats.map((c) => ({
      id: c.id,
      slug: c.slug,
      label: c.label,
      intro: c.intro,
      footnote: c.footnote,
      services: svcs
        .filter((s) => s.categoryId === c.id)
        .map((s) => {
          const promoActive =
            Boolean(s.promoLabel) &&
            (!s.promoStartsAt || s.promoStartsAt <= now) &&
            (!s.promoEndsAt || s.promoEndsAt >= now);
          return {
            id: s.id,
            section: s.section,
            name: s.name,
            description: s.description,
            durationMinutes: s.durationMinutes,
            priceCents: s.priceCents,
            priceFrom: s.priceFrom,
            compareAtCents: s.compareAtCents,
            supplementLabel: s.supplementLabel,
            supplementCents: s.supplementCents,
            conditions: s.conditions,
            badge: s.badge,
            promoLabel: promoActive ? s.promoLabel : null,
            imageUrl: s.imageUrl,
            imageAlt: s.imageAlt,
            variants: vars.filter((v) => v.serviceId === s.id).map((v) => ({ label: v.label, priceCents: v.priceCents })),
          };
        }),
    }));
  }, "catalog")();
}

/* ─────────────────────────────── Offres ─────────────────────────────── */

/**
 * Seules les offres PUBLIÉES dont la période est en cours sont renvoyées.
 * Une offre expirée ou en brouillon n'apparaît jamais sur le site.
 * Le cache est court (5 min) pour respecter les dates de début et de fin.
 */
export async function getOffers(): Promise<PublicOffer[]> {
  if (!hasDatabase) return fb.fallbackOffers();
  return unstable_cache(
    async () => {
      const now = new Date();
      const o = schema.offers;
      const rows = await getPublicDb()
        .select()
        .from(o)
        .where(
          and(
            eq(o.status, "published"),
            or(isNull(o.startsAt), lte(o.startsAt, now)),
            or(isNull(o.endsAt), gte(o.endsAt, now)),
          ),
        )
        .orderBy(asc(o.sortOrder));
      return rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        kind: r.kind,
        title: r.title,
        subtitle: r.subtitle,
        description: r.description,
        priceCents: r.priceCents,
        compareAtCents: r.compareAtCents,
        priceLabel: r.priceLabel,
        items: r.items,
        conditions: r.conditions,
        code: r.code,
        ctaLabel: r.ctaLabel,
        ctaHref: r.ctaHref,
        imageUrl: r.imageUrl,
        imageAlt: r.imageAlt,
        highlight: r.highlight,
        endsAt: r.endsAt ? r.endsAt.toISOString() : null,
      }));
    },
    ["offers"],
    { tags: [SITE_TAG], revalidate: 300 },
  )();
}

/* ─────────────────────────────── Divers ─────────────────────────────── */

export async function getFaqs(pageKey = "home"): Promise<PublicFaq[]> {
  if (!hasDatabase) return fb.fallbackFaqs();
  return cache(async () => {
    const f = schema.faqs;
    const rows = await getPublicDb()
      .select()
      .from(f)
      .where(and(eq(f.isPublished, true), eq(f.pageKey, pageKey)))
      .orderBy(asc(f.sortOrder));
    return rows.map((r) => ({ id: r.id, question: r.question, answer: r.answer }));
  }, `faqs:${pageKey}`)();
}

export async function getGallery(): Promise<PublicGalleryItem[]> {
  if (!hasDatabase) return fb.fallbackGallery();
  return cache(async () => {
    const g = schema.galleryItems;
    const rows = await getPublicDb().select().from(g).where(eq(g.isPublished, true)).orderBy(asc(g.sortOrder));
    return rows.map((r) => ({
      id: r.id,
      imageUrl: r.imageUrl,
      alt: r.alt,
      caption: r.caption,
      category: r.category,
      layout: r.layout,
      isStock: r.isStock,
    }));
  }, "gallery")();
}

export async function getTestimonials(): Promise<PublicTestimonial[]> {
  if (!hasDatabase) return [];
  return cache(async () => {
    const t = schema.testimonials;
    const rows = await getPublicDb()
      .select()
      .from(t)
      .where(and(eq(t.isPublished, true), eq(t.consentConfirmed, true)))
      .orderBy(asc(t.sortOrder));
    return rows.map((r) => ({ id: r.id, author: r.author, context: r.context, quote: r.quote, rating: r.rating }));
  }, "testimonials")();
}

export async function getAreas(): Promise<PublicArea[]> {
  if (!hasDatabase) return fb.fallbackAreas();
  return cache(async () => {
    const a = schema.serviceAreas;
    const rows = await getPublicDb().select().from(a).where(eq(a.isPublished, true)).orderBy(asc(a.sortOrder));
    return rows.map((r) => ({ id: r.id, name: r.name, postalCode: r.postalCode, travelIncluded: r.travelIncluded, note: r.note }));
  }, "areas")();
}

/** Liste courte des prestations proposées dans le formulaire de demande. */
export function getServiceChoices(): string[] {
  return [
    "Coupe femme",
    "Coupe homme",
    "Coupe enfant",
    "Couleur",
    "Beauty Color",
    "Balayage",
    "Mèches",
    "Soin / technique",
    "Coiffure de cérémonie",
    "Forfait famille / groupe",
    "Bon cadeau",
    "Autre / conseil",
  ];
}
