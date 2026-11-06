"use server";

import { asc, eq, max } from "drizzle-orm";
import { assertUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { bool, dateOrNull, euroToCents, fail, logChange, ok, refreshPublicSite, run, slugify, str, type ActionResult } from "@/lib/admin/actions-core";

const o = schema.offers;
const KINDS = ["forfait", "formule", "promotion", "parrainage", "bon_cadeau", "banniere"] as const;

export async function saveOffer(formData: FormData): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const user = await assertUser();
    const id = str(formData.get("id"));
    const title = str(formData.get("title"));
    if (!title) return fail("Le titre est obligatoire.");
    const kind = String(formData.get("kind")) as (typeof KINDS)[number];
    if (!KINDS.includes(kind)) return fail("Type d'offre invalide.");
    const startsAt = dateOrNull(formData.get("startsAt"));
    const endsAt = dateOrNull(formData.get("endsAt"));
    if (startsAt && endsAt && endsAt < startsAt) return fail("La date de fin précède la date de début.");
    const items = String(formData.get("items") ?? "")
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 12);
    const status = formData.get("intent") === "publish" ? "published" : formData.get("intent") === "draft" ? "draft" : (String(formData.get("status")) as "draft" | "published");
    const values = {
      kind,
      title,
      subtitle: str(formData.get("subtitle")),
      description: str(formData.get("description")),
      priceCents: euroToCents(formData.get("price")),
      compareAtCents: euroToCents(formData.get("compareAt")),
      priceLabel: str(formData.get("priceLabel")),
      items,
      conditions: str(formData.get("conditions")),
      code: str(formData.get("code")),
      ctaLabel: str(formData.get("ctaLabel")),
      ctaHref: str(formData.get("ctaHref")),
      imageUrl: str(formData.get("imageUrl")),
      imageAlt: str(formData.get("imageAlt")),
      highlight: bool(formData.get("highlight")),
      startsAt,
      endsAt,
      status: status === "published" ? ("published" as const) : ("draft" as const),
      needsReview: bool(formData.get("needsReview")),
      updatedAt: new Date(),
    };
    const db = getDb();
    let oid = id;
    if (oid) {
      await db.update(o).set(values).where(eq(o.id, oid));
    } else {
      const [{ m }] = await db.select({ m: max(o.sortOrder) }).from(o);
      const [row] = await db
        .insert(o)
        .values({ ...values, slug: `${slugify(title)}-${Date.now().toString(36).slice(-4)}`, sortOrder: (m ?? -1) + 1 })
        .returning({ id: o.id });
      oid = row.id;
    }
    await logChange(user, id ? "update" : "create", "offre", oid!, `Offre « ${title} » ${values.status === "published" ? "publiée" : "enregistrée en brouillon"}`);
    refreshPublicSite();
    const scheduled = values.status === "published" && startsAt && startsAt > new Date();
    return ok(
      values.status === "published" ? (scheduled ? `Programmée : visible à partir du ${startsAt!.toLocaleDateString("fr-FR")}.` : "Offre publiée sur le site.") : "Brouillon enregistré (non visible).",
      { id: oid! },
    );
  });
}

export async function deleteOffer(id: string): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    const [row] = await getDb().delete(o).where(eq(o.id, id)).returning();
    if (row) await logChange(user, "delete", "offre", id, `Offre « ${row.title} » supprimée`);
    refreshPublicSite();
    return ok("Offre supprimée.");
  });
}

export async function setOfferStatus(id: string, status: "draft" | "published"): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    const [row] = await getDb().update(o).set({ status, updatedAt: new Date() }).where(eq(o.id, id)).returning();
    if (!row) return fail("Offre introuvable.");
    await logChange(user, status === "published" ? "publish" : "unpublish", "offre", id, `Offre « ${row.title} » ${status === "published" ? "publiée" : "retirée du site"}`);
    refreshPublicSite();
    return ok(status === "published" ? "Offre publiée." : "Offre retirée du site.");
  });
}

export async function moveOffer(id: string, direction: -1 | 1): Promise<ActionResult> {
  return run(async () => {
    await assertUser();
    const db = getDb();
    const all = await db.select({ id: o.id }).from(o).orderBy(asc(o.sortOrder));
    const idx = all.findIndex((x) => x.id === id);
    const t = idx + direction;
    if (idx < 0 || t < 0 || t >= all.length) return ok("Déjà en position limite.");
    const order = all.map((x) => x.id);
    [order[idx], order[t]] = [order[t], order[idx]];
    await db.transaction(async (tx) => {
      for (const [i, x] of order.entries()) await tx.update(o).set({ sortOrder: i }).where(eq(o.id, x));
    });
    refreshPublicSite();
    return ok("Ordre mis à jour.");
  });
}
