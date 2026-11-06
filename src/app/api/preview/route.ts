import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

/** Aperçu des brouillons : réservé aux personnes connectées. ?path=/a-propos  ·  ?off=1 pour quitter. */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.searchParams.get("path") || "/";
  const safe = path.startsWith("/") && !path.startsWith("//") ? path : "/";
  const dm = await draftMode();
  if (url.searchParams.get("off")) {
    dm.disable();
    return NextResponse.redirect(new URL(safe, url.origin));
  }
  if (!(await getSessionUser())) return NextResponse.redirect(new URL("/admin/connexion", url.origin));
  dm.enable();
  const target = new URL(safe, url.origin);
  target.searchParams.set("sans-intro", "1");
  return NextResponse.redirect(target);
}
