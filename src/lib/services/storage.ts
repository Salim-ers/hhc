import "server-only";
import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Stockage des images.
 * - Production : Vercel Blob (BLOB_READ_WRITE_TOKEN), URL publiques optimisées par Next/Image.
 * - Développement sans jeton : dossier local public/uploads (jamais en production).
 * Chaque image est normalisée : orientation corrigée, 2560 px max, WebP qualité 82, métadonnées EXIF supprimées.
 */
const MAX_BYTES = 12 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif", "image/gif", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"];

export type StoredImage = { url: string; pathname: string; width: number | null; height: number | null; size: number; mimeType: string };

export async function storeImage(file: File, folder = "media"): Promise<StoredImage> {
  if (!file || file.size === 0) throw new Error("Aucun fichier reçu.");
  if (file.size > MAX_BYTES) throw new Error("Image trop lourde (12 Mo maximum).");
  if (file.type && !ACCEPTED.includes(file.type)) throw new Error("Format non pris en charge. Utilisez JPG, PNG, WebP ou HEIC.");

  const input = Buffer.from(await file.arrayBuffer());
  const base = (file.name || "image").replace(/\.[^.]+$/, "").normalize("NFD").replace(/[^\w-]+/g, "-").toLowerCase().slice(0, 40) || "image";
  const id = randomBytes(5).toString("hex");

  let body: Buffer;
  let ext: string;
  let mimeType: string;
  let width: number | null = null;
  let height: number | null = null;

  const isVector = file.type === "image/svg+xml" || file.type.includes("icon");
  if (isVector) {
    body = input;
    ext = file.type === "image/svg+xml" ? "svg" : "ico";
    mimeType = file.type;
  } else {
    const img = sharp(input, { failOn: "error" }).rotate().resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true });
    body = await img.webp({ quality: 82 }).toBuffer();
    const meta = await sharp(body).metadata();
    width = meta.width ?? null;
    height = meta.height ?? null;
    ext = "webp";
    mimeType = "image/webp";
  }
  const pathname = `${folder}/${base}-${id}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(pathname, body, { access: "public", contentType: mimeType, addRandomSuffix: false });
    return { url: blob.url, pathname: blob.pathname, width, height, size: body.length, mimeType };
  }
  if (process.env.VERCEL) throw new Error("Stockage non configuré : ajoutez BLOB_READ_WRITE_TOKEN (Vercel Blob).");
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(process.cwd(), "public", "uploads", pathname), body);
  return { url: `/uploads/${pathname}`, pathname, width, height, size: body.length, mimeType };
}

export async function deleteStoredImage(url: string) {
  try {
    if (url.includes(".blob.vercel-storage.com") && process.env.BLOB_READ_WRITE_TOKEN) {
      const { del } = await import("@vercel/blob");
      await del(url);
    } else if (url.startsWith("/uploads/")) {
      await fs.unlink(path.join(process.cwd(), "public", url));
    }
  } catch (e) {
    console.warn("[storage] suppression impossible", url, e);
  }
}
