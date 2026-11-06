"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { RowActions } from "@/components/admin/collection-row";
import { Badge, Button, Card, EmptyState, Field, Input, Select, Sheet, Switch, Textarea } from "@/components/admin/ui";
import { submitWith, useServerAction } from "@/components/admin/use-action";
import { saveItem } from "@/app/admin/_actions/collections";
import type { Testimonial } from "@/lib/db/schema";

export function ReviewsBoard({ items }: { items: Testimonial[] }) {
  const [edit, setEdit] = useState<Testimonial | "new" | null>(null);
  const t = edit === "new" ? null : edit;
  const [save, saving] = useServerAction((fd: FormData) => saveItem("testimonials", fd), { onSuccess: () => setEdit(null) });
  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button variant="gold" onClick={() => setEdit("new")}>
          <Plus /> Ajouter un avis
        </Button>
      </div>
      {items.length ? (
        <Card>
          <ul className="divide-y divide-encre/8">
            {items.map((r, i) => (
              <li key={r.id} className="flex items-start gap-3 px-4 py-4 md:px-6">
                <button type="button" onClick={() => setEdit(r)} className="min-w-0 flex-1 text-left">
                  <span className="block font-display text-lg">« {r.quote} »</span>
                  <span className="text-sm text-taupe">
                    {r.author}
                    {r.context ? ` — ${r.context}` : ""}
                  </span>
                  <span className="mt-1 flex gap-1">
                    {r.consentConfirmed ? <Badge tone="green">Accord confirmé</Badge> : <Badge tone="red">Accord à obtenir</Badge>}
                    {!r.isPublished && <Badge>Non publié</Badge>}
                  </span>
                </button>
                <RowActions kind="testimonials" id={r.id} published={r.isPublished} first={i === 0} last={i === items.length - 1} onEdit={() => setEdit(r)} label={r.author} />
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <EmptyState title="Aucun avis pour l'instant" text="Recopiez ici les avis reçus (Facebook, messages…) une fois l'accord de la personne obtenu." />
      )}
      <Sheet open={edit !== null} onOpenChange={(v) => !v && setEdit(null)} title={t ? "Modifier l'avis" : "Nouvel avis"}>
        <form key={t?.id ?? "new"} onSubmit={submitWith((fd) => save(fd).then(() => undefined))} className="space-y-5">
          {t && <input type="hidden" name="id" value={t.id} />}
          <Field label="Prénom (et initiale)" htmlFor="author" hint="Ex. « Sophie M. »">
            <Input id="author" name="author" defaultValue={t?.author} required />
          </Field>
          <Field label="Contexte (facultatif)" htmlFor="context" hint="Ex. « Balayage, Sainte-Savine »">
            <Input id="context" name="context" defaultValue={t?.context ?? ""} />
          </Field>
          <Field label="Témoignage" htmlFor="quote">
            <Textarea id="quote" name="quote" rows={5} defaultValue={t?.quote} required />
          </Field>
          <Field label="Note (facultatif)" htmlFor="rating">
            <Select id="rating" name="rating" defaultValue={String(t?.rating ?? "")}>
              <option value="">—</option>
              {[5, 4, 3].map((n) => (
                <option key={n} value={n}>
                  {n} / 5
                </option>
              ))}
            </Select>
          </Field>
          <Switch name="consentConfirmed" defaultChecked={t?.consentConfirmed} label="La personne a donné son accord pour la publication" />
          <Switch name="isPublished" defaultChecked={t?.isPublished} label="Publier sur le site" />
          <Button type="submit" loading={saving} className="w-full">
            Enregistrer
          </Button>
        </form>
      </Sheet>
    </>
  );
}
