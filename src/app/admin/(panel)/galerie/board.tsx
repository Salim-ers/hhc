"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ImagePicker, type ImageValue } from "@/components/admin/image-picker";
import { RowActions } from "@/components/admin/collection-row";
import { Badge, Button, Card, EmptyState, Field, Input, Select, Sheet, Switch } from "@/components/admin/ui";
import { submitWith, useServerAction } from "@/components/admin/use-action";
import { Img } from "@/components/ui/img";
import { saveItem } from "@/app/admin/_actions/collections";
import { GALLERY_CATEGORIES } from "@/lib/content/seed-data";
import type { GalleryItem } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const LAYOUTS = [
  { value: "portrait", label: "Portrait" },
  { value: "tall", label: "Très haut" },
  { value: "square", label: "Carré" },
  { value: "landscape", label: "Paysage" },
];

export function GalleryBoard({ items }: { items: GalleryItem[] }) {
  const [edit, setEdit] = useState<GalleryItem | "new" | null>(null);
  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button variant="gold" onClick={() => setEdit("new")}>
          <Plus /> Ajouter une photo
        </Button>
      </div>
      {items.length ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g, i) => (
            <li key={g.id}>
              <Card className={cn("overflow-hidden", !g.isPublished && "opacity-60")}>
                <button type="button" onClick={() => setEdit(g)} className="relative block aspect-[4/3] w-full bg-ivoire">
                  <Img src={g.imageUrl} alt={g.alt} fill sizes="(min-width:1024px) 30vw, 90vw" className="object-cover" />
                  <span className="absolute left-2 top-2 flex gap-1">
                    {i < 8 && <Badge tone="dark">Accueil</Badge>}
                    {g.isStock && <Badge tone="gold">Temporaire</Badge>}
                    {!g.isPublished && <Badge>Masquée</Badge>}
                  </span>
                </button>
                <div className="flex items-center justify-between gap-2 p-3">
                  <span className="min-w-0 truncate text-sm">{GALLERY_CATEGORIES.find((c) => c.value === g.category)?.label}</span>
                  <RowActions kind="gallery" id={g.id} published={g.isPublished} first={i === 0} last={i === items.length - 1} onEdit={() => setEdit(g)} label={g.alt} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Galerie vide" text="Ajoutez vos premières réalisations." />
      )}
      <GallerySheet value={edit} onClose={() => setEdit(null)} />
    </>
  );
}

function GallerySheet({ value, onClose }: { value: GalleryItem | "new" | null; onClose: () => void }) {
  const g = value === "new" ? null : value;
  const [img, setImg] = useState<ImageValue | null>(null);
  const [save, saving] = useServerAction((fd: FormData) => saveItem("gallery", fd), { onSuccess: onClose });
  const current = img ?? (g ? { url: g.imageUrl, alt: g.alt } : null);
  return (
    <Sheet open={value !== null} onOpenChange={(v) => !v && onClose()} title={g ? "Modifier la photo" : "Ajouter une photo"}>
      <form
        key={g?.id ?? "new"}
        onSubmit={submitWith((fd) => {
          fd.set("imageUrl", current?.url ?? "");
          fd.set("alt", current?.alt ?? "");
          return save(fd).then(() => undefined);
        })}
        className="space-y-5"
      >
        {g && <input type="hidden" name="id" value={g.id} />}
        <ImagePicker value={current} onChange={setImg} label="Photo" aspect="aspect-[4/5]" />
        <Field label="Légende (facultatif)" htmlFor="caption">
          <Input id="caption" name="caption" defaultValue={g?.caption ?? ""} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Filtre" htmlFor="category">
            <Select id="category" name="category" defaultValue={g?.category ?? "coupe"}>
              {GALLERY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Format" htmlFor="layout">
            <Select id="layout" name="layout" defaultValue={g?.layout ?? "portrait"}>
              {LAYOUTS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Switch name="isPublished" defaultChecked={g?.isPublished ?? true} label="Visible sur le site" />
        <Switch name="isStock" defaultChecked={g?.isStock ?? false} label="Photo d'illustration (pas une réalisation d'Angèle)" description="Affiche la mention « photographies d'inspiration »." />
        <Button type="submit" loading={saving} className="w-full">
          Enregistrer et publier
        </Button>
      </form>
    </Sheet>
  );
}
