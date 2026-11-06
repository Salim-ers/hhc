import type { ImageValue, LinkValue } from "./section-registry";
import type { PublicPage } from "@/lib/data/types";

/** Accès typé et tolérant aux contenus de section (jamais de crash si un champ est vide). */
export function sectionOf(page: PublicPage | null, key: string) {
  const s = page?.sections.find((x) => x.key === key);
  const c = (s?.content ?? {}) as Record<string, unknown>;
  return {
    visible: s ? s.visible : false,
    text: (name: string, fallback = "") => (typeof c[name] === "string" && c[name] ? (c[name] as string) : fallback),
    image: (name: string): ImageValue | null => {
      const v = c[name] as ImageValue | undefined;
      return v && typeof v.url === "string" && v.url ? { url: v.url, alt: v.alt ?? "" } : null;
    },
    link: (name: string): LinkValue | null => {
      const v = c[name] as LinkValue | undefined;
      return v && v.label && v.href ? v : null;
    },
    list: <T extends Record<string, unknown>>(name: string): T[] => (Array.isArray(c[name]) ? (c[name] as T[]) : []),
  };
}

/** Ordre des sections tel que défini par l'administration. */
export const sectionOrder = (page: PublicPage | null) => page?.sections.map((s) => s.key) ?? [];
