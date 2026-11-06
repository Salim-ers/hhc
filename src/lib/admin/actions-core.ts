import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { getDb, schema } from "@/lib/db";
import { SITE_TAG } from "@/lib/data/public";
import type { SessionUser } from "@/lib/auth/session";

export type ActionResult<T = undefined> = { ok: true; message: string; data?: T } | { ok: false; error: string };

export const ok = <T,>(message: string, data?: T): ActionResult<T> => ({ ok: true, message, data });
export const fail = (error: string): ActionResult<never> => ({ ok: false, error });

/** Invalide le cache public : les modifications publiées apparaissent immédiatement, sans redéploiement. */
export function refreshPublicSite() {
  revalidateTag(SITE_TAG);
  revalidatePath("/", "layout");
}

export async function logChange(
  user: SessionUser,
  action: string,
  entity: string,
  entityId: string | null,
  summary: string,
  details?: Record<string, unknown>,
) {
  await getDb().insert(schema.auditLog).values({
    userId: user.id,
    userName: user.name,
    action,
    entity,
    entityId,
    summary,
    details: details ?? null,
  });
}

/** Enveloppe commune : capture les erreurs et renvoie un message lisible. */
export async function run<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur inconnue";
    if (/NEXT_REDIRECT/.test(msg)) throw e;
    console.error("[admin]", e);
    if (/unique|duplicate/i.test(msg)) return fail("Cet identifiant est déjà utilisé.");
    if (/foreign key|violates/i.test(msg)) return fail("Impossible : cet élément est encore utilisé ailleurs.");
    return fail(msg.length < 160 ? msg : "Une erreur est survenue. Merci de réessayer.");
  }
}

export const euroToCents = (v: FormDataEntryValue | null): number | null => {
  if (v == null) return null;
  const s = String(v).trim().replace(/\s|€/g, "").replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0 || n > 100000) throw new Error(`Prix invalide : « ${v} »`);
  return Math.round(n * 100);
};

export const str = (v: FormDataEntryValue | null) => {
  const s = v == null ? "" : String(v).trim();
  return s.length ? s : null;
};

export const bool = (v: FormDataEntryValue | null) => v === "on" || v === "true" || v === "1";

export const dateOrNull = (v: FormDataEntryValue | null) => {
  const s = str(v);
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) throw new Error("Date invalide.");
  return d;
};

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
