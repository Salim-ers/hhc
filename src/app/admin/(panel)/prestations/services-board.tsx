"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, CheckCheck, Copy, Eye, EyeOff, Pencil, Plus, Search, Settings2, Trash2 } from "lucide-react";
import { Badge, Button, Card, ConfirmDialog, EmptyState, Field, Input, Sheet, Switch, Textarea } from "@/components/admin/ui";
import { submitWith, useServerAction } from "@/components/admin/use-action";
import { confirmPrices, deleteCategory, deleteService, duplicateService, moveCategory, moveService, saveCategory, setServicePublished } from "@/app/admin/_actions/services";
import type { PriceCategory, Service, ServiceVariant } from "@/lib/db/schema";
import { cn, formatPrice } from "@/lib/utils";

type Row = Service & { variants: ServiceVariant[] };

export function ServicesBoard({ categories, services, onlyReview, initialCat }: { categories: PriceCategory[]; services: Row[]; onlyReview: boolean; initialCat?: string }) {
  const [cat, setCat] = useState<string>(initialCat && categories.some((c) => c.id === initialCat) ? initialCat : "all");
  const [q, setQ] = useState("");
  const [review, setReview] = useState(onlyReview);
  const [editCat, setEditCat] = useState<PriceCategory | "new" | null>(null);

  const [toggle] = useServerAction(setServicePublished);
  const [move] = useServerAction(moveService);
  const [remove] = useServerAction(deleteService);
  const [dup] = useServerAction(duplicateService);
  const [confirmAll, confirming] = useServerAction(confirmPrices);
  const [moveCat] = useServerAction(moveCategory);

  const shown = useMemo(
    () =>
      categories
        .filter((c) => cat === "all" || c.id === cat)
        .map((c) => ({
          cat: c,
          rows: services.filter(
            (s) => s.categoryId === c.id && (!review || s.needsReview) && (!q || `${s.name} ${s.section ?? ""} ${s.description ?? ""}`.toLowerCase().includes(q.toLowerCase())),
          ),
        })),
    [categories, services, cat, q, review],
  );
  const reviewCount = services.filter((s) => s.needsReview).length;

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une prestation…" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={review ? "primary" : "outline"} onClick={() => setReview((v) => !v)}>
            À vérifier {reviewCount > 0 && <Badge tone="gold">{reviewCount}</Badge>}
          </Button>
          <Button variant="outline" onClick={() => setEditCat("new")}>
            <Settings2 /> Nouvelle catégorie
          </Button>
        </div>
      </div>

      <div className="scrollbar-none -mx-4 mb-6 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        {[{ id: "all", label: "Toutes" }, ...categories].map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={cn("h-10 shrink-0 rounded-full border px-4 text-sm", cat === c.id ? "border-noir bg-noir text-ivoire" : "border-encre/15 bg-white hover:bg-ivoire")}
          >
            {c.label}
          </button>
        ))}
      </div>

      {review && reviewCount > 0 && (
        <Card className="mb-6 flex flex-col gap-3 border-champagne/50 bg-[#fbf6ea] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            Ces tarifs proviennent de l&apos;ancien site. Vérifiez-les, corrigez-les si besoin, puis confirmez-les pour retirer la mention « à vérifier ».
          </p>
          <ConfirmDialog
            trigger={
              <Button variant="primary" loading={confirming}>
                <CheckCheck /> Tout confirmer
              </Button>
            }
            title="Confirmer tous les tarifs ?"
            description="Vous attestez que les prix affichés sont à jour. Vous pourrez toujours les modifier ensuite."
            confirmLabel="Confirmer"
            danger={false}
            onConfirm={() => confirmAll(undefined).then(() => undefined)}
          />
        </Card>
      )}

      <div className="space-y-6">
        {shown.map(({ cat: c, rows }, ci) => (
          <Card key={c.id}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-encre/8 px-4 py-3 md:px-6">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-2xl">{c.label}</h2>
                {!c.isPublished && <Badge tone="red">Onglet masqué</Badge>}
                <span className="text-sm text-taupe">{services.filter((s) => s.categoryId === c.id).length} prestation(s)</span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" aria-label="Monter l'onglet" disabled={ci === 0 && cat === "all"} onClick={() => moveCat(c.id, -1)}>
                  <ArrowUp />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Descendre l'onglet" onClick={() => moveCat(c.id, 1)}>
                  <ArrowDown />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditCat(c)}>
                  <Pencil /> Catégorie
                </Button>
                <Link href={`/admin/prestations/nouvelle?cat=${c.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-noir px-3 text-sm text-ivoire">
                  <Plus className="h-4 w-4" /> Ajouter
                </Link>
              </div>
            </div>
            {c.slug === "forfaits" && <p className="px-6 pt-4 text-sm text-taupe">Les forfaits et formules se gèrent dans « Offres & forfaits » et s&apos;affichent sur la page Offres du site (pas dans la carte des tarifs).</p>}
            {rows.length ? (
              <ul className="divide-y divide-encre/8">
                {rows.map((s, i) => (
                  <li key={s.id} className={cn("flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:px-6", !s.isPublished && "bg-ivoire/60")}>
                    <Link href={`/admin/prestations/${s.id}`} className="min-w-0 flex-1">
                      {s.section && <span className="block text-xs text-or-profond">{s.section}</span>}
                      <span className={cn("block font-medium", !s.isPublished && "text-taupe line-through decoration-encre/30")}>{s.name}</span>
                      <span className="mt-1 flex flex-wrap gap-1.5">
                        {s.needsReview && <Badge tone="gold">À vérifier</Badge>}
                        {!s.isPublished && <Badge tone="neutral">Masquée</Badge>}
                        {s.badge && <Badge tone="neutral">{s.badge}</Badge>}
                        {s.promoLabel && <Badge tone="dark">Promo : {s.promoLabel}</Badge>}
                      </span>
                    </Link>
                    <div className="flex items-center justify-between gap-4 md:justify-end">
                      <span className="text-right tabular-nums">
                        <span className="block font-display text-2xl">{s.priceCents == null ? "Sur devis" : `${s.priceFrom ? "dès " : ""}${formatPrice(s.priceCents)}`}</span>
                        {s.variants.map((v) => (
                          <span key={v.id} className="block text-xs text-taupe">
                            {v.label} : {formatPrice(v.priceCents)}
                          </span>
                        ))}
                        {s.supplementCents != null && <span className="block text-xs text-taupe">+ {formatPrice(s.supplementCents)} longs/épais</span>}
                      </span>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <Button variant="ghost" size="icon" aria-label="Monter" disabled={i === 0} onClick={() => move(s.id, -1)}>
                          <ArrowUp />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Descendre" disabled={i === rows.length - 1} onClick={() => move(s.id, 1)}>
                          <ArrowDown />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label={s.isPublished ? "Masquer" : "Publier"} onClick={() => toggle(s.id, !s.isPublished)}>
                          {s.isPublished ? <Eye /> : <EyeOff />}
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Dupliquer" onClick={() => dup(s.id)}>
                          <Copy />
                        </Button>
                        <Link href={`/admin/prestations/${s.id}`} className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-encre/5" aria-label="Modifier">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <ConfirmDialog
                          trigger={
                            <Button variant="danger-ghost" size="icon" aria-label="Supprimer">
                              <Trash2 />
                            </Button>
                          }
                          title="Supprimer cette prestation ?"
                          description={`« ${s.name} » sera retirée définitivement du site. Pour la cacher temporairement, utilisez plutôt l'œil.`}
                          onConfirm={() => remove(s.id).then(() => undefined)}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              c.slug !== "forfaits" && <p className="px-6 py-6 text-sm text-taupe">{q || review ? "Aucun résultat dans cette catégorie." : "Aucune prestation dans cette catégorie."}</p>
            )}
          </Card>
        ))}
        {!shown.length && <EmptyState title="Aucune catégorie" text="Créez une première catégorie (onglet de la page Tarifs)." />}
      </div>

      <CategorySheet value={editCat} onClose={() => setEditCat(null)} />
    </>
  );
}

function CategorySheet({ value, onClose }: { value: PriceCategory | "new" | null; onClose: () => void }) {
  const c = value === "new" ? null : value;
  const [save, saving] = useServerAction(saveCategory, { onSuccess: onClose });
  const [remove] = useServerAction(deleteCategory, { onSuccess: onClose });
  return (
    <Sheet open={value !== null} onOpenChange={(v) => !v && onClose()} title={c ? `Catégorie « ${c.label} »` : "Nouvelle catégorie"} description="Une catégorie correspond à un onglet de la page Tarifs.">
      <form
        key={c?.id ?? "new"}
        onSubmit={submitWith((fd) => save(fd).then(() => undefined))}
        className="space-y-5"
      >
        {c && <input type="hidden" name="id" value={c.id} />}
        <Field label="Nom de l'onglet" htmlFor="label">
          <Input id="label" name="label" defaultValue={c?.label} required />
        </Field>
        <Field label="Phrase d'introduction" htmlFor="intro">
          <Textarea id="intro" name="intro" defaultValue={c?.intro ?? ""} rows={3} />
        </Field>
        <Field label="Note en bas de l'onglet (facultatif)" htmlFor="footnote">
          <Input id="footnote" name="footnote" defaultValue={c?.footnote ?? ""} />
        </Field>
        <Switch name="isPublished" defaultChecked={c?.isPublished ?? true} label="Onglet visible sur le site" />
        <div className="flex flex-wrap justify-between gap-2 pt-2">
          {c ? (
            <ConfirmDialog
              trigger={
                <Button type="button" variant="danger-ghost">
                  <Trash2 /> Supprimer
                </Button>
              }
              title="Supprimer la catégorie ?"
              description="Possible uniquement si elle ne contient plus aucune prestation."
              onConfirm={() => remove(c.id).then(() => undefined)}
            />
          ) : (
            <span />
          )}
          <Button type="submit" loading={saving}>
            Enregistrer
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
