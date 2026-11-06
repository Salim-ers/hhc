export type NavItem = { key: string; label: string; href: string };

/** Navigation principale (l'ordre est celui de l'en-tête). */
export const MAIN_NAV: NavItem[] = [
  { key: "prestations", label: "Prestations", href: "/prestations" },
  { key: "tarifs", label: "Tarifs", href: "/tarifs" },
  { key: "coloriste-visagiste", label: "Coloriste & visagiste", href: "/coloriste-visagiste" },
  { key: "offres", label: "Offres", href: "/forfaits-offres" },
  { key: "galerie", label: "Galerie", href: "/galerie" },
  { key: "a-propos", label: "À propos", href: "/a-propos" },
];

export const SECONDARY_NAV: NavItem[] = [
  { key: "zone", label: "Zone d'intervention", href: "/zone-intervention" },
  { key: "bijoux", label: "Bijoux & cadeaux", href: "/bijoux-cadeaux" },
  { key: "contact", label: "Contact & rendez-vous", href: "/contact" },
];

export const LEGAL_NAV: NavItem[] = [
  { key: "mentions-legales", label: "Mentions légales", href: "/mentions-legales" },
  { key: "confidentialite", label: "Confidentialité", href: "/confidentialite" },
];

export function filterNav(items: NavItem[], statuses: Record<string, string>, modules: { bijoux: boolean }) {
  return items.filter((i) => statuses[i.key] !== "draft" && (i.key !== "bijoux" || modules.bijoux));
}
