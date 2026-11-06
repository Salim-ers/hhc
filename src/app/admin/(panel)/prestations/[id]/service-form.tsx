"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { ImagePicker, type ImageValue } from "@/components/admin/image-picker";
import { Button, Card, CardHeader, Field, Input, Select, Switch, Textarea } from "@/components/admin/ui";
import { submitWith, useServerAction } from "@/components/admin/use-action";
import { saveService } from "@/app/admin/_actions/services";
import type { PriceCategory, Service } from "@/lib/db/schema";

const eur = (c: number | null | undefined) => (c == null ? "" : (c / 100).toString().replace(".", ","));
const dt = (d: Date | null | undefined) => (d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

export function ServiceForm({
  categories,
  service,
  variants: initialVariants,
  defaultCategory,
  sections,
  previewHref,
}: {
  categories: PriceCategory[];
  service: Service | null;
  variants: { label: string; priceCents: number }[];
  defaultCategory?: string;
  sections: string[];
  previewHref: string;
}) {
  const router = useRouter();
  const [variants, setVariants] = useState(initialVariants.map((v) => ({ label: v.label, price: eur(v.priceCents) })));
  const [onQuote, setOnQuote] = useState(service ? service.priceCents == null : false);
  const [image, setImage] = useState<ImageValue | null>(service?.imageUrl ? { url: service.imageUrl, alt: service.imageAlt ?? "" } : null);
  const [save, saving] = useServerAction(saveService, {
    refresh: false,
    onSuccess: (r) => {
      if (!service && r.data?.id) router.replace(`/admin/prestations/${r.data.id}`);
      else router.refresh();
    },
  });

  return (
    <form
      onSubmit={submitWith((fd) => {
        fd.set("variants", JSON.stringify(variants.filter((v) => v.label || v.price)));
        fd.set("imageUrl", image?.url ?? "");
        fd.set("imageAlt", image?.alt ?? "");
        return save(fd).then(() => undefined);
      })}
      className="grid gap-6 lg:grid-cols-3"
    >
      {service && <input type="hidden" name="id" value={service.id} />}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader title="Prestation" />
          <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
            <Field label="Nom de la prestation" htmlFor="name" className="md:col-span-2">
              <Input id="name" name="name" defaultValue={service?.name} required placeholder="Ex. Shampooing · Coupe · Modelage" />
            </Field>
            <Field label="Catégorie (onglet)" htmlFor="categoryId">
              <Select id="categoryId" name="categoryId" defaultValue={service?.categoryId ?? defaultCategory ?? categories[0]?.id} required>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Intertitre (facultatif)" htmlFor="section" hint="Regroupe les prestations : « Couleur », « Barbe & soin »…">
              <Input id="section" name="section" list="sections" defaultValue={service?.section ?? ""} />
              <datalist id="sections">
                {sections.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>
            <Field label="Courte description" htmlFor="description" className="md:col-span-2">
              <Textarea id="description" name="description" rows={2} defaultValue={service?.description ?? ""} />
            </Field>
            <Field label="Durée (minutes, facultatif)" htmlFor="durationMinutes">
              <Input id="durationMinutes" name="durationMinutes" type="number" min={0} max={600} inputMode="numeric" defaultValue={service?.durationMinutes ?? ""} />
            </Field>
            <Field label="Badge (facultatif)" htmlFor="badge" hint="Ex. « Coupe offerte », « Nouveau »">
              <Input id="badge" name="badge" defaultValue={service?.badge ?? ""} />
            </Field>
            <Field label="Conditions (facultatif)" htmlFor="conditions" className="md:col-span-2">
              <Input id="conditions" name="conditions" defaultValue={service?.conditions ?? ""} placeholder="Ex. Sur présentation de la carte étudiante." />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="Prix TTC" description="En euros. Les changements apparaissent immédiatement sur la page Tarifs." />
          <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
            <Field label="Prix" htmlFor="price">
              <div className="relative">
                <Input id="price" name="price" inputMode="decimal" defaultValue={eur(service?.priceCents)} disabled={onQuote} className="pr-8 text-lg" placeholder="30" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe">€</span>
              </div>
            </Field>
            <Field label="Prix barré (promotion, facultatif)" htmlFor="compareAt">
              <Input id="compareAt" name="compareAt" inputMode="decimal" defaultValue={eur(service?.compareAtCents)} placeholder="50" />
            </Field>
            <div className="space-y-3 md:col-span-2">
              <Switch name="priceFrom" defaultChecked={service?.priceFrom} label="Tarif « à partir de »" />
              <Switch name="onQuote" checked={onQuote} onCheckedChange={setOnQuote} label="Sur devis (pas de prix affiché)" />
            </div>
          </div>
          <div className="border-t border-encre/8 p-5 md:p-6">
            <p className="text-sm font-medium">Variantes de prix</p>
            <p className="text-[0.82rem] text-taupe">Ex. « Cheveux longs ou épais » à 36 €. Le prix ci-dessus reste le prix de base.</p>
            <ul className="mt-3 space-y-2">
              {variants.map((v, i) => (
                <li key={i} className="flex gap-2">
                  <Input
                    value={v.label}
                    onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                    placeholder="Cheveux longs ou épais"
                    aria-label="Nom de la variante"
                  />
                  <Input
                    value={v.price}
                    onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))}
                    inputMode="decimal"
                    placeholder="36"
                    className="w-28"
                    aria-label="Prix de la variante"
                  />
                  <Button type="button" variant="danger-ghost" size="icon" aria-label="Retirer la variante" onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))}>
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setVariants((vs) => [...vs, { label: "Cheveux longs ou épais", price: "" }])}>
              <Plus /> Ajouter une variante
            </Button>
          </div>
          <div className="grid gap-5 border-t border-encre/8 p-5 md:grid-cols-2 md:p-6">
            <Field label="Supplément (facultatif)" htmlFor="supplement" hint="Ajouté au prix, ex. 13 € pour cheveux longs">
              <Input id="supplement" name="supplement" inputMode="decimal" defaultValue={eur(service?.supplementCents)} placeholder="13" />
            </Field>
            <Field label="Libellé du supplément" htmlFor="supplementLabel">
              <Input id="supplementLabel" name="supplementLabel" defaultValue={service?.supplementLabel ?? "Cheveux longs ou épais"} />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="Promotion temporaire" description="Affiche une étiquette pendant la période choisie (facultatif)." />
          <div className="grid gap-5 p-5 md:grid-cols-3 md:p-6">
            <Field label="Texte de l'étiquette" htmlFor="promoLabel">
              <Input id="promoLabel" name="promoLabel" defaultValue={service?.promoLabel ?? ""} placeholder="−10 % ce mois-ci" />
            </Field>
            <Field label="Début" htmlFor="promoStartsAt">
              <Input id="promoStartsAt" name="promoStartsAt" type="datetime-local" defaultValue={dt(service?.promoStartsAt)} />
            </Field>
            <Field label="Fin" htmlFor="promoEndsAt">
              <Input id="promoEndsAt" name="promoEndsAt" type="datetime-local" defaultValue={dt(service?.promoEndsAt)} />
            </Field>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="lg:sticky lg:top-6">
          <CardHeader title="Publication" />
          <div className="space-y-4 p-5">
            <Switch name="isPublished" defaultChecked={service?.isPublished ?? true} label="Visible sur le site" description="Décochez pour la masquer sans la supprimer." />
            <Switch name="needsReview" defaultChecked={service?.needsReview ?? false} label="Tarif à vérifier" description="Marque interne, invisible des visiteurs." />
            <div className="flex flex-col gap-2 pt-2">
              <Button type="submit" size="lg" loading={saving}>
                Enregistrer et publier
              </Button>
              <Button asChild variant="outline">
                <a href={previewHref} target="_blank" rel="noopener">
                  <ExternalLink /> Voir sur le site
                </a>
              </Button>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Photographie" description="Facultatif — illustre l'onglet sur la page Tarifs." />
          <div className="p-5">
            <ImagePicker value={image} onChange={setImage} label="Image de la prestation" aspect="aspect-[4/5]" />
          </div>
        </Card>
      </div>
    </form>
  );
}
