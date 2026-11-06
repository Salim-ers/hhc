import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Connexions PostgreSQL (Neon). Jamais importées côté navigateur.
 *
 * - DATABASE_URL         : rôle propriétaire, utilisé par l'administration authentifiée.
 * - DATABASE_URL_PUBLIC  : (recommandé) rôle « hhc_public » restreint par RLS, utilisé pour
 *                          la lecture des contenus publiés et la création des demandes.
 *                          À défaut, DATABASE_URL est utilisé.
 *
 * Sur Vercel, utiliser les URL « pooled » de Neon (hôte contenant `-pooler`).
 */
export const hasDatabase = Boolean(process.env.DATABASE_URL);

type DB = NodePgDatabase<typeof schema>;

const g = globalThis as unknown as { __hhcDb?: DB; __hhcPublicDb?: DB };

function create(url: string): DB {
  const isLocal = /localhost|127\.0\.0\.1/.test(url);
  const pool = new Pool({
    connectionString: url,
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    idleTimeoutMillis: 10_000,
    // Avec Neon, `?sslmode=require` dans l'URL suffit ; sinon on force TLS vérifié.
    ssl: isLocal || url.includes("sslmode=") ? undefined : { rejectUnauthorized: true },
  });
  return drizzle(pool, { schema });
}

export function getDb(): DB {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL n'est pas défini.");
  return (g.__hhcDb ??= create(process.env.DATABASE_URL));
}

/** Connexion à privilèges réduits pour le site public (lecture publiée + demandes). */
export function getPublicDb(): DB {
  const url = process.env.DATABASE_URL_PUBLIC;
  if (!url) return getDb();
  return (g.__hhcPublicDb ??= create(url));
}

export { schema };
