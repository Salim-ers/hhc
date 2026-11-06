"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { assertUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { fail, logChange, ok, run, str, type ActionResult } from "@/lib/admin/actions-core";

const u = schema.users;

/** Création d'un compte par la propriétaire (mot de passe provisoire à transmettre de vive voix). */
export async function createUser(formData: FormData): Promise<ActionResult> {
  return run(async () => {
    const me = await assertUser("owner");
    const email = str(formData.get("email"))?.toLowerCase();
    const name = str(formData.get("name"));
    const role = formData.get("role") === "owner" ? "owner" : "editor";
    const password = String(formData.get("password") ?? "");
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("E-mail invalide.");
    if (!name) return fail("Le prénom est obligatoire.");
    const weak = validatePasswordStrength(password);
    if (weak) return fail(weak);
    await getDb().insert(u).values({ email, name, role, passwordHash: await hashPassword(password) });
    await logChange(me, "create", "utilisateur", email, `Compte ${role === "owner" ? "propriétaire" : "éditeur"} créé pour ${name}`);
    return ok("Compte créé. Transmettez le mot de passe provisoire en personne.");
  });
}

export async function setUserActive(id: string, active: boolean): Promise<ActionResult> {
  return run(async () => {
    const me = await assertUser("owner");
    if (id === me.id) return fail("Vous ne pouvez pas désactiver votre propre compte.");
    const db = getDb();
    const [row] = await db.update(u).set({ active }).where(eq(u.id, id)).returning();
    if (!active) await db.delete(schema.sessions).where(eq(schema.sessions.userId, id));
    if (row) await logChange(me, "update", "utilisateur", id, `Compte de ${row.name} ${active ? "réactivé" : "désactivé"}`);
    return ok(active ? "Compte réactivé." : "Compte désactivé (sessions fermées).");
  });
}

export async function setUserRole(id: string, role: "owner" | "editor"): Promise<ActionResult> {
  return run(async () => {
    const me = await assertUser("owner");
    const db = getDb();
    if (role === "editor") {
      const [{ n }] = await db.select({ n: count() }).from(u).where(and(eq(u.role, "owner"), eq(u.active, true), ne(u.id, id)));
      if (n === 0) return fail("Il doit rester au moins un compte propriétaire actif.");
    }
    const [row] = await db.update(u).set({ role }).where(eq(u.id, id)).returning();
    if (row) await logChange(me, "update", "utilisateur", id, `Rôle de ${row.name} : ${role === "owner" ? "propriétaire" : "éditeur"}`);
    return ok("Rôle mis à jour.");
  });
}

export async function resetUserPassword(id: string, password: string): Promise<ActionResult> {
  return run(async () => {
    const me = await assertUser("owner");
    const weak = validatePasswordStrength(password);
    if (weak) return fail(weak);
    const db = getDb();
    await db.update(u).set({ passwordHash: await hashPassword(password) }).where(eq(u.id, id));
    await db.delete(schema.sessions).where(eq(schema.sessions.userId, id));
    await logChange(me, "update", "utilisateur", id, "Mot de passe réinitialisé");
    return ok("Mot de passe réinitialisé.");
  });
}
