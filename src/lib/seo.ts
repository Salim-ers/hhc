import type { Metadata } from "next";
import { getPage } from "@/lib/data/public";
import { getPageDef } from "@/lib/content/section-registry";
import { siteUrl } from "@/lib/utils";

/** Métadonnées uniques par page, éditables depuis l'administration (Contenus → SEO). */
export async function pageMetadata(key: string, fallbackImage?: string): Promise<Metadata> {
  const def = getPageDef(key);
  const page = await getPage(key);
  const title = page?.seoTitle || def?.seoTitle || "Hair Home Concept";
  const description = page?.seoDescription || def?.seoDescription;
  const path = def?.path ?? "/";
  const image = page?.ogImageUrl || fallbackImage;
  return {
    title: key === "home" ? { absolute: `${title} | Hair Home Concept` } : title,
    description,
    alternates: { canonical: siteUrl(path) },
    robots: page?.status === "draft" ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: siteUrl(path),
      images: image ? [{ url: image.includes("images.unsplash.com") ? `${image}?w=1200&h=630&fit=crop&q=75` : image, width: 1200, height: 630 }] : undefined,
    },
  };
}
