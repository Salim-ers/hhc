import "./env";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import readline from "node:readline";
import * as schema from "../src/lib/db/schema";
import { hashPassword, validatePasswordStrength } from "../src/lib/auth/password";

/**
 * Crée (ou réinitialise) un compte d'administration.
 *   npm run admin:create
 * Variables optionnelles : ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD, ADMIN_ROLE (owner|editor)
 * Aucun mot de passe n'est jamais écrit dans le code source.
 */
function ask(question: string, hidden = false): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  return new Promise((resolve) => {
    if (hidden) {
      const rlAny = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
      rlAny._writeToOutput = (s: string) => {
        if (s.includes(question)) rlAny.output.write(s);
        else rlAny.output.write("•");
      };
    }
    rl.question(question, (a) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(a.trim());
    });
  });
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || (await ask("E-mail de connexion : "))).toLowerCase();
  const name = process.env.ADMIN_NAME || (await ask("Prénom affiché (ex. Angèle) : "));
  const role = (process.env.ADMIN_ROLE as "owner" | "editor") || "owner";
  const password = process.env.ADMIN_PASSWORD || (await ask("Mot de passe (12 caractères min.) : ", true));
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("E-mail invalide.");
  const weak = validatePasswordStrength(password);
  if (weak) throw new Error(weak);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const db = drizzle(pool, { schema });
  const passwordHash = await hashPassword(password);
  const [existing] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  if (existing) {
    await db.update(schema.users).set({ passwordHash, name, role, active: true }).where(eq(schema.users.id, existing.id));
    await db.delete(schema.sessions).where(eq(schema.sessions.userId, existing.id));
    console.log(`✓ Compte ${email} mis à jour (sessions précédentes révoquées).`);
  } else {
    await db.insert(schema.users).values({ email, name, role, passwordHash });
    console.log(`✓ Compte ${role === "owner" ? "propriétaire" : "éditeur"} créé pour ${email}.`);
  }
  await pool.end();
}

main().catch((e) => {
  console.error("✖", e instanceof Error ? e.message : e);
  process.exit(1);
});
