"use server";

import { and, count, eq, gt } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hashPassword, validatePasswordStrength, verifyPassword } from "@/lib/auth/password";
import { assertUser, clientIp, createSession, destroySession, hashIp } from "@/lib/auth/session";
import { getDb, hasDatabase, schema } from "@/lib/db";
import { fail, logChange, ok, run, type ActionResult } from "@/lib/admin/actions-core";

export type LoginState = { error?: string };

const WINDOW_MIN = 15;
const MAX_FAILS = 6;

/** Connexion : limitation des tentatives par IP et par e-mail, message d'erreur générique. */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!hasDatabase) return { error: "La base de données n'est pas encore configurée (DATABASE_URL)." };
  const parsed = z
    .object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) })
    .safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Saisissez votre e-mail et votre mot de passe." };
  const { email, password } = parsed.data;
  const db = getDb();
  const ipHash = hashIp(await clientIp());
  const since = new Date(Date.now() - WINDOW_MIN * 60_000);
  const la = schema.loginAttempts;
  const [{ n: ipFails }] = await db.select({ n: count() }).from(la).where(and(eq(la.ipHash, ipHash), eq(la.success, false), gt(la.createdAt, since)));
  const [{ n: mailFails }] = await db.select({ n: count() }).from(la).where(and(eq(la.email, email), eq(la.success, false), gt(la.createdAt, since)));
  if (ipFails >= MAX_FAILS || mailFails >= MAX_FAILS) {
    return { error: `Trop de tentatives. Réessayez dans ${WINDOW_MIN} minutes.` };
  }

  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  // Vérification effectuée même si le compte n'existe pas (temps de réponse constant).
  const valid = await verifyPassword(password, user?.passwordHash ?? "scrypt$65536$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAA");
  await db.insert(la).values({ email, ipHash, success: Boolean(user && valid && user.active) });
  if (!user || !valid || !user.active) return { error: "E-mail ou mot de passe incorrect." };

  await createSession(user.id);
  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/connexion");
}

export async function changePassword(formData: FormData): Promise<ActionResult> {
  return run(async () => {
    const me = await assertUser();
    const current = String(formData.get("current") ?? "");
    const next = String(formData.get("next") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (next !== confirm) return fail("Les deux nouveaux mots de passe ne correspondent pas.");
    const weak = validatePasswordStrength(next);
    if (weak) return fail(weak);
    const db = getDb();
    const [u] = await db.select().from(schema.users).where(eq(schema.users.id, me.id));
    if (!u || !(await verifyPassword(current, u.passwordHash))) return fail("Le mot de passe actuel est incorrect.");
    await db.update(schema.users).set({ passwordHash: await hashPassword(next) }).where(eq(schema.users.id, me.id));
    await logChange(me, "update", "compte", me.id, "Mot de passe modifié");
    return ok("Mot de passe modifié.");
  });
}
