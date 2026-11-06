import { stock } from "./stock-images";

/**
 * DONNÉES INITIALES — importées de l'ancien site hairhomeconcept.com (consulté le 06/11/2026).
 *
 * Ces données servent UNIQUEMENT à initialiser la base de données (scripts/seed.ts).
 * Le site lit toujours les tarifs depuis la base ; ce fichier n'est utilisé directement
 * qu'en mode démonstration, lorsque aucune base n'est encore configurée.
 *
 * Tous les tarifs sont marqués `needsReview` : ils doivent être confirmés par la cliente
 * avant la mise en production.
 *
 * Interprétation des astérisques de l'ancien site (à valider) :
 *   *    → supplément de 13 € pour cheveux longs ou épais
 *   **   → supplément + coupe offerte par l'enseigne
 *   ***  → forfait Beauty Color (prestation régulière) + coupe offerte + supplément
 */

export const LONG_HAIR = "Cheveux longs ou épais";
const SUPP = 13;

export type SeedService = {
  section?: string;
  name: string;
  description?: string;
  price: number | null;
  from?: boolean;
  compareAt?: number;
  /** Variante « cheveux longs ou épais » à prix fixe. */
  long?: number;
  /** Supplément 13 € cheveux longs ou épais. */
  supplement?: boolean;
  conditions?: string;
  badge?: string;
  image?: { url: string; alt: string };
};

export type SeedCategory = {
  slug: string;
  label: string;
  intro?: string;
  footnote?: string;
  services: SeedService[];
};

const COUPE_OFFERTE = "Coupe offerte";

export const seedCategories: SeedCategory[] = [
  {
    slug: "femme",
    label: "Femme",
    intro: "Shampooing, coupe et modelage : la base d'une chevelure qui vous ressemble.",
    services: [
      { section: "Coiffage", name: "Shampooing · Modelage", description: "Shampooing et mise en forme (brushing).", price: 23, long: 29 },
      { section: "Coiffage", name: "Shampooing · Mise en plis", description: "Shampooing et mise en plis traditionnelle.", price: 23, long: 29 },
      { section: "Coupe", name: "Shampooing · Coupe · Modelage", description: "La coupe sur mesure, de la préparation au coiffage.", price: 30, long: 36, image: stock.portraitBlonde },
      { section: "Coupe", name: "Shampooing · Coupe · Mise en plis", description: "La coupe, finie par une mise en plis.", price: 30, long: 36 },
      { section: "Coiffures d'exception", name: "Coiffure · Attaches · Boucles", description: "Chignons, attaches et boucles pour vos cérémonies et événements.", price: 40, supplement: true, image: stock.chignonJewel },
    ],
  },
  {
    slug: "homme",
    label: "Homme",
    intro: "Une coupe nette et structurée, réalisée chez vous ou au bureau.",
    services: [
      { section: "Coupe", name: "Shampooing · Modelage", price: 20, long: 26 },
      { section: "Coupe", name: "Shampooing · Coupe · Modelage", description: "La coupe homme, du shampooing aux finitions.", price: 23, long: 29, image: stock.menScissors },
      { section: "Barbe & soin", name: "Barbe", description: "Lors d'une prestation de coiffure.", price: 8 },
      { section: "Barbe & soin", name: "Barbe seule", description: "Déplacement uniquement pour la barbe.", price: 15 },
      { section: "Barbe & soin", name: "Soin", price: 6 },
      { section: "Couleur & techniques", name: "Couleur · Shampooing · Coupe · Modelage", price: 50, supplement: true, badge: COUPE_OFFERTE },
      { section: "Couleur & techniques", name: "Mèches ou balayage · Shampooing · Coupe · Modelage", price: 60, supplement: true, badge: COUPE_OFFERTE },
      { section: "Couleur & techniques", name: "Décoloration · Shampooing · Coupe · Modelage", price: 60, supplement: true, badge: COUPE_OFFERTE },
      { section: "Couleur & techniques", name: "Décoloration · Patine · Shampooing · Coupe · Modelage", price: 70, supplement: true, badge: COUPE_OFFERTE },
      { section: "Couleur & techniques", name: "Décollement de racines ou permanente · Shampooing · Coupe · Modelage", price: 60, supplement: true, badge: COUPE_OFFERTE },
      { section: "Couleur & techniques", name: "Décollement de racines ou permanente sans ammoniaque · Coupe · Modelage", price: 75, supplement: true, badge: COUPE_OFFERTE },
      { section: "Couleur & techniques", name: "Décollement de racines ou permanente · Color Touch · Shampooing · Coupe · Modelage", price: 75, supplement: true, badge: COUPE_OFFERTE },
      { section: "Couleur & techniques", name: "Décollement de racines ou permanente sans ammoniaque · Color Touch · Shampooing · Coupe · Modelage", price: 85, supplement: true, badge: COUPE_OFFERTE },
      { section: "Couleur & techniques", name: "Défrisage · Shampooing · Coupe · Modelage", price: 75, supplement: true, badge: COUPE_OFFERTE },
      { section: "Création de tons pastels ou gris", name: "Décoloration · Shampooing · Coupe · Modelage", price: 60, supplement: true, badge: COUPE_OFFERTE },
      { section: "Création de tons pastels ou gris", name: "Deuxième décoloration", description: "Pour réaliser les tons pastels ou gris.", price: 36, supplement: true },
      { section: "Création de tons pastels ou gris", name: "Tons pastels ou gris", price: 16, long: 20 },
    ],
  },
  {
    slug: "enfant",
    label: "Enfant",
    intro: "Des moments doux et ludiques, sans attente, à la maison.",
    services: [
      { name: "Shampooing · Coupe · Modelage", description: "La coupe enfant, en toute sérénité.", price: 16, image: stock.kidCut },
      { name: "Coiffure · Attaches · Boucles", description: "Pour les fêtes, cérémonies et grandes occasions.", price: 35, long: 40 },
    ],
  },
  {
    slug: "etudiant",
    label: "Étudiant",
    intro: "Profitez de −10 % sur l'ensemble des prestations, sur présentation de la carte étudiante.",
    footnote: "Uniquement sur présentation de la carte étudiante.",
    services: [
      { name: "Étudiante · Shampooing · Coupe · Modelage", price: 27, supplement: true, conditions: "Sur présentation de la carte étudiante." },
      { name: "Étudiant · Shampooing · Coupe · Modelage", price: 21, conditions: "Sur présentation de la carte étudiante." },
    ],
  },
  {
    slug: "coloration",
    label: "Coloration",
    intro: "Couleur, Beauty Color, décoloration et effets : la nuance juste, posée avec précision.",
    services: [
      { section: "Couleur", name: "Couleur · Shampooing · Modelage", description: "La coupe est offerte si vous le souhaitez.", price: 50, supplement: true, badge: COUPE_OFFERTE, image: stock.colorFoil },
      { section: "Beauty Color", name: "Beauty Color · Couleur · Shampooing · Modelage", description: "Le forfait d'entretien de votre couleur, pour une prestation régulière. Coupe offerte.", price: 40, compareAt: 50, supplement: true, badge: "Forfait", conditions: "Pour une prestation régulière (mensuelle)." },
      { section: "Décoloration", name: "Décoloration · Shampooing · Modelage", description: "Coupe offerte si souhaitée.", price: 60, supplement: true, badge: COUPE_OFFERTE },
      { section: "Création de tons pastels ou gris", name: "Décoloration · Shampooing · Modelage", description: "Première étape vers les tons pastels ou gris. Coupe offerte si souhaitée.", price: 60, supplement: true, badge: COUPE_OFFERTE },
      { section: "Création de tons pastels ou gris", name: "Deuxième décoloration", description: "Pour réaliser les tons pastels ou gris.", price: 36, supplement: true },
      { section: "Effets & finitions", name: "Tons pastels ou gris", price: 16, long: 20 },
      { section: "Effets & finitions", name: "Mèches multicolores", price: 7 },
      { section: "Effets & finitions", name: "Bordures Color", price: 7 },
      { section: "Effets & finitions", name: "Effet lumière · Patine", price: 14, long: 18 },
      { section: "Effets & finitions", name: "Transparence · Flash", price: 14, long: 18 },
      { section: "Effets & finitions", name: "Transparence · Flash + Patine", price: 20, long: 24 },
      { section: "Effets & finitions", name: "Mordançage · Précoloration", price: 14, long: 18 },
    ],
  },
  {
    slug: "balayage-meches",
    label: "Balayage & mèches",
    intro: "Des éclats naturels ou affirmés, pour une lumière qui dure.",
    services: [
      { section: "Balayage", name: "Balayage · Shampooing · Modelage", description: "Coupe offerte si souhaitée.", price: 50, supplement: true, badge: COUPE_OFFERTE, image: stock.balayageBlonde },
      { section: "Balayage", name: "Balayage · Couleur · Shampooing · Modelage", description: "Coupe offerte si souhaitée.", price: 65, supplement: true, badge: COUPE_OFFERTE },
      { section: "Balayage", name: "Beauty Color Balayage", description: "Balayage, couleur, shampooing et modelage, pour une prestation régulière. Coupe offerte.", price: 55, compareAt: 65, supplement: true, badge: "Forfait", conditions: "Pour une prestation régulière (mensuelle)." },
      { section: "Mèches", name: "Mèches · Shampooing · Modelage", description: "Coupe offerte si souhaitée.", price: 60, supplement: true, badge: COUPE_OFFERTE, image: stock.balayageCaramel },
      { section: "Mèches", name: "Mèches · Couleur · Shampooing · Modelage", description: "Coupe offerte si souhaitée.", price: 75, supplement: true, badge: COUPE_OFFERTE },
      { section: "Mèches", name: "Beauty Color Mèches", description: "Mèches, couleur, shampooing et modelage, pour une prestation régulière. Coupe offerte.", price: 65, compareAt: 75, supplement: true, badge: "Forfait", conditions: "Pour une prestation régulière (mensuelle)." },
    ],
  },
  {
    slug: "soins-techniques",
    label: "Soins & techniques",
    intro: "Volume, forme, lissage et soins : la matière travaillée en profondeur.",
    services: [
      { section: "Soins", name: "Soin", price: 6, image: stock.hairTexture },
      { section: "Soins", name: "Renforçateur", price: 6 },
      { section: "Soins", name: "Sourcils", price: 7 },
      { section: "Décollement de racines ou permanente", name: "Permanente · Shampooing · Modelage", description: "Coupe offerte si souhaitée.", price: 60, supplement: true, badge: COUPE_OFFERTE },
      { section: "Décollement de racines ou permanente", name: "Permanente sans ammoniaque · Shampooing · Modelage", description: "Coupe offerte si souhaitée.", price: 75, supplement: true, badge: COUPE_OFFERTE },
      { section: "Décollement de racines ou permanente", name: "Permanente · Color Touch · Shampooing · Modelage", description: "Coupe offerte si souhaitée.", price: 75, supplement: true, badge: COUPE_OFFERTE },
      { section: "Décollement de racines ou permanente", name: "Permanente sans ammoniaque · Color Touch · Shampooing · Modelage", description: "Coupe offerte si souhaitée.", price: 85, supplement: true, badge: COUPE_OFFERTE },
      { section: "Défrisage", name: "Défrisage · Shampooing · Modelage", description: "Coupe offerte si souhaitée.", price: 75, supplement: true, badge: COUPE_OFFERTE },
    ],
  },
  {
    slug: "a-la-carte",
    label: "À la carte",
    intro: "Composez votre prestation, étape par étape.",
    services: [
      { section: "Femme", name: "Shampooing", price: 6 },
      { section: "Femme", name: "Coupe", price: 28, long: 34 },
      { section: "Femme", name: "Modelage", price: 22, long: 28 },
      { section: "Femme", name: "Couleur", price: 45, supplement: true },
      { section: "Femme", name: "Balayage", price: 45, supplement: true },
      { section: "Femme", name: "Mèches", price: 55, supplement: true },
      { section: "Femme", name: "Décoloration", price: 55, supplement: true },
      { section: "Femme", name: "Décollement de racines ou permanente", price: 55, supplement: true },
      { section: "Femme", name: "Décollement de racines ou permanente sans ammoniaque", price: 70, supplement: true },
      { section: "Femme", name: "Défrisage", price: 70, supplement: true },
      { section: "Homme", name: "Shampooing", price: 6 },
      { section: "Homme", name: "Coupe", price: 21, long: 27 },
      { section: "Homme", name: "Modelage", price: 19, long: 25 },
      { section: "Homme", name: "Couleur", price: 45, supplement: true },
      { section: "Homme", name: "Balayage", price: 45, supplement: true },
      { section: "Homme", name: "Mèches", price: 55, supplement: true },
      { section: "Homme", name: "Décoloration", price: 55, supplement: true },
      { section: "Homme", name: "Décollement de racines ou permanente", price: 55, supplement: true },
      { section: "Homme", name: "Décollement de racines ou permanente sans ammoniaque", price: 70, supplement: true },
      { section: "Homme", name: "Barbe", price: 15 },
    ],
  },
  {
    slug: "forfaits",
    label: "Forfaits",
    intro: "Les formules d'entretien et de fidélité, présentées sur la page Forfaits & offres.",
    services: [],
  },
];

export const SUPPLEMENT = { label: LONG_HAIR, amount: SUPP };

/* ────────────────────────────────────────────────────────────────
 * Offres (page Forfaits & offres + onglet Forfaits)
 * ──────────────────────────────────────────────────────────────── */

export type SeedOffer = {
  slug: string;
  kind: "forfait" | "formule" | "promotion" | "parrainage" | "bon_cadeau" | "banniere";
  title: string;
  subtitle?: string;
  description?: string;
  price?: number;
  compareAt?: number;
  priceLabel?: string;
  items: string[];
  conditions?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: { url: string; alt: string };
  highlight?: boolean;
  status: "draft" | "published";
};

export const seedOffers: SeedOffer[] = [
  {
    slug: "beauty-color",
    kind: "forfait",
    title: "Beauty Color",
    subtitle: "L'entretien régulier de votre couleur",
    description: "Couleur, shampooing, coupe et modelage, à tarif privilégié pour un rendez-vous régulier.",
    price: 40,
    compareAt: 50,
    items: ["Couleur", "Shampooing", "Coupe offerte", "Modelage"],
    conditions: "S'applique pour une prestation mensuelle régulière. Supplément cheveux longs ou épais : 13 €.",
    ctaLabel: "Réserver ce forfait",
    image: stock.balayageCaramel,
    highlight: true,
    status: "published",
  },
  {
    slug: "beauty-color-balayage",
    kind: "forfait",
    title: "Beauty Color Balayage",
    subtitle: "Couleur et lumière, en continu",
    description: "Couleur, balayage, shampooing, coupe et modelage.",
    price: 55,
    compareAt: 65,
    items: ["Couleur", "Balayage", "Shampooing", "Coupe offerte", "Modelage"],
    conditions: "S'applique pour une prestation mensuelle régulière. Supplément cheveux longs ou épais : 13 €.",
    ctaLabel: "Réserver ce forfait",
    image: stock.balayageBlonde,
    highlight: true,
    status: "published",
  },
  {
    slug: "beauty-color-meches",
    kind: "forfait",
    title: "Beauty Color Mèches",
    subtitle: "Des reflets entretenus avec soin",
    description: "Couleur, mèches, shampooing, coupe et modelage.",
    price: 65,
    compareAt: 75,
    items: ["Couleur", "Mèches", "Shampooing", "Coupe offerte", "Modelage"],
    conditions: "S'applique pour une prestation mensuelle régulière. Supplément cheveux longs ou épais : 13 €.",
    ctaLabel: "Réserver ce forfait",
    image: stock.ombreAsh,
    highlight: true,
    status: "published",
  },
  {
    slug: "forfait-hair",
    kind: "forfait",
    title: "Forfait'Hair",
    subtitle: "En famille ou entre amis",
    description: "Réunissez-vous et profitez d'un tarif avantageux sur toutes les prestations.",
    priceLabel: "−10 %",
    items: ["Sur l'ensemble des prestations", "Une seule visite pour tout le groupe"],
    conditions: "À partir de 4 personnes.",
    ctaLabel: "Organiser un rendez-vous",
    status: "published",
  },
  {
    slug: "formul-hair",
    kind: "formule",
    title: "Formul'Hair",
    subtitle: "5 modelages dont 1 offert",
    price: 65,
    priceLabel: "65 € les 5 modelages",
    items: ["5 modelages dont 1 offert", "Cheveux longs ou épais : 89 €", "Valable 1 an"],
    conditions: "Valable 1 an à compter de l'achat.",
    ctaLabel: "Choisir cette formule",
    status: "published",
  },
  {
    slug: "modelage-illimite",
    kind: "formule",
    title: "Modelage illimité",
    subtitle: "Votre brushing, deux fois par semaine",
    price: 97,
    priceLabel: "97 € par mois",
    items: ["Dont 2 modelages offerts", "2 modelages par semaine", "Cheveux longs ou épais : 133 € par mois"],
    conditions: "Jusqu'à 2 modelages par semaine.",
    ctaLabel: "Choisir cette formule",
    status: "published",
  },
  {
    slug: "carte-parrainage",
    kind: "parrainage",
    title: "Carte de parrainage",
    subtitle: "Partagez, profitez",
    description: "Parrainez 3 nouveaux clients et profitez de −15 % sur l'ensemble des prestations.",
    priceLabel: "−15 %",
    items: ["3 nouveaux clients parrainés", "Sur l'ensemble des prestations"],
    ctaLabel: "En savoir plus",
    status: "published",
  },
  {
    slug: "offre-bienvenue",
    kind: "parrainage",
    title: "Offre de bienvenue",
    subtitle: "Pour votre premier rendez-vous",
    description: "Faites-vous parrainer et profitez de −10 % sur l'ensemble des prestations.",
    priceLabel: "−10 %",
    items: ["Sur l'ensemble des prestations", "Avec un parrain ou une marraine"],
    conditions: "Uniquement pour les nouveaux clients, sauf enfants.",
    ctaLabel: "Prendre rendez-vous",
    status: "published",
  },
  {
    slug: "tarif-etudiant",
    kind: "promotion",
    title: "Tarif étudiant",
    subtitle: "Étudiantes et étudiants",
    description: "Profitez de −10 % sur l'ensemble des prestations.",
    priceLabel: "−10 %",
    items: ["Sur l'ensemble des prestations"],
    conditions: "Uniquement sur présentation de la carte étudiante.",
    ctaLabel: "Voir les tarifs étudiants",
    ctaHref: "/prestations#etudiant",
    status: "published",
  },
  {
    slug: "bon-cadeau",
    kind: "bon_cadeau",
    title: "Bon cadeau",
    subtitle: "Coiffure & bijoux",
    description: "Faites plaisir à vos proches et personnalisez-le selon leurs désirs ou leurs besoins.",
    priceLabel: "Montant libre",
    items: ["Personnalisable", "Coiffure et bijoux"],
    ctaLabel: "Demander un bon cadeau",
    image: stock.jewelTray,
    status: "published",
  },
  {
    slug: "offre-du-mois",
    kind: "banniere",
    title: "L'offre du mois",
    description: "Chaque mois, une remise ou une prestation offerte : découvrez l'offre en cours.",
    items: [],
    ctaLabel: "En profiter",
    ctaHref: "/forfaits-offres",
    // Non confirmée : reste en brouillon tant qu'Angèle ne l'a pas définie et publiée.
    status: "draft",
  },
];

/* ────────────────────────────────────────────────────────────────
 * Expertises (page Prestations)
 * ──────────────────────────────────────────────────────────────── */

export const seedExpertises = [
  {
    slug: "coupes-femmes",
    kicker: "Femmes",
    title: "Coupes & coiffages",
    summary: "Une coupe pensée pour votre visage, votre matière et votre quotidien, finie par un modelage ou une mise en plis.",
    highlights: ["Shampooing, coupe, modelage", "Mise en plis", "Cheveux longs ou épais"],
    image: stock.portraitBlonde,
    priceCategorySlug: "femme",
  },
  {
    slug: "coupes-hommes",
    kicker: "Hommes",
    title: "Coupes hommes & barbe",
    summary: "Des lignes nettes, des finitions précises et la barbe entretenue, sans passer par le salon.",
    highlights: ["Coupe & modelage", "Barbe", "Couleur & techniques"],
    image: stock.menPortrait,
    priceCategorySlug: "homme",
  },
  {
    slug: "enfants",
    kicker: "Enfants",
    title: "Coiffure enfants",
    summary: "Une coupe douce et rassurante, à la maison, et de jolies attaches pour les grandes occasions.",
    highlights: ["Coupe enfant", "Attaches & boucles"],
    image: stock.kidCurls,
    priceCategorySlug: "enfant",
  },
  {
    slug: "coloration",
    kicker: "Couleur",
    title: "Coloration & techniques",
    summary: "Couleur, Beauty Color, décoloration, tons pastels ou gris, patines et transparences.",
    highlights: ["Beauty Color", "Tons pastels ou gris", "Patine & flash"],
    image: stock.colorFoil,
    priceCategorySlug: "coloration",
  },
  {
    slug: "balayages-meches",
    kicker: "Lumière",
    title: "Balayages & mèches",
    summary: "Des éclats posés avec précision, du plus naturel au plus lumineux.",
    highlights: ["Balayage", "Mèches", "Beauty Color Balayage & Mèches"],
    image: stock.balayageBlonde,
    priceCategorySlug: "balayage-meches",
  },
  {
    slug: "soins",
    kicker: "Matière",
    title: "Soins & prestations spécifiques",
    summary: "Soins, renforçateur, décollement de racines, permanente, Color Touch et défrisage.",
    highlights: ["Soin & renforçateur", "Permanente sans ammoniaque", "Défrisage"],
    image: stock.hairTexture,
    priceCategorySlug: "soins-techniques",
  },
  {
    slug: "domicile",
    kicker: "Chez vous",
    title: "Prestations à domicile",
    summary: "Toute la famille coiffée en une visite, des rendez-vous entre amis, un accompagnement à mobilité réduite.",
    highlights: ["Forfait'Hair dès 4 personnes", "Déplacement offert à Troyes", "Du lundi au samedi, 9h–20h"],
    image: stock.stylingWaves,
    priceCategorySlug: "forfaits",
  },
];

/* ────────────────────────────────────────────────────────────────
 * FAQ, galerie, zones
 * ──────────────────────────────────────────────────────────────── */

export const seedFaqs = [
  {
    q: "Avez-vous un salon où je peux me rendre ?",
    a: "Non. Hair Home Concept est un service exclusivement à domicile : Angèle se déplace chez vous, équipée de tout le nécessaire.",
  },
  {
    q: "Dans quelles communes vous déplacez-vous ?",
    a: "À Troyes, Sainte-Savine et dans toute l'agglomération troyenne, où le déplacement est offert. En dehors de cette zone, des frais de déplacement s'appliquent selon la distance.",
  },
  {
    q: "Quels sont vos horaires ?",
    a: "Les prestations sont réalisées du lundi au samedi, de 9h à 20h, en journée continue. Après 20h, le dimanche et les jours fériés, une intervention est possible sur devis avec une majoration de 20 %.",
  },
  {
    q: "Comment se passe la prise de rendez-vous ?",
    a: "Envoyez une demande via le formulaire ou appelez le 06 98 94 96 63. Votre demande n'est pas une réservation automatique : Angèle vous recontacte pour confirmer la date et l'heure.",
  },
  {
    q: "Proposez-vous des tarifs pour les familles ou les groupes ?",
    a: "Oui : avec le Forfait'Hair, profitez de −10 % sur l'ensemble des prestations à partir de 4 personnes.",
  },
  {
    q: "Y a-t-il un supplément pour les cheveux longs ?",
    a: "Pour les prestations signalées, un supplément de 13 € s'applique aux cheveux longs ou épais. Certaines prestations ont directement un tarif dédié.",
  },
  {
    q: "Vous déplacez-vous chez les personnes à mobilité réduite ?",
    a: "Bien sûr. L'un des engagements de Hair Home Concept est de permettre aux personnes qui ne peuvent pas se déplacer d'accéder aux mêmes prestations de qualité.",
  },
];

export const seedGallery: { image: { url: string; alt: string }; category: string; layout: "portrait" | "landscape" | "tall" | "square" }[] = [
  { image: stock.heroHairMotion, category: "couleur", layout: "tall" },
  { image: stock.balayageBlonde, category: "balayage", layout: "portrait" },
  { image: stock.chignonJewel, category: "coiffure", layout: "portrait" },
  { image: stock.menScissors, category: "homme", layout: "square" },
  { image: stock.balayageCaramel, category: "balayage", layout: "tall" },
  { image: stock.portraitBlonde, category: "coupe", layout: "portrait" },
  { image: stock.updoCopper, category: "coiffure", layout: "square" },
  { image: stock.balayageAsh, category: "couleur", layout: "portrait" },
  { image: stock.kidCut, category: "enfant", layout: "portrait" },
  { image: stock.wavesBrunette, category: "coupe", layout: "tall" },
  { image: stock.bridalHalfUp, category: "coiffure", layout: "portrait" },
  { image: stock.menBeard, category: "homme", layout: "portrait" },
  { image: stock.ombreAsh, category: "couleur", layout: "square" },
  { image: stock.curlsDark, category: "coupe", layout: "portrait" },
  { image: stock.bridalBun, category: "coiffure", layout: "tall" },
  { image: stock.kidCurls, category: "enfant", layout: "square" },
  { image: stock.redHair, category: "couleur", layout: "portrait" },
  { image: stock.wavesBlonde, category: "balayage", layout: "portrait" },
];

export const GALLERY_CATEGORIES: { value: string; label: string }[] = [
  { value: "coupe", label: "Coupes" },
  { value: "couleur", label: "Couleurs" },
  { value: "balayage", label: "Balayages & mèches" },
  { value: "coiffure", label: "Coiffures d'exception" },
  { value: "homme", label: "Hommes" },
  { value: "enfant", label: "Enfants" },
];

/** Communes de l'agglomération troyenne — liste indicative à confirmer par la cliente. */
export const seedAreas: { name: string; postalCode: string; included: boolean }[] = [
  { name: "Troyes", postalCode: "10000", included: true },
  { name: "Sainte-Savine", postalCode: "10300", included: true },
  { name: "La Chapelle-Saint-Luc", postalCode: "10600", included: true },
  { name: "Saint-André-les-Vergers", postalCode: "10120", included: true },
  { name: "Saint-Julien-les-Villas", postalCode: "10800", included: true },
  { name: "Rosières-près-Troyes", postalCode: "10430", included: true },
  { name: "Pont-Sainte-Marie", postalCode: "10150", included: true },
  { name: "Les Noës-près-Troyes", postalCode: "10420", included: true },
  { name: "Saint-Parres-aux-Tertres", postalCode: "10410", included: true },
  { name: "Bréviandes", postalCode: "10450", included: true },
  { name: "La Rivière-de-Corps", postalCode: "10440", included: true },
  { name: "Saint-Germain", postalCode: "10120", included: true },
  { name: "Lavau", postalCode: "10150", included: true },
  { name: "Creney-près-Troyes", postalCode: "10150", included: true },
  { name: "Barberey-Saint-Sulpice", postalCode: "10600", included: true },
  { name: "Torvilliers", postalCode: "10440", included: true },
];

/* ────────────────────────────────────────────────────────────────
 * Paramètres
 * ──────────────────────────────────────────────────────────────── */

export const defaultSettings = {
  business: {
    name: "Hair Home Concept",
    tagline: "La coiffure autrement…",
    ownerName: "Angèle",
    ownerTitle: "Maître artisan coiffeuse, coloriste & visagiste",
    phone: "06 98 94 96 63",
    phoneE164: "+33698949663",
    email: "hairhomeconcept@gmail.com",
    city: "Sainte-Savine",
    postalCode: "10300",
    region: "Grand Est",
    whatsappEnabled: false,
    whatsappNumber: "",
  },
  hours: {
    summary: "Du lundi au samedi, de 9h à 20h, en journée continue",
    calls: "Appels de 9h à 20h · messagerie 24h/24, 7j/7",
    opens: "09:00",
    closes: "20:00",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    extra: "Après 20h, dimanches et jours fériés : sur devis, majoration de 20 %.",
  },
  travel: {
    included: "Déplacement offert à Troyes et dans son agglomération.",
    outside: "En dehors de cette zone, des frais de déplacement s'appliquent selon la distance.",
    mapQuery: "Troyes, France",
    lat: 48.2973,
    lng: 4.0744,
    radiusKm: 9,
  },
  social: {
    facebook: "https://www.facebook.com/AngeleMatHHC/",
    facebookHairHome: "https://www.facebook.com/HairHomeConcept",
    facebookBijoux: "https://www.facebook.com/BijouxHomeConcept",
    instagram: "",
  },
  branding: {
    logoDark: "/brand/logo-dark.svg",
    logoLight: "/brand/logo-light.svg",
    mark: "/brand/logo-mark.svg",
    favicon: "",
  },
  legal: {
    legalName: "Hair Home Concept, [raison sociale à compléter]",
    legalForm: "[forme juridique à compléter]",
    siret: "[SIRET à compléter]",
    registry: "[immatriculation RM / Chambre de métiers à compléter]",
    address: "[adresse du siège à compléter, non affichée comme lieu d'accueil]",
    publisher: "Angèle [nom à compléter]",
    vat: "",
    host: "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (vercel.com)",
    dataHost: "Neon (Databricks), base de données PostgreSQL, région Europe (Francfort) recommandée",
  },
  seo: {
    siteName: "Hair Home Concept",
    defaultDescription:
      "Coiffure haut de gamme à domicile à Troyes et Sainte-Savine : Angèle, maître artisan coloriste et visagiste. Coupe, couleur, balayage, mèches, femmes, hommes, enfants.",
    googleSiteVerification: "",
    gaMeasurementId: "",
  },
  modules: {
    bijoux: true,
    testimonials: true,
    banner: true,
  },
  notifications: {
    email: "hairhomeconcept@gmail.com",
  },
};

export type SiteSettings = typeof defaultSettings;
