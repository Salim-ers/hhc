"use server";

import { eq, sql } from "drizzle-orm";
import { assertUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { deleteStoredImage, storeImage } from "@/lib/services/storage";
import { fail, logChange, ok, refreshPublicSite, run, str, type ActionResult } from "@/lib/admin/actions-core";
import type { Media } from "@/lib/db/schema";

const m = schema.media;

/** Où une image est-elle utilisée ? (prestations, offres, galerie, textes, paramètres…) */
export async function mediaUsage(url: string): Promise<{ where: string; count: number }[]> {
  const db = getDb();
  const q = async (label: string, query: ReturnType<typeof sql>) => {
    const r = await db.execute(query);
    return { where: label, count: Number((r.rows[0] as { n: number }).n) };
  };
  const like = `%${url.replace(/[%_]/g, "\\$&")}%`;
  const res = await Promise.all([
    q("Prestations", sql`select count(*)::int n from services where image_url = ${url}`),
    q("Expertises", sql`select count(*)::int n from expertises where image_url = ${url}`),
    q("Offres", sql`select count(*)::int n from offers where image_url = ${url}`),
    q("Galerie", sql`select count(*)::int n from gallery_items where image_url = ${url}`),
    q("Textes des pages", sql`select count(*)::int n from sections where draft::text like ${like} or published::text like ${like}`),
    q("Pages (partage)", sql`select count(*)::int n from pages where og_image_url = ${url}`),
    q("Paramètres", sql`select count(*)::int n from settings where value::text like ${like}`),
  ]);
  return res.filter((r) => r.count > 0);
}

export async function uploadMedia(formData: FormData): Promise<ActionResult<{ items: Media[] }>> {
  return run(async () => {
    const user = await assertUser();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (!files.length) return fail("Choisissez au moins une image.");
    if (files.length > 20) return fail("20 images maximum par envoi.");
    const category = str(formData.get("category")) ?? "general";
    const items: Media[] = [];
    for (const file of files) {
      const stored = await storeImage(file);
      const [row] = await getDb()
        .insert(m)
        .values({
          url: stored.url,
          pathname: stored.pathname,
          filename: file.name,
          mimeType: stored.mimeType,
          width: stored.width,
          height: stored.height,
          sizeBytes: stored.size,
          alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
          category,
        })
        .returning();
      items.push(row);
    }
    await logChange(user, "create", "media", null, `${items.length} image(s) ajoutée(s) à la médiathèque`);
    return ok(items.length > 1 ? `${items.length} images ajoutées.` : "Image ajoutée.", { items });
  });
}

export async function updateMedia(id: string, data: { alt: string; category: string }): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    const db = getDb();
    const [row] = await db
      .update(m)
      .set({ alt: data.alt.slice(0, 300), category: data.category.slice(0, 40) || "general" })
      .where(eq(m.id, id))
      .returning();
    if (!row) return fail("Image introuvable.");
    // Le texte alternatif suit l'image dans la galerie.
    await db.update(schema.galleryItems).set({ alt: row.alt }).where(eq(schema.galleryItems.imageUrl, row.url));
    await logChange(user, "update", "media", id, `Description d'image modifiée`);
    refreshPublicSite();
    return ok("Image mise à jour.");
  });
}

/**
 * Remplace une image partout où elle est utilisée (y compris dans les textes des pages),
 * par exemple pour remplacer une photo d'illustration par une vraie réalisation, ou après recadrage.
 */
export async function replaceMedia(formData: FormData): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    const id = String(formData.get("id"));
    const file = formData.get("file");
    if (!(file instanceof File) || !file.size) return fail("Aucun fichier reçu.");
    const db = getDb();
    const [old] = await db.select().from(m).where(eq(m.id, id));
    if (!old) return fail("Image introuvable.");
    const stored = await storeImage(file);
    const from = old.url;
    const to = stored.url;
    await db.transaction(async (tx) => {
      await tx
        .update(m)
        .set({ url: to, pathname: stored.pathname, mimeType: stored.mimeType, width: stored.width, height: stored.height, sizeBytes: stored.size, isStock: false, credit: null, filename: file.name })
        .where(eq(m.id, id));
      await tx.execute(sql`update services set image_url = ${to} where image_url = ${from}`);
      await tx.execute(sql`update expertises set image_url = ${to} where image_url = ${from}`);
      await tx.execute(sql`update offers set image_url = ${to} where image_url = ${from}`);
      await tx.execute(sql`update gallery_items set image_url = ${to}, is_stock = false where image_url = ${from}`);
      await tx.execute(sql`update pages set og_image_url = ${to} where og_image_url = ${from}`);
      await tx.execute(sql`update sections set draft = replace(draft::text, ${from}, ${to})::jsonb, published = replace(published::text, ${from}, ${to})::jsonb where draft::text like ${"%" + from + "%"} or published::text like ${"%" + from + "%"}`);
      await tx.execute(sql`update settings set value = replace(value::text, ${from}, ${to})::jsonb where value::text like ${"%" + from + "%"}`);
    });
    if (!old.isStock) await deleteStoredImage(from);
    await logChange(user, "update", "media", id, `Image « ${old.alt || old.filename} » remplacée partout sur le site`);
    refreshPublicSite();
    return ok("Image remplacée partout sur le site.");
  });
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    const db = getDb();
    const [row] = await db.select().from(m).where(eq(m.id, id));
    if (!row) return fail("Image introuvable.");
    const used = await mediaUsage(row.url);
    if (used.length) return fail(`Image utilisée (${used.map((u) => `${u.where} : ${u.count}`).join(", ")}). Remplacez-la plutôt, ou retirez-la d'abord de ces contenus.`);
    await db.delete(m).where(eq(m.id, id));
    if (!row.isStock) await deleteStoredImage(row.url);
    await logChange(user, "delete", "media", id, `Image « ${row.alt || row.filename} » supprimée`);
    return ok("Image supprimée.");
  });
}

export async function listMedia(): Promise<Media[]> {
  await assertUser();
  const { desc } = await import("drizzle-orm");
  return getDb().select().from(m).orderBy(desc(m.createdAt)).limit(500);
}
