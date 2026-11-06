"use server";

/**
 * Actions des petites collections : galerie, communes, FAQ, avis.
 * Toutes vérifient la session côté serveur et journalisent les modifications.
 */
import { asc, eq, max } from "drizzle-orm";
import type { PgTableWithColumns } from "drizzle-orm/pg-core";
import { assertUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { bool, fail, logChange, ok, refreshPublicSite, run, str, type ActionResult } from "@/lib/admin/actions-core";

type Kind = "gallery" | "areas" | "faqs" | "testimonials";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TABLES: Record<Kind, PgTableWithColumns<any>> = {
  gallery: schema.galleryItems,
  areas: schema.serviceAreas,
  faqs: schema.faqs,
  testimonials: schema.testimonials,
};
const LABEL: Record<Kind, string> = { gallery: "photo de galerie", areas: "commune", faqs: "question", testimonials: "avis" };

function values(kind: Kind, f: FormData): Record<string, unknown> {
  switch (kind) {
    case "gallery": {
      const imageUrl = str(f.get("imageUrl"));
      const alt = str(f.get("alt"));
      if (!imageUrl) throw new Error("Choisissez une image.");
      if (!alt) throw new Error("Le texte alternatif est obligatoire (accessibilité et référencement).");
      return { imageUrl, alt, caption: str(f.get("caption")), category: str(f.get("category")) ?? "coupe", layout: str(f.get("layout")) ?? "portrait", isStock: bool(f.get("isStock")), isPublished: bool(f.get("isPublished")) };
    }
    case "areas": {
      const name = str(f.get("name"));
      if (!name) throw new Error("Le nom de la commune est obligatoire.");
      return { name, postalCode: str(f.get("postalCode")), travelIncluded: bool(f.get("travelIncluded")), note: str(f.get("note")), isPublished: bool(f.get("isPublished")) };
    }
    case "faqs": {
      const question = str(f.get("question"));
      const answer = str(f.get("answer"));
      if (!question || !answer) throw new Error("La question et la réponse sont obligatoires.");
      return { question, answer, pageKey: str(f.get("pageKey")) ?? "home", isPublished: bool(f.get("isPublished")), updatedAt: new Date() };
    }
    case "testimonials": {
      const author = str(f.get("author"));
      const quote = str(f.get("quote"));
      if (!author || !quote) throw new Error("Le prénom et le témoignage sont obligatoires.");
      const consentConfirmed = bool(f.get("consentConfirmed"));
      const isPublished = bool(f.get("isPublished"));
      if (isPublished && !consentConfirmed) throw new Error("Confirmez l'accord de la personne avant de publier son avis.");
      const rating = Number(f.get("rating") || 0);
      return { author, quote, context: str(f.get("context")), rating: rating >= 1 && rating <= 5 ? rating : null, consentConfirmed, isPublished };
    }
  }
}

export async function saveItem(kind: Kind, formData: FormData): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    const table = TABLES[kind];
    const id = str(formData.get("id"));
    const v = values(kind, formData);
    const db = getDb();
    if (id) {
      await db.update(table).set(v).where(eq(table.id, id));
    } else {
      const [{ mx }] = await db.select({ mx: max(table.sortOrder) }).from(table);
      await db.insert(table).values({ ...v, sortOrder: ((mx as number | null) ?? -1) + 1 });
    }
    await logChange(user, id ? "update" : "create", kind, id, `${id ? "Modification" : "Ajout"} : ${LABEL[kind]}`);
    refreshPublicSite();
    return ok("Enregistré.");
  });
}

export async function deleteItem(kind: Kind, id: string): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    const table = TABLES[kind];
    await getDb().delete(table).where(eq(table.id, id));
    await logChange(user, "delete", kind, id, `Suppression : ${LABEL[kind]}`);
    refreshPublicSite();
    return ok("Supprimé.");
  });
}

export async function togglePublished(kind: Kind, id: string, published: boolean): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    const table = TABLES[kind];
    if (kind === "testimonials" && published) {
      const [row] = await getDb().select().from(table).where(eq(table.id, id));
      if (!row?.consentConfirmed) return fail("Confirmez d'abord l'accord de la personne.");
    }
    await getDb().update(table).set({ isPublished: published }).where(eq(table.id, id));
    await logChange(user, published ? "publish" : "unpublish", kind, id, `${LABEL[kind]} ${published ? "publiée" : "masquée"}`);
    refreshPublicSite();
    return ok(published ? "Visible sur le site." : "Masqué du site.");
  });
}

export async function moveItem(kind: Kind, id: string, direction: -1 | 1): Promise<ActionResult> {
  return run(async () => {
    await assertUser();
    const table = TABLES[kind];
    const db = getDb();
    const all = (await db.select({ id: table.id }).from(table).orderBy(asc(table.sortOrder))) as { id: string }[];
    const idx = all.findIndex((x) => x.id === id);
    const t = idx + direction;
    if (idx < 0 || t < 0 || t >= all.length) return ok("Déjà en position limite.");
    const order = all.map((x) => x.id);
    [order[idx], order[t]] = [order[t], order[idx]];
    await db.transaction(async (tx) => {
      for (const [i, x] of order.entries()) await tx.update(table).set({ sortOrder: i }).where(eq(table.id, x));
    });
    refreshPublicSite();
    return ok("Ordre mis à jour.");
  });
}

/** Ajoute plusieurs images de la médiathèque à la galerie en une fois. */
export async function addToGallery(urls: { url: string; alt: string }[], category: string): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    if (!urls.length) return fail("Aucune image sélectionnée.");
    const db = getDb();
    const [{ mx }] = await db.select({ mx: max(schema.galleryItems.sortOrder) }).from(schema.galleryItems);
    await db.insert(schema.galleryItems).values(
      urls.map((u, i) => ({ imageUrl: u.url, alt: u.alt || "Réalisation Hair Home Concept", category, layout: "portrait", sortOrder: (mx ?? -1) + 1 + i })),
    );
    await logChange(user, "create", "gallery", null, `${urls.length} photo(s) ajoutée(s) à la galerie`);
    refreshPublicSite();
    return ok(`${urls.length} photo(s) ajoutée(s) à la galerie.`);
  });
}
