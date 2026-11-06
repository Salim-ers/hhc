"use server";

import { asc, eq } from "drizzle-orm";
import { assertUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { getPageDef, getSectionDef } from "@/lib/content/section-registry";
import { fail, logChange, ok, refreshPublicSite, run, str, type ActionResult } from "@/lib/admin/actions-core";

const t = schema.sections;

/** Nettoie un contenu selon la définition de la section (seuls les champs connus sont gardés). */
function sanitize(pageKey: string, key: string, content: Record<string, unknown>) {
  const def = getSectionDef(pageKey, key);
  if (!def) throw new Error("Section inconnue.");
  const clean: Record<string, unknown> = {};
  for (const f of def.fields) {
    const v = content[f.name];
    if (f.type === "text" || f.type === "textarea") clean[f.name] = typeof v === "string" ? v.slice(0, 8000) : "";
    else if (f.type === "image") {
      const img = (v ?? {}) as { url?: string; alt?: string };
      clean[f.name] = { url: String(img.url ?? "").slice(0, 1000), alt: String(img.alt ?? "").slice(0, 300) };
    } else if (f.type === "link") {
      const l = (v ?? {}) as { label?: string; href?: string };
      clean[f.name] = { label: String(l.label ?? "").slice(0, 120), href: String(l.href ?? "").slice(0, 500) };
    } else if (f.type === "list") {
      const arr = Array.isArray(v) ? v.slice(0, f.max ?? 20) : [];
      clean[f.name] = arr.map((item) => {
        const it = (item ?? {}) as Record<string, unknown>;
        const o: Record<string, unknown> = {};
        for (const sf of f.fields) {
          const sv = it[sf.name];
          if (sf.type === "image") {
            const img = (sv ?? {}) as { url?: string; alt?: string };
            o[sf.name] = { url: String(img.url ?? ""), alt: String(img.alt ?? "") };
          } else if (sf.type === "link") {
            const l = (sv ?? {}) as { label?: string; href?: string };
            o[sf.name] = { label: String(l.label ?? ""), href: String(l.href ?? "") };
          } else o[sf.name] = typeof sv === "string" ? sv.slice(0, 4000) : "";
        }
        return o;
      });
    }
  }
  return clean;
}

/** Enregistre le BROUILLON d'une section (aucun effet sur le site public). */
export async function saveSectionDraft(pageKey: string, key: string, content: Record<string, unknown>): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    const clean = sanitize(pageKey, key, content);
    const [row] = await getDb()
      .update(t)
      .set({ draft: clean, hasUnpublishedChanges: true, updatedAt: new Date() })
      .where(eq(t.id, (await sectionId(pageKey, key))!))
      .returning();
    await logChange(user, "draft", "section", row.id, `Brouillon « ${row.label} » (${getPageDef(pageKey)?.title}) enregistré`);
    return ok("Brouillon enregistré. Utilisez « Aperçu » pour le voir, puis « Publier ».");
  });
}

/** Publie le brouillon d'une section : visible immédiatement sur le site. */
export async function publishSection(pageKey: string, key: string, content?: Record<string, unknown>): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    const id = await sectionId(pageKey, key);
    const db = getDb();
    const [cur] = await db.select().from(t).where(eq(t.id, id!));
    const clean = content ? sanitize(pageKey, key, content) : cur.draft;
    await db
      .update(t)
      .set({ draft: clean, published: clean, hasUnpublishedChanges: false, publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(t.id, id!));
    await logChange(user, "publish", "section", id!, `« ${cur.label} » (${getPageDef(pageKey)?.title}) publiée`, { before: cur.published, after: clean });
    refreshPublicSite();
    return ok("Publié : la modification est en ligne.");
  });
}

/** Abandonne le brouillon et revient à la version en ligne. */
export async function discardSectionDraft(pageKey: string, key: string): Promise<ActionResult> {
  return run(async () => {
    await assertUser();
    const id = await sectionId(pageKey, key);
    const db = getDb();
    const [cur] = await db.select().from(t).where(eq(t.id, id!));
    await db.update(t).set({ draft: cur.published, hasUnpublishedChanges: false }).where(eq(t.id, id!));
    return ok("Brouillon abandonné : retour à la version en ligne.");
  });
}

export async function setSectionVisible(pageKey: string, key: string, visible: boolean): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    const def = getSectionDef(pageKey, key);
    if (def?.locked && !visible) return fail("Cette section est indispensable et ne peut pas être masquée.");
    const id = await sectionId(pageKey, key);
    await getDb().update(t).set({ visible }).where(eq(t.id, id!));
    await logChange(user, visible ? "publish" : "unpublish", "section", id!, `Section « ${def?.label} » ${visible ? "affichée" : "masquée"}`);
    refreshPublicSite();
    return ok(visible ? "Section affichée." : "Section masquée.");
  });
}

export async function moveSection(pageKey: string, key: string, direction: -1 | 1): Promise<ActionResult> {
  return run(async () => {
    await assertUser();
    const db = getDb();
    const rows = await db.select({ id: t.id, key: t.key }).from(t).where(eq(t.pageKey, pageKey)).orderBy(asc(t.sortOrder));
    // Les sections verrouillées (Hero, en-tête) restent en tête.
    const idx = rows.findIndex((r) => r.key === key);
    const target = idx + direction;
    if (idx < 0 || target < 0 || target >= rows.length) return ok("Déjà en position limite.");
    if (getSectionDef(pageKey, rows[target].key)?.locked || getSectionDef(pageKey, key)?.locked) return fail("Le bloc d'en-tête reste toujours en premier.");
    const order = rows.map((r) => r.id);
    [order[idx], order[target]] = [order[target], order[idx]];
    await db.transaction(async (tx) => {
      for (const [i, id] of order.entries()) await tx.update(t).set({ sortOrder: i }).where(eq(t.id, id));
    });
    refreshPublicSite();
    return ok("Ordre des sections mis à jour.");
  });
}

/** Métadonnées SEO et statut (publié / brouillon) d'une page. */
export async function savePageSettings(formData: FormData): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    const key = String(formData.get("key"));
    const def = getPageDef(key);
    if (!def) return fail("Page inconnue.");
    const status = formData.get("status") === "draft" && def.canBeDraft ? "draft" : "published";
    await getDb()
      .update(schema.pages)
      .set({
        seoTitle: str(formData.get("seoTitle"))?.slice(0, 120) ?? null,
        seoDescription: str(formData.get("seoDescription"))?.slice(0, 320) ?? null,
        ogImageUrl: str(formData.get("ogImageUrl")),
        status,
        updatedAt: new Date(),
      })
      .where(eq(schema.pages.key, key));
    await logChange(user, "update", "page", key, `Page « ${def.title} » : référencement / statut (${status === "draft" ? "brouillon" : "en ligne"})`);
    refreshPublicSite();
    return ok(status === "draft" ? "Page enregistrée en brouillon (invisible pour les visiteurs)." : "Réglages de la page enregistrés.");
  });
}

async function sectionId(pageKey: string, key: string) {
  const db = getDb();
  const all = await db.select({ id: t.id, key: t.key }).from(t).where(eq(t.pageKey, pageKey));
  const found = all.find((r) => r.key === key);
  if (found) return found.id;
  // Section ajoutée dans le code après l'initialisation : on la crée à la volée.
  const def = getSectionDef(pageKey, key);
  if (!def) throw new Error("Section inconnue.");
  const [created] = await db
    .insert(t)
    .values({ pageKey, key, label: def.label, sortOrder: all.length, draft: def.defaults, published: def.defaults })
    .returning({ id: t.id });
  return created.id;
}
