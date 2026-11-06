import { NextResponse, type NextRequest } from "next/server";

/**
 * Garde rapide de l'administration : sans cookie de session, redirection vers la connexion.
 * La VRAIE vérification (session valide en base, rôle) est faite côté serveur dans chaque
 * page et chaque action d'administration (requireUser / assertUser).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/connexion")) {
    if (!req.cookies.get("hhc_session")?.value) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/connexion";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
