import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { getSettings } from "@/lib/data/public";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

/* Polices auto-hébergées (aucun appel à Google Fonts : RGPD et performance). */
const bodoni = localFont({
  src: [
    { path: "./fonts/bodoni.woff2", style: "normal", weight: "400 900" },
    { path: "./fonts/bodoni-italic.woff2", style: "italic", weight: "400 900" },
  ],
  variable: "--font-bodoni",
  display: "swap",
});
const jost = localFont({
  src: [{ path: "./fonts/jost.woff2", style: "normal", weight: "300 600" }],
  variable: "--font-jost",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: `${s.seo.siteName} | Coiffure haut de gamme à domicile à Troyes`, template: `%s | ${s.seo.siteName}` },
    description: s.seo.defaultDescription,
    applicationName: s.seo.siteName,
    authors: [{ name: s.business.name }],
    formatDetection: { telephone: true, email: true },
    openGraph: { type: "website", locale: "fr_FR", siteName: s.seo.siteName },
    twitter: { card: "summary_large_image" },
    verification: s.seo.googleSiteVerification ? { google: s.seo.googleSiteVerification } : undefined,
    manifest: "/manifest.webmanifest",
    // Favicon importé depuis l'administration (sinon : monogramme officiel, src/app/icon.png).
    icons: s.branding.favicon ? { icon: s.branding.favicon, apple: s.branding.favicon } : undefined,
  };
}

export const viewport: Viewport = {
  themeColor: "#101010",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Le loader n'est montré qu'à la première visite de la session, jamais sans JavaScript. */
const introScript = `try{var d=document.documentElement;if(location.pathname.indexOf('/admin')!==0&&location.search.indexOf('sans-intro')<0&&!sessionStorage.getItem('hhc-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('intro')}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${bodoni.variable} ${jost.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        {/* Sans JavaScript, les éléments animés (data-reveal) s'affichent directement dans leur état final. */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}[data-cover]{display:none!important}"}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
