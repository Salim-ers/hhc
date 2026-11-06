"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { ImagePicker, type ImageValue } from "@/components/admin/image-picker";
import { Badge, Button, Card, ConfirmDialog, Field, Input, Select, Sheet, Switch, Textarea } from "@/components/admin/ui";
import { submitWith, useServerAction } from "@/components/admin/use-action";
import { deleteOffer, moveOffer, saveOffer, setOfferStatus } from "@/app/admin/_actions/offers";
import { OFFER_KIND_LABEL } from "@/lib/admin/labels";
import type { Offer } from "@/lib/db/schema";
import { formatPrice } from "@/lib/utils";

const eur = (c: number | null | undefined) => (c == null ? "" : (c / 100).toString().replace(".", ","));
const dt = (d: Date | null | undefined) => (d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

function liveState(o: Offer): { label: string; tone: "green" | "neutral" | "gold" | "red" } {
  const now = new Date();
  if (o.status === "draft") return { label: "Brouillon", tone: "neutral" };
  if (o.startsAt && o.startsAt > now) return { label: `Programmée (${o.startsAt.toLocaleDateString("fr-FR")})`, tone: "gold" };
  if (o.endsAt && o.endsAt < now) return { label: "Expirée", tone: "red" };
  return { label: "En ligne", tone: "green" };
}

export function OffersBoard({ offers }: { offers: Offer[] }) {
  const [edit, setEdit] = useState<Offer | "new" | null>(null);
  const [status] = useServerAction(setOfferStatus);
  const [move] = useServerAction(moveOffer);
  const [remove] = useServerAction(deleteOffer);
  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button variant="gold" onClick={() => setEdit("new")}>
          <Plus /> Nouvelle offre
        </Button>
      </div>
      <Card>
        <ul className="divide-y divide-encre/8">
          {offers.map((o, i) => {
            const st = liveState(o);
            return (
              <li key={o.id} className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:px-6">
                <button type="button" onClick={() => setEdit(o)} className="min-w-0 flex-1 text-left">
                  <span className="text-xs text-or-profond">{OFFER_KIND_LABEL[o.kind]}</span>
                  <span className="flex items-center gap-2 font-medium">
                    {o.title} {o.highlight && <Star className="h-4 w-4 fill-champagne text-champagne" aria-label="Mise en avant" />}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    <Badge tone={st.tone}>{st.label}</Badge>
                    {o.needsReview && <Badge tone="gold">À vérifier</Badge>}
                    {o.endsAt && <Badge tone="neutral">Jusqu&apos;au {o.endsAt.toLocaleDateString("fr-FR")}</Badge>}
                  </span>
                </button>
                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <span className="font-display text-xl tabular-nums">{o.priceLabel ?? (o.priceCents != null ? formatPrice(o.priceCents) : "")}</span>
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" aria-label="Monter" disabled={i === 0} onClick={() => move(o.id, -1)}>
                      <ArrowUp />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Descendre" disabled={i === offers.length - 1} onClick={() => move(o.id, 1)}>
                      <ArrowDown />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => status(o.id, o.status === "published" ? "draft" : "published")}>
                      {o.status === "published" ? "Retirer" : "Publier"}
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Modifier" onClick={() => setEdit(o)}>
                      <Pencil />
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button variant="danger-ghost" size="icon" aria-label="Supprimer">
                          <Trash2 />
                        </Button>
                      }
                      title="Supprimer cette offre ?"
                      description={`« ${o.title} » sera supprimée définitivement. Pour la retirer temporairement, utilisez « Retirer ».`}
                      onConfirm={() => remove(o.id).then(() => undefined)}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
      <OfferSheet value={edit} onClose={() => setEdit(null)} />
    </>
  );
}

function OfferSheet({ value, onClose }: { value: Offer | "new" | null; onClose: () => void }) {
  const o = value === "new" ? null : value;
  const [image, setImage] = useState<ImageValue | null>(null);
  const [save, saving] = useServerAction(saveOffer, { onSuccess: onClose });
  return (
    <Sheet
      open={value !== null}
      onOpenChange={(v) => !v && onClose()}
      title={o ? o.title : "Nouvelle offre"}
      description="Tarif, composition, conditions et période de validité."
      wide
    >
      <form
        key={o?.id ?? "new"}
        onSubmit={submitWith((fd) => {
          fd.set("imageUrl", (image ?? (o?.imageUrl ? { url: o.imageUrl, alt: o.imageAlt ?? "" } : null))?.url ?? "");
          fd.set("imageAlt", (image ?? (o?.imageUrl ? { url: o.imageUrl, alt: o.imageAlt ?? "" } : null))?.alt ?? "");
          return save(fd).then(() => undefined);
        })}
        className="grid gap-5 md:grid-cols-2"
      >
        {o && <input type="hidden" name="id" value={o.id} />}
        <input type="hidden" name="status" value={o?.status ?? "draft"} />
        <Field label="Type" htmlFor="kind">
          <Select id="kind" name="kind" defaultValue={o?.kind ?? "promotion"}>
            {Object.entries(OFFER_KIND_LABEL).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Titre" htmlFor="title">
          <Input id="title" name="title" defaultValue={o?.title} required />
        </Field>
        <Field label="Sous-titre" htmlFor="subtitle">
          <Input id="subtitle" name="subtitle" defaultValue={o?.subtitle ?? ""} />
        </Field>
        <Field label="Code (facultatif)" htmlFor="code" hint="Code de parrainage ou promotionnel">
          <Input id="code" name="code" defaultValue={o?.code ?? ""} />
        </Field>
        <Field label="Description" htmlFor="description" className="md:col-span-2">
          <Textarea id="description" name="description" rows={2} defaultValue={o?.description ?? ""} />
        </Field>
        <Field label="Prix (€)" htmlFor="price">
          <Input id="price" name="price" inputMode="decimal" defaultValue={eur(o?.priceCents)} />
        </Field>
        <Field label="Prix barré (€)" htmlFor="compareAt">
          <Input id="compareAt" name="compareAt" inputMode="decimal" defaultValue={eur(o?.compareAtCents)} />
        </Field>
        <Field label="Affichage du prix (remplace le prix)" htmlFor="priceLabel" hint="Ex. « −10 % », « 97 € par mois », « Montant libre »" className="md:col-span-2">
          <Input id="priceLabel" name="priceLabel" defaultValue={o?.priceLabel ?? ""} />
        </Field>
        <Field label="Composition (une ligne par élément)" htmlFor="items" className="md:col-span-2">
          <Textarea id="items" name="items" rows={4} defaultValue={o?.items.join("\n") ?? ""} />
        </Field>
        <Field label="Conditions" htmlFor="conditions" className="md:col-span-2">
          <Textarea id="conditions" name="conditions" rows={2} defaultValue={o?.conditions ?? ""} />
        </Field>
        <Field label="Texte du bouton" htmlFor="ctaLabel">
          <Input id="ctaLabel" name="ctaLabel" defaultValue={o?.ctaLabel ?? "Prendre rendez-vous"} />
        </Field>
        <Field label="Lien du bouton (facultatif)" htmlFor="ctaHref" hint="Par défaut : formulaire de rendez-vous pré-rempli">
          <Input id="ctaHref" name="ctaHref" defaultValue={o?.ctaHref ?? ""} placeholder="/contact" />
        </Field>
        <Field label="Début de validité" htmlFor="startsAt" hint="Laisser vide : immédiatement">
          <Input id="startsAt" name="startsAt" type="datetime-local" defaultValue={dt(o?.startsAt)} />
        </Field>
        <Field label="Fin de validité" htmlFor="endsAt" hint="Laisser vide : sans limite">
          <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={dt(o?.endsAt)} />
        </Field>
        <div className="md:col-span-2">
          <ImagePicker value={o?.imageUrl ? { url: o.imageUrl, alt: o.imageAlt ?? "" } : null} onChange={setImage} label="Image (facultatif)" />
        </div>
        <div className="space-y-3 md:col-span-2">
          <Switch name="highlight" defaultChecked={o?.highlight} label="Mettre en avant sur la page d'accueil" />
          <Switch name="needsReview" defaultChecked={o?.needsReview} label="À vérifier (marque interne)" />
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-encre/10 pt-5 sm:flex-row sm:justify-end md:col-span-2">
          <Button type="submit" name="intent" value="draft" variant="outline" disabled={saving}>
            Enregistrer en brouillon
          </Button>
          <Button type="submit" name="intent" value="publish" loading={saving}>
            Publier
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
