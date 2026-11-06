"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ImagePlus, Search, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Img } from "@/components/ui/img";
import { listMedia, uploadMedia } from "@/app/admin/_actions/media";
import type { Media } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { Badge, Button, Input, Sheet } from "./ui";

export type ImageValue = { url: string; alt: string };

/**
 * Sélecteur d'image : aperçu, choix dans la médiathèque, import direct (ordinateur ou téléphone),
 * texte alternatif. Peut écrire des champs cachés `${name}Url` / `${name}Alt` pour les formulaires.
 */
export function ImagePicker({
  value,
  onChange,
  name,
  label = "Image",
  aspect = "aspect-[4/3]",
}: {
  value: ImageValue | null;
  onChange?: (v: ImageValue | null) => void;
  name?: string;
  label?: string;
  aspect?: string;
}) {
  const [current, setCurrent] = useState<ImageValue | null>(value);
  const [open, setOpen] = useState(false);
  useEffect(() => setCurrent(value), [value]);
  const set = (v: ImageValue | null) => {
    setCurrent(v);
    onChange?.(v);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {name && (
        <>
          <input type="hidden" name={`${name}Url`} value={current?.url ?? ""} />
          <input type="hidden" name={`${name}Alt`} value={current?.alt ?? ""} />
        </>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "relative w-full overflow-hidden rounded-xl border border-encre/10 bg-ivoire sm:w-48",
            aspect,
            !current?.url && "flex items-center justify-center border-dashed",
          )}
          aria-label={current?.url ? "Changer l'image" : "Choisir une image"}
        >
          {current?.url ? (
            <Img src={current.url} alt={current.alt} fill sizes="200px" className="object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-sm text-taupe">
              <ImagePlus className="h-6 w-6" /> Choisir une image
            </span>
          )}
        </button>
        <div className="flex-1 space-y-2">
          <Input
            value={current?.alt ?? ""}
            placeholder="Description de l'image (accessibilité, Google)"
            onChange={(e) => current && set({ ...current, alt: e.target.value })}
            disabled={!current?.url}
            aria-label="Texte alternatif"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
              {current?.url ? "Changer" : "Choisir"}
            </Button>
            {current?.url && (
              <Button type="button" variant="danger-ghost" size="sm" onClick={() => set(null)}>
                <X /> Retirer
              </Button>
            )}
          </div>
        </div>
      </div>
      <MediaLibrarySheet
        open={open}
        onOpenChange={setOpen}
        onPick={(mItem) => {
          set({ url: mItem.url, alt: mItem.alt });
          setOpen(false);
        }}
      />
    </div>
  );
}

export function MediaLibrarySheet({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPick: (m: Media) => void;
}) {
  const [items, setItems] = useState<Media[] | null>(null);
  const [q, setQ] = useState("");
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && items === null) start(async () => setItems(await listMedia()));
  }, [open, items]);

  const upload = (files: FileList | null) => {
    if (!files?.length) return;
    const fd = new FormData();
    [...files].forEach((f) => fd.append("files", f));
    start(async () => {
      const r = await uploadMedia(fd);
      if (r.ok) {
        toast.success(r.message);
        const list = await listMedia();
        setItems(list);
        if (r.data?.items.length === 1) onPick(r.data.items[0]);
      } else toast.error(r.error);
    });
  };

  const filtered = (items ?? []).filter((m) => !q || `${m.alt} ${m.filename} ${m.category}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Médiathèque" description="Choisissez une image ou importez-en une nouvelle." wide>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="pl-9" />
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
        <Button type="button" variant="gold" onClick={() => fileRef.current?.click()} loading={pending}>
          <Upload /> Importer depuis l&apos;appareil
        </Button>
      </div>
      {items === null ? (
        <p className="py-10 text-center text-taupe">Chargement…</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => onPick(m)}
                className="group relative block aspect-square w-full overflow-hidden rounded-xl border border-encre/10 bg-ivoire focus-visible:outline-2"
              >
                <Img src={m.url} alt={m.alt} fill sizes="200px" className="object-cover transition-transform group-hover:scale-105" />
                {m.isStock && (
                  <Badge tone="gold" className="absolute left-2 top-2">
                    Temporaire
                  </Badge>
                )}
              </button>
              <p className="mt-1 truncate text-xs text-taupe">{m.alt || m.filename}</p>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
