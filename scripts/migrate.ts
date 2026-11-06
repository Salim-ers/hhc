import "./env";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

async function main() {
  const url = process.env.DATABASE_URL!;
  const pool = new Pool({ connectionString: url, max: 1 });
  console.log("→ Application des migrations…");
  await migrate(drizzle(pool), { migrationsFolder: "drizzle" });
  await pool.end();
  console.log("✓ Base de données à jour.");
}

main().catch((e) => {
  console.error("✖ Migration échouée :", e);
  process.exit(1);
});
