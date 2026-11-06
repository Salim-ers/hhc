"use server";

import { eq } from "drizzle-orm";
import { assertUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { defaultSettings } from "@/lib/content/seed-data";
import { fail, logChange, ok, refreshPublicSite, run, type ActionResult } from "@/lib/admin/actions-core";

type Group = keyof typeof defaultSettings;

const GROUP_LABEL: Record<Group, string> = {
  business: "Coordonnées",
  hours: "Horaires",
  travel: "Déplacements",
  social: "Réseaux sociaux",
  branding: "Logo & favicon",
  legal: "Informations légales",
  seo: "Référencement",
  modules: "Modules",
  notifications: "Notifications",
};

/**
 * Enregistre un groupe de paramètres. Les valeurs sont typées d'après les valeurs par défaut :
 * booléens, nombres et listes sont convertis ; les clés inconnues sont ignorées.
 */
export async function saveSettings(group: string, formData: FormData): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    if (!(group in defaultSettings)) return fail("Groupe de paramètres inconnu.");
    const g = group as Group;
    if ((g === "legal" || g === "modules") && user.role !== "owner") return fail("Réservé à la propriétaire du site.");
    const template = defaultSettings[g] as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, def] of Object.entries(template)) {
      const raw = formData.get(k);
      if (typeof def === "boolean") out[k] = raw === "on" || raw === "true";
      else if (typeof def === "number") {
        const n = Number(String(raw ?? "").replace(",", "."));
        if (!Number.isFinite(n)) return fail(`Valeur numérique invalide pour « ${k} ».`);
        out[k] = n;
      } else if (Array.isArray(def)) out[k] = formData.getAll(k).map(String).filter(Boolean);
      else out[k] = String(raw ?? "").trim().slice(0, 2000);
    }
    if (g === "business") {
      const phone = String(out.phone ?? "");
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 9) return fail("Numéro de téléphone invalide.");
      out.phoneE164 = digits.startsWith("0") ? `+33${digits.slice(1)}` : `+${digits}`;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(out.email))) return fail("Adresse e-mail invalide.");
    }
    if (g === "notifications" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(out.email))) return fail("Adresse e-mail de notification invalide.");
    const db = getDb();
    const [exists] = await db.select().from(schema.settings).where(eq(schema.settings.key, g));
    if (exists) await db.update(schema.settings).set({ value: out, updatedAt: new Date() }).where(eq(schema.settings.key, g));
    else await db.insert(schema.settings).values({ key: g, value: out });
    await logChange(user, "update", "parametres", g, `Paramètres « ${GROUP_LABEL[g]} » modifiés`);
    refreshPublicSite();
    return ok(`${GROUP_LABEL[g]} : enregistré et publié.`);
  });
}
