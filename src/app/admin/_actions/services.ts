"use server";

import { and, asc, eq, max } from "drizzle-orm";
import { z } from "zod";
import { assertUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { bool, dateOrNull, euroToCents, fail, logChange, ok, refreshPublicSite, run, slugify, str, type ActionResult } from "@/lib/admin/actions-core";
import { formatPrice } from "@/lib/utils";

const s = schema.services;

const VariantSchema = z.array(z.object({ label: z.string().trim().min(1).max(80), price: z.string() })).max(8);

/** Création ou modification d'une prestation (avec ses variantes de prix). */
export async function saveService(formData: FormData): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const user = await assertUser();
    const id = str(formData.get("id"));
    const name = str(formData.get("name"));
    const categoryId = str(formData.get("categoryId"));
    if (!name) return fail("Le nom de la prestation est obligatoire.");
    if (!categoryId) return fail("Choisissez une catégorie.");
    const priceOnQuote = bool(formData.get("onQuote"));
    const priceCents = priceOnQuote ? null : euroToCents(formData.get("price"));
    if (!priceOnQuote && priceCents == null) return fail("Indiquez un prix, ou cochez « Sur devis ».");
    const duration = str(formData.get("durationMinutes"));
    const variantsRaw = VariantSchema.safeParse(JSON.parse(String(formData.get("variants") || "[]")));
    if (!variantsRaw.success) return fail("Variantes de prix invalides.");
    const variants = variantsRaw.data.map((v, i) => {
      const c = euroToCents(v.price);
      if (c == null) throw new Error(`Prix manquant pour la variante « ${v.label} ».`);
      return { label: v.label, priceCents: c, sortOrder: i };
    });
    const promoStartsAt = dateOrNull(formData.get("promoStartsAt"));
    const promoEndsAt = dateOrNull(formData.get("promoEndsAt"));
    if (promoStartsAt && promoEndsAt && promoEndsAt < promoStartsAt) return fail("La fin de la promotion précède son début.");

    const values = {
      categoryId,
      name,
      section: str(formData.get("section")),
      description: str(formData.get("description")),
      durationMinutes: duration ? Math.max(0, Math.min(600, parseInt(duration, 10) || 0)) || null : null,
      priceCents,
      priceFrom: bool(formData.get("priceFrom")),
      compareAtCents: euroToCents(formData.get("compareAt")),
      supplementLabel: str(formData.get("supplementLabel")),
      supplementCents: euroToCents(formData.get("supplement")),
      conditions: str(formData.get("conditions")),
      badge: str(formData.get("badge")),
      promoLabel: str(formData.get("promoLabel")),
      promoStartsAt,
      promoEndsAt,
      imageUrl: str(formData.get("imageUrl")),
      imageAlt: str(formData.get("imageAlt")),
      isPublished: bool(formData.get("isPublished")),
      needsReview: bool(formData.get("needsReview")),
      updatedAt: new Date(),
    };
    if (values.supplementCents != null && !values.supplementLabel) values.supplementLabel = "Cheveux longs ou épais";

    const db = getDb();
    const savedId = await db.transaction(async (tx) => {
      let sid = id;
      if (sid) {
        const [before] = await tx.select().from(s).where(eq(s.id, sid));
        if (!before) throw new Error("Prestation introuvable.");
        await tx.update(s).set(values).where(eq(s.id, sid));
        const priceChanged = before.priceCents !== values.priceCents;
        await logChange(
          user,
          "update",
          "prestation",
          sid,
          priceChanged
            ? `Prix de « ${name} » : ${formatPrice(before.priceCents)} → ${formatPrice(values.priceCents)}`
            : `Prestation « ${name} » modifiée`,
          { before: { price: before.priceCents, published: before.isPublished }, after: { price: values.priceCents, published: values.isPublished } },
        );
      } else {
        const [{ m }] = await tx.select({ m: max(s.sortOrder) }).from(s).where(eq(s.categoryId, categoryId));
        const [row] = await tx.insert(s).values({ ...values, sortOrder: (m ?? -1) + 1 }).returning({ id: s.id });
        sid = row.id;
        await logChange(user, "create", "prestation", sid, `Prestation « ${name} » ajoutée (${formatPrice(values.priceCents)})`);
      }
      await tx.delete(schema.serviceVariants).where(eq(schema.serviceVariants.serviceId, sid!));
      if (variants.length) await tx.insert(schema.serviceVariants).values(variants.map((v) => ({ ...v, serviceId: sid! })));
      return sid!;
    });
    refreshPublicSite();
    return ok(values.isPublished ? "Enregistré et publié sur le site." : "Enregistré (masqué sur le site).", { id: savedId });
  });
}

export async function setServicePublished(id: string, published: boolean): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    const [row] = await getDb().update(s).set({ isPublished: published, updatedAt: new Date() }).where(eq(s.id, id)).returning();
    if (!row) return fail("Prestation introuvable.");
    await logChange(user, published ? "publish" : "unpublish", "prestation", id, `« ${row.name} » ${published ? "publiée" : "masquée"}`);
    refreshPublicSite();
    return ok(published ? "Prestation visible sur le site." : "Prestation masquée.");
  });
}

export async function deleteService(id: string): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    const [row] = await getDb().delete(s).where(eq(s.id, id)).returning();
    if (!row) return fail("Prestation introuvable.");
    await logChange(user, "delete", "prestation", id, `Prestation « ${row.name} » supprimée (${formatPrice(row.priceCents)})`);
    refreshPublicSite();
    return ok("Prestation supprimée.");
  });
}

export async function duplicateService(id: string): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const user = await assertUser();
    const db = getDb();
    const [src] = await db.select().from(s).where(eq(s.id, id));
    if (!src) return fail("Prestation introuvable.");
    const vars = await db.select().from(schema.serviceVariants).where(eq(schema.serviceVariants.serviceId, id));
    const { id: _omit, createdAt: _c, updatedAt: _u, ...rest } = src;
    void _omit;
    void _c;
    void _u;
    const [row] = await db
      .insert(s)
      .values({ ...rest, name: `${src.name} (copie)`, isPublished: false, sortOrder: src.sortOrder + 1 })
      .returning({ id: s.id });
    if (vars.length) await db.insert(schema.serviceVariants).values(vars.map((v) => ({ serviceId: row.id, label: v.label, priceCents: v.priceCents, sortOrder: v.sortOrder })));
    await logChange(user, "create", "prestation", row.id, `Copie de « ${src.name} » créée (masquée)`);
    return ok("Copie créée, masquée en attendant vos modifications.", { id: row.id });
  });
}

/** Déplace une prestation d'un cran dans sa catégorie. */
export async function moveService(id: string, direction: -1 | 1): Promise<ActionResult> {
  return run(async () => {
    await assertUser();
    const db = getDb();
    const [row] = await db.select().from(s).where(eq(s.id, id));
    if (!row) return fail("Prestation introuvable.");
    const siblings = await db.select({ id: s.id }).from(s).where(eq(s.categoryId, row.categoryId)).orderBy(asc(s.sortOrder), asc(s.createdAt));
    const idx = siblings.findIndex((x) => x.id === id);
    const target = idx + direction;
    if (target < 0 || target >= siblings.length) return ok("Déjà en position limite.");
    const order = siblings.map((x) => x.id);
    [order[idx], order[target]] = [order[target], order[idx]];
    await db.transaction(async (tx) => {
      for (const [i, sid] of order.entries()) await tx.update(s).set({ sortOrder: i }).where(eq(s.id, sid));
    });
    refreshPublicSite();
    return ok("Ordre mis à jour.");
  });
}

/** Marque les tarifs importés comme vérifiés par la cliente. */
export async function confirmPrices(categoryId?: string): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    const where = categoryId ? and(eq(s.categoryId, categoryId), eq(s.needsReview, true)) : eq(s.needsReview, true);
    const rows = await getDb().update(s).set({ needsReview: false }).where(where).returning({ id: s.id });
    await logChange(user, "update", "prestation", categoryId ?? null, `${rows.length} tarif(s) confirmé(s)`);
    return ok(`${rows.length} tarif(s) marqué(s) comme confirmé(s).`);
  });
}

/* ─────────────── Catégories (onglets de la page Tarifs) ─────────────── */

const c = schema.priceCategories;

export async function saveCategory(formData: FormData): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    const id = str(formData.get("id"));
    const label = str(formData.get("label"));
    if (!label) return fail("Le nom de la catégorie est obligatoire.");
    const values = {
      label,
      intro: str(formData.get("intro")),
      footnote: str(formData.get("footnote")),
      isPublished: bool(formData.get("isPublished")),
      updatedAt: new Date(),
    };
    const db = getDb();
    if (id) {
      await db.update(c).set(values).where(eq(c.id, id));
      await logChange(user, "update", "categorie", id, `Catégorie « ${label} » modifiée`);
    } else {
      const [{ m }] = await db.select({ m: max(c.sortOrder) }).from(c);
      const slug = slugify(str(formData.get("slug")) ?? label) || `categorie-${Date.now()}`;
      const [row] = await db.insert(c).values({ ...values, slug, sortOrder: (m ?? -1) + 1 }).returning({ id: c.id });
      await logChange(user, "create", "categorie", row.id, `Catégorie « ${label} » créée`);
    }
    refreshPublicSite();
    return ok("Catégorie enregistrée.");
  });
}

export async function moveCategory(id: string, direction: -1 | 1): Promise<ActionResult> {
  return run(async () => {
    await assertUser();
    const db = getDb();
    const all = await db.select({ id: c.id }).from(c).orderBy(asc(c.sortOrder));
    const idx = all.findIndex((x) => x.id === id);
    const target = idx + direction;
    if (idx < 0 || target < 0 || target >= all.length) return ok("Déjà en position limite.");
    const order = all.map((x) => x.id);
    [order[idx], order[target]] = [order[target], order[idx]];
    await db.transaction(async (tx) => {
      for (const [i, cid] of order.entries()) await tx.update(c).set({ sortOrder: i }).where(eq(c.id, cid));
    });
    refreshPublicSite();
    return ok("Ordre des onglets mis à jour.");
  });
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    const db = getDb();
    const used = await db.select({ id: s.id }).from(s).where(eq(s.categoryId, id)).limit(1);
    if (used.length) return fail("Cette catégorie contient encore des prestations : déplacez-les ou supprimez-les d'abord.");
    const [row] = await db.delete(c).where(eq(c.id, id)).returning();
    if (row) await logChange(user, "delete", "categorie", id, `Catégorie « ${row.label} » supprimée`);
    refreshPublicSite();
    return ok("Catégorie supprimée.");
  });
}
