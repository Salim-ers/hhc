import type { MetadataRoute } from "next";
import { PAGES } from "@/lib/content/section-registry";
import { getPageStatuses, getSettings } from "@/lib/data/public";
import { siteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [statuses, settings] = await Promise.all([getPageStatuses(), getSettings()]);
  const priority: Record<string, number> = { home: 1, prestations: 0.9, contact: 0.8, zone: 0.8, "coloriste-visagiste": 0.8, offres: 0.7 };
  return PAGES.filter((p) => statuses[p.key] !== "draft" && (p.key !== "bijoux" || settings.modules.bijoux)).map((p) => ({
    url: siteUrl(p.path),
    lastModified: new Date(),
    changeFrequency: p.key === "prestations" || p.key === "offres" ? "weekly" : "monthly",
    priority: priority[p.key] ?? 0.5,
  }));
}
