"use client";

import { useState } from "react";
import { ImagePicker } from "@/components/admin/image-picker";
import { Button, Card, CardHeader, Field, Input, Switch, Textarea } from "@/components/admin/ui";
import { submitWith, useServerAction } from "@/components/admin/use-action";
import { saveSettings } from "@/app/admin/_actions/settings";

type F = { k: string; label: string; type?: "text" | "textarea" | "number" | "switch" | "image" | "days" | "email" | "tel" | "url"; hint?: string };
type G = { key: string; title: string; description?: string; ownerOnly?: boolean; fields: F[] };

const DAYS = [
  ["Monday", "Lundi"],
  ["Tuesday", "Mardi"],
  ["Wednesday", "Mercredi"],
  ["Thursday", "Jeudi"],
  ["Friday", "Vendredi"],
  ["Saturday", "Samedi"],
  ["Sunday", "Dimanche"],
];

const GROUPS: G[] = [
  {
    key: "business",
    title: "Coordonnées",
    fields: [
      { k: "name", label: "Nom commercial" },
      { k: "tagline", label: "Signature" },
      { k: "ownerName", label: "Prénom affiché" },
      { k: "ownerTitle", label: "Titre professionnel" },
      { k: "phone", label: "Téléphone", type: "tel" },
      { k: "email", label: "E-mail", type: "email" },
      { k: "city", label: "Commune de rattachement", hint: "Aucune adresse n'est affichée : service uniquement à domicile." },
      { k: "postalCode", label: "Code postal" },
      { k: "region", label: "Région" },
      { k: "whatsappNumber", label: "Numéro WhatsApp (format international, ex. 33698949663)" },
      { k: "whatsappEnabled", label: "Afficher le bouton WhatsApp", type: "switch", hint: "À activer après validation." },
    ],
  },
  {
    key: "hours",
    title: "Horaires",
    fields: [
      { k: "summary", label: "Horaires affichés", hint: "Ex. « Du lundi au samedi, de 9h à 20h — journée continue »" },
      { k: "calls", label: "Disponibilité téléphonique" },
      { k: "extra", label: "Hors horaires", type: "textarea" },
      { k: "opens", label: "Ouverture (pour Google, HH:MM)" },
      { k: "closes", label: "Fermeture (pour Google, HH:MM)" },
      { k: "days", label: "Jours d'intervention (pour Google)", type: "days" },
    ],
  },
  {
    key: "travel",
    title: "Déplacements & carte",
    fields: [
      { k: "included", label: "Zone de déplacement offert", type: "textarea" },
      { k: "outside", label: "Frais hors zone", type: "textarea" },
      { k: "mapQuery", label: "Recherche Google Maps", hint: "Ville au centre de la carte" },
      { k: "lat", label: "Latitude du centre", type: "number" },
      { k: "lng", label: "Longitude du centre", type: "number" },
      { k: "radiusKm", label: "Rayon indicatif (km)", type: "number" },
    ],
  },
  {
    key: "social",
    title: "Réseaux sociaux",
    fields: [
      { k: "facebook", label: "Page Facebook principale", type: "url" },
      { k: "facebookHairHome", label: "Page Facebook Hair Home Concept", type: "url" },
      { k: "facebookBijoux", label: "Page Facebook bijoux", type: "url" },
      { k: "instagram", label: "Instagram", type: "url" },
    ],
  },
  {
    key: "branding",
    title: "Logo & favicon",
    description: "Le logo officiel vectorisé est déjà en place. Remplacez-le ici uniquement si votre identité évolue.",
    fields: [
      { k: "logoDark", label: "Logo pour fonds sombres", type: "image" },
      { k: "logoLight", label: "Logo pour fonds clairs", type: "image" },
      { k: "mark", label: "Monogramme seul", type: "image" },
      { k: "favicon", label: "Favicon (icône d'onglet)", type: "image", hint: "Carré, 512 × 512 px conseillé." },
    ],
  },
  {
    key: "legal",
    title: "Informations légales",
    ownerOnly: true,
    description: "Affichées dans les mentions légales. À compléter avec vos informations exactes.",
    fields: [
      { k: "legalName", label: "Raison sociale" },
      { k: "legalForm", label: "Forme juridique (EI, micro-entreprise…)" },
      { k: "siret", label: "SIRET" },
      { k: "registry", label: "Immatriculation (Répertoire des métiers)" },
      { k: "address", label: "Adresse du siège (mentions légales uniquement)", type: "textarea" },
      { k: "publisher", label: "Directrice de la publication" },
      { k: "vat", label: "N° de TVA (si applicable)" },
      { k: "host", label: "Hébergeur du site", type: "textarea" },
      { k: "dataHost", label: "Hébergeur des données", type: "textarea" },
    ],
  },
  {
    key: "seo",
    title: "Référencement",
    fields: [
      { k: "siteName", label: "Nom du site" },
      { k: "defaultDescription", label: "Description par défaut", type: "textarea" },
      { k: "googleSiteVerification", label: "Code de vérification Google Search Console" },
      { k: "gaMeasurementId", label: "Identifiant Google Analytics (G-…)", hint: "Chargé uniquement après accord du visiteur." },
    ],
  },
  {
    key: "modules",
    title: "Modules",
    ownerOnly: true,
    fields: [
      { k: "bijoux", label: "Page Bijoux & cadeaux", type: "switch" },
      { k: "testimonials", label: "Section Avis clients sur l'accueil", type: "switch" },
      { k: "banner", label: "Bannière promotionnelle en haut du site", type: "switch", hint: "Affiche l'offre de type « Bannière » publiée." },
    ],
  },
  {
    key: "notifications",
    title: "Notifications",
    fields: [{ k: "email", label: "Recevoir les demandes de rendez-vous sur", type: "email" }],
  },
];

export function SettingsForms({ settings, isOwner }: { settings: Record<string, Record<string, unknown>>; isOwner: boolean }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
      <nav aria-label="Rubriques" className="hidden lg:block">
        <ul className="sticky top-6 space-y-1">
          {GROUPS.filter((g) => !g.ownerOnly || isOwner).map((g) => (
            <li key={g.key}>
              <a href={`#${g.key}`} className="block rounded-lg px-3 py-2 text-sm hover:bg-encre/5">
                {g.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="space-y-6">
        {GROUPS.filter((g) => !g.ownerOnly || isOwner).map((g) => (
          <GroupForm key={g.key} group={g} values={settings[g.key] ?? {}} />
        ))}
      </div>
    </div>
  );
}

function GroupForm({ group, values }: { group: G; values: Record<string, unknown> }) {
  const [save, saving] = useServerAction((fd: FormData) => saveSettings(group.key, fd));
  const [imgs, setImgs] = useState<Record<string, string>>(
    Object.fromEntries(group.fields.filter((f) => f.type === "image").map((f) => [f.k, String(values[f.k] ?? "")])),
  );
  return (
    <Card id={group.key} className="scroll-mt-6">
      <CardHeader title={group.title} description={group.description} />
      <form
        onSubmit={submitWith((fd) => {
          for (const [k, v] of Object.entries(imgs)) fd.set(k, v);
          return save(fd).then(() => undefined);
        })}
        className="grid gap-5 p-5 md:grid-cols-2 md:p-6"
      >
        {group.fields.map((f) => {
          const v = values[f.k];
          const id = `${group.key}-${f.k}`;
          if (f.type === "switch")
            return (
              <div key={f.k} className="md:col-span-2">
                <Switch name={f.k} defaultChecked={Boolean(v)} label={f.label} description={f.hint} />
              </div>
            );
          if (f.type === "image")
            return (
              <div key={f.k}>
                <ImagePicker label={f.label} value={imgs[f.k] ? { url: imgs[f.k], alt: "" } : null} onChange={(x) => setImgs((s) => ({ ...s, [f.k]: x?.url ?? "" }))} aspect="aspect-[3/2]" />
                {f.hint && <p className="mt-1 text-[0.82rem] text-taupe">{f.hint}</p>}
              </div>
            );
          if (f.type === "days")
            return (
              <fieldset key={f.k} className="md:col-span-2">
                <legend className="text-sm font-medium">{f.label}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DAYS.map(([en, fr]) => (
                    <label key={en} className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-encre/15 bg-white px-3 text-sm">
                      <input type="checkbox" name={f.k} value={en} defaultChecked={Array.isArray(v) && v.includes(en)} className="accent-[var(--color-or-profond)]" />
                      {fr}
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          return (
            <Field key={f.k} label={f.label} htmlFor={id} hint={f.hint} className={f.type === "textarea" ? "md:col-span-2" : undefined}>
              {f.type === "textarea" ? (
                <Textarea id={id} name={f.k} rows={3} defaultValue={String(v ?? "")} />
              ) : (
                <Input id={id} name={f.k} type={f.type === "number" ? "text" : f.type ?? "text"} inputMode={f.type === "number" ? "decimal" : undefined} defaultValue={String(v ?? "")} />
              )}
            </Field>
          );
        })}
        <div className="flex justify-end md:col-span-2">
          <Button type="submit" loading={saving}>
            Enregistrer et publier
          </Button>
        </div>
      </form>
    </Card>
  );
}
