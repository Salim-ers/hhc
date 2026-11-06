import type { NextConfig } from "next";

/** Anciennes URL (IziSpot) → nouvelles pages : redirections 301 pour préserver le référencement. */
const legacyRedirects: [string, string][] = [
  ["/accueil_243.htm", "/"],
  ["/avantages_244.htm", "/prestations"],
  ["/mes_competences_245.htm", "/a-propos"],
  ["/offres___forfaits___formules_246.htm", "/forfaits-offres"],
  ["/prestige___exclusivite_247.htm", "/forfaits-offres"],
  ["/perso_307.htm", "/forfaits-offres"],
  ["/flyer_249.htm", "/forfaits-offres"],
  ["/bijoux_251.htm", "/bijoux-cadeaux"],
  ["/ma_passion_257.htm", "/a-propos"],
  ["/hommes___etudiants___enfants_258.htm", "/prestations#homme"],
  ["/femmes___etudiantes___enfants_259.htm", "/prestations#femme"],
  ["/a_la_carte_260.htm", "/prestations#a-la-carte"],
  // La page Tarifs a été fusionnée dans « Prestations & tarifs » (l'ancre #categorie est conservée par le navigateur).
  ["/tarifs", "/prestations"],
  ["/contact_261.htm", "/contact"],
  ["/photos_262.htm", "/galerie"],
];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920, 2560, 3840],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
    // Administration : une page déjà vue (dynamic) ou préchargée par le menu (static) s'affiche
    // instantanément ; ses données ont au plus 30 s, et toute modification enregistrée vide ce cache
    // (revalidation dans actions-core). Le survol d'un lien recharge une entrée périmée.
    staleTimes: { dynamic: 30, static: 30 },
  },
  async redirects() {
    return legacyRedirects.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
