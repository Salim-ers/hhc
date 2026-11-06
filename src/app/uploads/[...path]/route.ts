import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

/**
 * Développement local uniquement : sert les images téléversées sans Vercel Blob
 * (Next ne sert pas les fichiers ajoutés à /public après la compilation).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (process.env.VERCEL) return new NextResponse("Not found", { status: 404 });
  const parts = (await params).path;
  if (parts.some((p) => p.includes("..") || p.includes("\\"))) return new NextResponse("Bad request", { status: 400 });
  const file = path.join(process.cwd(), "public", "uploads", ...parts);
  try {
    const body = await fs.readFile(file);
    const ext = path.extname(file).slice(1);
    const type = { webp: "image/webp", svg: "image/svg+xml", ico: "image/x-icon", png: "image/png", jpg: "image/jpeg" }[ext] ?? "application/octet-stream";
    return new NextResponse(body, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
