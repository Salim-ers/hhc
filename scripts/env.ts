/** Charge .env.local puis .env (Node ≥ 20.12). */
for (const f of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(f);
  } catch {
    /* fichier absent */
  }
}
if (!process.env.DATABASE_URL) {
  console.error("✖ DATABASE_URL n'est pas défini (voir .env.example).");
  process.exit(1);
}
export {};
