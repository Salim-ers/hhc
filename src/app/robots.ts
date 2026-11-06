import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";

/** Indexation ouverte (moteurs et assistants IA), administration exclue. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: siteUrl("/sitemap.xml"),
    host: siteUrl(),
  };
}
