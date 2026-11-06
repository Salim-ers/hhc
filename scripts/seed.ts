import "./env";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/lib/db/schema";
import { PAGES } from "../src/lib/content/section-registry";
import {
  LONG_HAIR,
  SUPPLEMENT,
  defaultSettings,
  seedAreas,
  seedCategories,
  seedExpertises,
  seedFaqs,
  seedGallery,
  seedOffers,
} from "../src/lib/content/seed-data";
import { STOCK_CREDIT, stock } from "../src/lib/content/stock-images";

/**
 * Initialise la base avec les contenus de l'ancien site et les visuels temporaires.
 *   npm run db:seed            → n'insère que dans les tables vides (sans risque)
 *   npm run db:seed -- --reset → réinitialise TOUS les contenus (pas les comptes ni les demandes)
 */
const cents = (v?: number | null) => (v == null ? null : Math.round(v * 100));

async function main() {
  const reset = process.argv.includes("--reset");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const db = drizzle(pool, { schema });

  const isEmpty = async (table: string) => {
    const r = await db.execute(sql.raw(`select count(*)::int as n from "${table}"`));
    return (r.rows[0] as { n: number }).n === 0;
  };

  if (reset) {
    console.log("⚠ Réinitialisation des contenus…");
    await db.execute(
      sql.raw(
        `truncate "service_variants","services","price_categories","expertises","offers","sections","pages","faqs","gallery_items","service_areas","settings","media","testimonials" restart identity cascade`,
      ),
    );
  }

  // Paramètres
  if (await isEmpty("settings")) {
    await db.insert(schema.settings).values(
      Object.entries(defaultSettings).map(([key, value]) => ({ key, value: value as Record<string, unknown> })),
    );
    console.log("✓ Paramètres");
  }

  // Pages & sections
  if (await isEmpty("pages")) {
    for (const [i, p] of PAGES.entries()) {
      await db.insert(schema.pages).values({
        key: p.key,
        title: p.title,
        path: p.path,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        status: "published",
        sortOrder: i,
      });
      await db.insert(schema.sections).values(
        p.sections.map((s, j) => ({
          pageKey: p.key,
          key: s.key,
          label: s.label,
          sortOrder: j,
          visible: true,
          draft: s.defaults,
          published: s.defaults,
          publishedAt: new Date(),
        })),
      );
    }
    console.log(`✓ ${PAGES.length} pages et leurs sections`);
  }

  // Catalogue des tarifs
  if (await isEmpty("price_categories")) {
    let count = 0;
    for (const [ci, c] of seedCategories.entries()) {
      const [cat] = await db
        .insert(schema.priceCategories)
        .values({ slug: c.slug, label: c.label, intro: c.intro, footnote: c.footnote, sortOrder: ci })
        .returning();
      for (const [si, s] of c.services.entries()) {
        const [svc] = await db
          .insert(schema.services)
          .values({
            categoryId: cat.id,
            section: s.section ?? null,
            name: s.name,
            description: s.description ?? null,
            priceCents: cents(s.price),
            priceFrom: Boolean(s.from),
            compareAtCents: cents(s.compareAt),
            supplementLabel: s.supplement ? SUPPLEMENT.label : null,
            supplementCents: s.supplement ? cents(SUPPLEMENT.amount) : null,
            conditions: s.conditions ?? null,
            badge: s.badge ?? null,
            imageUrl: s.image?.url ?? null,
            imageAlt: s.image?.alt ?? null,
            sortOrder: si,
            needsReview: true,
          })
          .returning();
        if (s.long != null) {
          await db.insert(schema.serviceVariants).values({ serviceId: svc.id, label: LONG_HAIR, priceCents: cents(s.long)! });
        }
        count++;
      }
    }
    console.log(`✓ ${seedCategories.length} catégories, ${count} prestations (à valider)`);
  }

  if (await isEmpty("expertises")) {
    await db.insert(schema.expertises).values(
      seedExpertises.map((e, i) => ({
        slug: e.slug,
        kicker: e.kicker,
        title: e.title,
        summary: e.summary,
        highlights: e.highlights,
        imageUrl: e.image.url,
        imageAlt: e.image.alt,
        priceCategorySlug: e.priceCategorySlug,
        sortOrder: i,
      })),
    );
    console.log("✓ Expertises");
  }

  if (await isEmpty("offers")) {
    await db.insert(schema.offers).values(
      seedOffers.map((o, i) => ({
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
        ctaLabel: o.ctaLabel ?? null,
        ctaHref: o.ctaHref ?? null,
        imageUrl: o.image?.url ?? null,
        imageAlt: o.image?.alt ?? null,
        highlight: Boolean(o.highlight),
        status: o.status,
        needsReview: true,
        sortOrder: i,
      })),
    );
    console.log("✓ Offres");
  }

  if (await isEmpty("faqs")) {
    await db.insert(schema.faqs).values(seedFaqs.map((f, i) => ({ question: f.q, answer: f.a, sortOrder: i })));
    console.log("✓ FAQ");
  }

  if (await isEmpty("gallery_items")) {
    await db.insert(schema.galleryItems).values(
      seedGallery.map((g, i) => ({
        imageUrl: g.image.url,
        alt: g.image.alt,
        category: g.category,
        layout: g.layout,
        isStock: true,
        sortOrder: i,
      })),
    );
    console.log("✓ Galerie");
  }

  if (await isEmpty("service_areas")) {
    await db.insert(schema.serviceAreas).values(
      seedAreas.map((a, i) => ({ name: a.name, postalCode: a.postalCode, travelIncluded: a.included, sortOrder: i })),
    );
    console.log("✓ Communes desservies (à confirmer)");
  }

  if (await isEmpty("media")) {
    const categoryOf = (k: string) =>
      k.startsWith("men") ? "homme" : k.startsWith("kid") ? "enfant" : k.startsWith("jewel") ? "bijoux" : k.match(/balayage|ombre/i) ? "balayage" : k.match(/updo|chignon|bridal/i) ? "coiffure" : "general";
    await db.insert(schema.media).values(
      Object.entries(stock).map(([k, v]) => ({
        url: v.url,
        alt: v.alt,
        filename: `${k}.jpg`,
        mimeType: "image/jpeg",
        category: categoryOf(k),
        credit: STOCK_CREDIT,
        isStock: true,
      })),
    );
    console.log("✓ Médiathèque (visuels temporaires)");
  }

  await pool.end();
  console.log("✓ Données initiales en place.");
}

main().catch((e) => {
  console.error("✖ Échec de l'initialisation :", e);
  process.exit(1);
});
