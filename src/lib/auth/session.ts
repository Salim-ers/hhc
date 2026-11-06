import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb, hasDatabase, schema } from "@/lib/db";

export const SESSION_COOKIE = "hhc_session";
const SESSION_DAYS = 14;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "owner" | "editor";
};

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

export function hashIp(ip: string) {
  const salt = process.env.AUTH_SECRET ?? "hhc";
  return sha256(`${salt}:${ip}`).slice(0, 32);
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** Crée une session : jeton aléatoire 256 bits en cookie httpOnly, seul son hash est stocké. */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const h = await headers();
  await getDb()
    .insert(schema.sessions)
    .values({ id: sha256(token), userId, expiresAt, userAgent: h.get("user-agent")?.slice(0, 300) ?? null });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  // Ménage des sessions expirées.
  await getDb().delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token && hasDatabase) await getDb().delete(schema.sessions).where(eq(schema.sessions.id, sha256(token)));
  jar.delete(SESSION_COOKIE);
}

/** Utilisateur connecté (validé en base à chaque requête), ou null. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!hasDatabase) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = getDb();
  const [row] = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      active: schema.users.active,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(and(eq(schema.sessions.id, sha256(token)), gt(schema.sessions.expiresAt, new Date())));
  if (!row || !row.active) return null;
  return { id: row.id, email: row.email, name: row.name, role: row.role };
});

/** À appeler en tête de chaque page et action d'administration. */
export async function requireUser(role?: "owner"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/connexion");
  if (role === "owner" && user.role !== "owner") redirect("/admin?refus=proprietaire");
  return user;
}

/** Variante pour les actions serveur : lève une erreur au lieu de rediriger. */
export async function assertUser(role?: "owner"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Session expirée. Merci de vous reconnecter.");
  if (role === "owner" && user.role !== "owner") throw new Error("Action réservée à la propriétaire du site.");
  return user;
}
