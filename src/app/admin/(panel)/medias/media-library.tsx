"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Crop, ImagePlus, RefreshCw, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Img } from "@/components/ui/img";
import { Badge, Button, ConfirmDialog, EmptyState, Field, Input, Select, Sheet } from "@/components/admin/ui";
import { useServerAction } from "@/components/admin/use-action";
import { deleteMedia, mediaUsage, replaceMedia, updateMedia, uploadMedia } from "@/app/admin/_actions/media";
import { addToGallery } from "@/app/admin/_actions/collections";
import { MEDIA_CATEGORIES } from "@/lib/admin/labels";
import { GALLERY_CATEGORIES } from "@/lib/content/seed-data";
import type { Media } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function MediaLibrary({ items }: { items: Media[] }) {
  const router = useRouter();
  const [cat, setCat] = useState("all");
  const [stockOnly, setStockOnly] = useState(false);
  const [sel, setSel] = useState<Media | null>(null);
  const [drag, setDrag] = useState(false);
  const [uploading, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  const upload = (files: FileList | File[] | null) => {
    if (!files || !files.length) return;
    const fd = new FormData();
    [...files].forEach((f) => fd.append("files", f));
    fd.set("category", cat === "all" ? "general" : cat);
    start(async () => {
      const r = await uploadMedia(fd);
      if (r.ok) {
        toast.success(r.message);
        router.refresh();
      } else toast.error(r.error);
    });
  };

  const shown = items.filter((m) => (cat === "all" || m.category === cat) && (!stockOnly || m.isStock));

  return (
    <>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          upload(e.dataTransfer.files);
        }}
        className={cn("mb-6 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors", drag ? "border-or-profond bg-champagne/10" : "border-encre/15 bg-white")}
      >
        <ImagePlus className="h-8 w-8 text-or-profond" />
        <p className="font-medium">Glissez vos photos ici, ou</p>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
        <Button variant="gold" onClick={() => input.current?.click()} loading={uploading}>
          <Upload /> Choisir des photos
        </Button>
        <p className="text-xs text-taupe">JPG, PNG, WebP ou HEIC (iPhone) · 12 Mo max · converties automatiquement en WebP optimisé</p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="w-auto" aria-label="Catégorie">
          <option value="all">Toutes les catégories</option>
          {MEDIA_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
        <Button variant={stockOnly ? "primary" : "outline"} onClick={() => setStockOnly((v) => !v)}>
          Photos temporaires ({items.filter((m) => m.isStock).length})
        </Button>
      </div>

      {shown.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {shown.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => setSel(m)} className="group relative block aspect-square w-full overflow-hidden rounded-xl border border-encre/10 bg-ivoire">
                <Img src={m.url} alt={m.alt} fill sizes="(min-width:1024px) 18vw, 45vw" className="object-cover transition-transform group-hover:scale-105" />
                {m.isStock && (
                  <Badge tone="gold" className="absolute left-2 top-2">
                    Temporaire
                  </Badge>
                )}
              </button>
              <p className="mt-1.5 truncate text-xs text-taupe">{m.alt || m.filename}</p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Aucune image" text="Importez vos premières photos avec le bouton ci-dessus." />
      )}
      <MediaSheet media={sel} onClose={() => setSel(null)} />
    </>
  );
}

function MediaSheet({ media, onClose }: { media: Media | null; onClose: () => void }) {
  const [alt, setAlt] = useState("");
  const [category, setCategory] = useState("general");
  const [usage, setUsage] = useState<{ where: string; count: number }[] | null>(null);
  const [cropping, setCropping] = useState(false);
  const [galleryCat, setGalleryCat] = useState("coupe");
  const fileRef = useRef<HTMLInputElement>(null);
  const [save, saving] = useServerAction(updateMedia);
  const [replace, replacing] = useServerAction(replaceMedia, { onSuccess: onClose });
  const [remove] = useServerAction(deleteMedia, { onSuccess: onClose });
  const [toGallery, adding] = useServerAction(addToGallery);

  useEffect(() => {
    if (!media) return;
    setAlt(media.alt);
    setCategory(media.category);
    setUsage(null);
    setCropping(false);
    mediaUsage(media.url).then(setUsage).catch(() => setUsage([]));
  }, [media]);

  const doReplace = (file: File) => {
    if (!media) return;
    const fd = new FormData();
    fd.set("id", media.id);
    fd.set("file", file);
    replace(fd);
  };

  return (
    <Sheet open={!!media} onOpenChange={(v) => !v && onClose()} title="Détails de l'image" wide>
      {media && (
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            {cropping ? (
              <CropTool src={media.url} onCancel={() => setCropping(false)} onDone={(f) => doReplace(f)} busy={replacing} />
            ) : (
              <div className="relative aspect-square overflow-hidden rounded-xl bg-ivoire">
                <Img src={media.url} alt={media.alt} fill sizes="480px" className="object-contain" />
              </div>
            )}
            <p className="mt-2 text-xs text-taupe">
              {media.width && media.height ? `${media.width} × ${media.height} px · ` : ""}
              {media.sizeBytes ? `${Math.round(media.sizeBytes / 1024)} Ko · ` : ""}
              {media.credit ?? media.filename}
            </p>
          </div>
          <div className="space-y-5">
            {media.isStock && (
              <p className="rounded-xl bg-champagne/15 p-3 text-sm text-[#6b5218]">
                Photo de banque d&apos;images temporaire. Remplacez-la par une de vos réalisations : elle sera changée partout sur le site.
              </p>
            )}
            <Field label="Description (texte alternatif)" htmlFor="alt" hint="Décrivez la photo en quelques mots : utile pour l'accessibilité et Google.">
              <Input id="alt" value={alt} onChange={(e) => setAlt(e.target.value)} />
            </Field>
            <Field label="Catégorie" htmlFor="mcat">
              <Select id="mcat" value={category} onChange={(e) => setCategory(e.target.value)}>
                {MEDIA_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Button onClick={() => save(media.id, { alt, category })} loading={saving}>
              Enregistrer
            </Button>

            <div className="space-y-2 border-t border-encre/10 pt-5">
              <p className="text-sm font-medium">Utilisée dans</p>
              {usage === null ? (
                <p className="text-sm text-taupe">Recherche…</p>
              ) : usage.length ? (
                <ul className="flex flex-wrap gap-1.5">
                  {usage.map((u) => (
                    <Badge key={u.where}>
                      {u.where} ({u.count})
                    </Badge>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-taupe">Nulle part pour l&apos;instant.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-encre/10 pt-5">
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && doReplace(e.target.files[0])} />
              <Button variant="gold" onClick={() => fileRef.current?.click()} loading={replacing && !cropping}>
                <RefreshCw /> Remplacer partout
              </Button>
              <Button variant="outline" onClick={() => setCropping(true)}>
                <Crop /> Recadrer
              </Button>
              <ConfirmDialog
                trigger={
                  <Button variant="danger-ghost">
                    <Trash2 /> Supprimer
                  </Button>
                }
                title="Supprimer cette image ?"
                description="Une image encore utilisée sur le site ne peut pas être supprimée : remplacez-la plutôt."
                onConfirm={() => remove(media.id).then(() => undefined)}
              />
            </div>
            <div className="flex flex-wrap items-end gap-2 border-t border-encre/10 pt-5">
              <Field label="Ajouter à la galerie dans" htmlFor="gcat">
                <Select id="gcat" value={galleryCat} onChange={(e) => setGalleryCat(e.target.value)}>
                  {GALLERY_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Button variant="outline" loading={adding} onClick={() => toGallery([{ url: media.url, alt: alt || media.alt }], galleryCat)}>
                Ajouter à la galerie
              </Button>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
}

const RATIOS = [
  { label: "Libre", v: 0 },
  { label: "Portrait 4:5", v: 4 / 5 },
  { label: "Carré", v: 1 },
  { label: "Paysage 3:2", v: 3 / 2 },
  { label: "Bannière 16:9", v: 16 / 9 },
];

function CropTool({ src, onCancel, onDone, busy }: { src: string; onCancel: () => void; onDone: (f: File) => void; busy: boolean }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [ratio, setRatio] = useState(4 / 5);
  const [area, setArea] = useState<Area | null>(null);
  const onComplete = useCallback((_: Area, px: Area) => setArea(px), []);
  const source = src.startsWith("https://images.unsplash.com/") ? `${src}?w=2400&q=90&auto=format` : src;

  const apply = async () => {
    if (!area) return;
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = source;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(area.width);
      canvas.height = Math.round(area.height);
      canvas.getContext("2d")!.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
      const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Recadrage impossible"))), "image/jpeg", 0.92));
      onDone(new File([blob], "recadrage.jpg", { type: "image/jpeg" }));
    } catch {
      toast.error("Recadrage impossible pour cette image (protection du serveur d'origine). Importez-la à nouveau puis recadrez.");
    }
  };

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-noir">
        <Cropper image={source} crop={crop} zoom={zoom} aspect={ratio || undefined} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onComplete} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {RATIOS.map((r) => (
          <button key={r.label} type="button" onClick={() => setRatio(r.v)} className={cn("h-9 rounded-full border px-3 text-xs", ratio === r.v ? "border-noir bg-noir text-ivoire" : "border-encre/15")}>
            {r.label}
          </button>
        ))}
      </div>
      <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="mt-3 w-full accent-[var(--color-or-profond)]" aria-label="Zoom" />
      <div className="mt-3 flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={apply} loading={busy}>
          Appliquer le recadrage
        </Button>
      </div>
      <p className="mt-2 text-xs text-taupe">Le recadrage remplace l&apos;image partout sur le site.</p>
    </div>
  );
}
