import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 3000 → « 30 € » ; 3050 → « 30,50 € » (espace insécable avant €). */
export function formatPrice(cents: number | null | undefined): string {
  if (cents == null) return "Sur devis";
  const euros = cents / 100;
  const hasDecimals = cents % 100 !== 0;
  return (
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(euros) + " €"
  );
}

export const telHref = (e164: string) => `tel:${e164.replace(/[^+\d]/g, "")}`;

export function siteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.hairhomeconcept.com").replace(/\/$/, "");
  return `${base}${path}`;
}

/** Sépare un texte en paragraphes (double retour à la ligne). */
export const paragraphs = (s: string | undefined | null) =>
  (s ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
