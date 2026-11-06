/**
 * PostgreSQL local pour le développement (sans compte Neon).
 *   npm run db:local     → démarre Postgres sur le port 5433 (données dans .local-postgres/)
 * Puis, dans .env.local :
 *   DATABASE_URL=postgres://postgres:postgres@localhost:5433/hhc
 */
import EmbeddedPostgres from "embedded-postgres";
import fs from "node:fs";

async function main() {
  const dir = process.env.LOCAL_PG_DIR ?? ".local-postgres";
  const fresh = !fs.existsSync(dir);
  const pg = new EmbeddedPostgres({ databaseDir: dir, user: "postgres", password: "postgres", port: 5433, persistent: true });
  if (fresh) await pg.initialise();
  await pg.start();
  if (fresh) await pg.createDatabase("hhc");
  console.log("✓ PostgreSQL local prêt : postgres://postgres:postgres@localhost:5433/hhc (Ctrl+C pour arrêter)");
  const stop = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  setInterval(() => {}, 1 << 30);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
