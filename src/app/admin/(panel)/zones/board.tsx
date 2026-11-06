"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { RowActions } from "@/components/admin/collection-row";
import { Badge, Button, Card, Field, Input, Sheet, Switch } from "@/components/admin/ui";
import { submitWith, useServerAction } from "@/components/admin/use-action";
import { saveItem } from "@/app/admin/_actions/collections";
import type { ServiceArea } from "@/lib/db/schema";

export function AreasBoard({ items }: { items: ServiceArea[] }) {
  const [edit, setEdit] = useState<ServiceArea | "new" | null>(null);
  const a = edit === "new" ? null : edit;
  const [save, saving] = useServerAction((fd: FormData) => saveItem("areas", fd), { onSuccess: () => setEdit(null) });
  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button variant="gold" onClick={() => setEdit("new")}>
          <Plus /> Ajouter une commune
        </Button>
      </div>
      <Card>
        <ul className="divide-y divide-encre/8">
          {items.map((z, i) => (
            <li key={z.id} className="flex items-center gap-3 px-4 py-3 md:px-6">
              <span className="min-w-0 flex-1">
                <span className="font-medium">{z.name}</span> <span className="text-sm text-taupe">{z.postalCode}</span>
                <span className="ml-2 inline-flex gap-1">
                  {z.travelIncluded ? <Badge tone="green">Déplacement offert</Badge> : <Badge tone="gold">Frais de déplacement</Badge>}
                  {!z.isPublished && <Badge>Masquée</Badge>}
                </span>
              </span>
              <RowActions kind="areas" id={z.id} published={z.isPublished} first={i === 0} last={i === items.length - 1} onEdit={() => setEdit(z)} label={z.name} />
            </li>
          ))}
        </ul>
      </Card>
      <Sheet open={edit !== null} onOpenChange={(v) => !v && setEdit(null)} title={a ? a.name : "Nouvelle commune"}>
        <form key={a?.id ?? "new"} onSubmit={submitWith((fd) => save(fd).then(() => undefined))} className="space-y-5">
          {a && <input type="hidden" name="id" value={a.id} />}
          <Field label="Commune" htmlFor="name">
            <Input id="name" name="name" defaultValue={a?.name} required />
          </Field>
          <Field label="Code postal" htmlFor="postalCode">
            <Input id="postalCode" name="postalCode" inputMode="numeric" defaultValue={a?.postalCode ?? ""} />
          </Field>
          <Field label="Précision (facultatif)" htmlFor="note" hint="Ex. « supplément 10 € »">
            <Input id="note" name="note" defaultValue={a?.note ?? ""} />
          </Field>
          <Switch name="travelIncluded" defaultChecked={a?.travelIncluded ?? true} label="Déplacement offert" />
          <Switch name="isPublished" defaultChecked={a?.isPublished ?? true} label="Visible sur le site" />
          <Button type="submit" loading={saving} className="w-full">
            Enregistrer
          </Button>
        </form>
      </Sheet>
    </>
  );
}
