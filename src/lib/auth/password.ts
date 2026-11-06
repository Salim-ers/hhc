import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(_scrypt) as (pwd: string, salt: Buffer, keylen: number, opts: object) => Promise<Buffer>;

/** Paramètres scrypt (≈ 64 Mo de mémoire, recommandation OWASP). */
const N = 2 ** 16;
const r = 8;
const p = 1;
const KEYLEN = 64;
const MAXMEM = 128 * N * r * 2;

/** Format stocké : scrypt$N$r$p$salt(base64)$hash(base64) */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize("NFKC"), salt, KEYLEN, { N, r, p, maxmem: MAXMEM });
  return ["scrypt", N, r, p, salt.toString("base64"), hash.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, rr, pp, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scrypt(password.normalize("NFKC"), Buffer.from(saltB64, "base64"), expected.length, {
    N: Number(n),
    r: Number(rr),
    p: Number(pp),
    maxmem: 128 * Number(n) * Number(rr) * 2,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 12) return "Le mot de passe doit contenir au moins 12 caractères.";
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))
    return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
  return null;
}
