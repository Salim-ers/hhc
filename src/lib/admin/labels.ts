export const STATUS_LABEL = {
  nouvelle: "Nouvelle demande",
  a_contacter: "À contacter",
  en_attente: "En attente",
  confirmee: "Confirmée",
  terminee: "Terminée",
  annulee: "Annulée",
} as const;

export const STATUS_TONE = {
  nouvelle: "gold",
  a_contacter: "blue",
  en_attente: "neutral",
  confirmee: "green",
  terminee: "dark",
  annulee: "red",
} as const;

export const OFFER_KIND_LABEL = {
  forfait: "Forfait",
  formule: "Formule",
  promotion: "Promotion / avantage",
  parrainage: "Parrainage",
  bon_cadeau: "Bon cadeau",
  banniere: "Bannière promotionnelle",
} as const;

export const MEDIA_CATEGORIES = [
  { value: "general", label: "Général" },
  { value: "coupe", label: "Coupes" },
  { value: "couleur", label: "Couleurs" },
  { value: "balayage", label: "Balayages & mèches" },
  { value: "coiffure", label: "Coiffures d'exception" },
  { value: "homme", label: "Hommes" },
  { value: "enfant", label: "Enfants" },
  { value: "bijoux", label: "Bijoux" },
  { value: "portrait", label: "Portraits d'Angèle" },
  { value: "logo", label: "Logo & identité" },
];
