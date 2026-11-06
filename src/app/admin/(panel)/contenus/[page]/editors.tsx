"use client";

import { useId, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, Plus, RotateCcw, Trash2 } from "lucide-react";
import { ImagePicker } from "@/components/admin/image-picker";
import { Badge, Button, Card, CardHeader, ConfirmDialog, Field, Input, Select, Textarea } from "@/components/admin/ui";
import { submitWith, useServerAction } from "@/components/admin/use-action";
import { discardSectionDraft, moveSection, publishSection, saveSectionDraft, savePageSettings, setSectionVisible } from "@/app/admin/_actions/content";
import type { FieldDef, SectionDef } from "@/lib/content/section-registry";
import { cn } from "@/lib/utils";

type Content = Record<string, unknown>;

export function SectionEditor({
  pageKey,
  path,
  def,
  draft,
  visible,
  pending,
  publishedAt,
  first,
  last,
}: {
  pageKey: string;
  path: string;
  def: SectionDef;
  draft: Content;
  visible: boolean;
  pending: boolean;
  publishedAt: string | null;
  first: boolean;
  last: boolean;
}) {
  const [open, setOpen] = useState(first);
  const [content, setContent] = useState<Content>(draft);
  const [dirty, setDirty] = useState(false);
  const [saveDraft, savingDraft] = useServerAction(saveSectionDraft, { onSuccess: () => setDirty(false) });
  const [publish, publishing] = useServerAction(publishSection, { onSuccess: () => setDirty(false) });
  const [discard] = useServerAction(discardSectionDraft, { onSuccess: () => window.location.reload() });
  const [toggle] = useServerAction(setSectionVisible);
  const [move] = useServerAction(moveSection);

  const update = (name: string, v: unknown) => {
    setContent((c) => ({ ...c, [name]: v }));
    setDirty(true);
  };

  return (
    <Card className={cn(!visible && "opacity-75")}>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-6">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={open}>
          <ChevronDown className={cn("h-5 w-5 shrink-0 text-taupe transition-transform", open && "rotate-180")} />
          <span className="min-w-0">
            <span className="block font-display text-xl">{def.label}</span>
            <span className="flex flex-wrap gap-1.5 pt-0.5">
              {!visible && <Badge tone="neutral">Masquée</Badge>}
              {(pending || dirty) && <Badge tone="gold">{dirty ? "Modifications non enregistrées" : "Brouillon non publié"}</Badge>}
              {!pending && !dirty && publishedAt && <span className="text-xs text-taupe">En ligne · {new Date(publishedAt).toLocaleDateString("fr-FR")}</span>}
            </span>
          </span>
        </button>
        <div className="flex items-center gap-0.5">
          {!def.locked && (
            <>
              <Button variant="ghost" size="icon" aria-label="Monter la section" disabled={first} onClick={() => move(pageKey, def.key, -1)}>
                <ArrowUp />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Descendre la section" disabled={last} onClick={() => move(pageKey, def.key, 1)}>
                <ArrowDown />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toggle(pageKey, def.key, !visible)}>
                {visible ? <Eye /> : <EyeOff />} {visible ? "Affichée" : "Masquée"}
              </Button>
            </>
          )}
        </div>
      </div>
      {open && (
        <div className="border-t border-encre/8 px-4 py-5 md:px-6">
          {def.description && <p className="mb-5 text-sm text-taupe">{def.description}</p>}
          <div className="grid gap-5">
            {def.fields.map((f) => (
              <FieldEditor key={f.name} field={f} value={content[f.name]} onChange={(v) => update(f.name, v)} />
            ))}
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-encre/8 pt-5 sm:flex-row sm:items-center sm:justify-end">
            {pending && !dirty && (
              <ConfirmDialog
                trigger={
                  <Button variant="ghost" className="sm:mr-auto">
                    <RotateCcw /> Annuler le brouillon
                  </Button>
                }
                title="Revenir à la version en ligne ?"
                description="Les modifications non publiées de cette section seront perdues."
                confirmLabel="Revenir à la version en ligne"
                onConfirm={() => discard(pageKey, def.key).then(() => undefined)}
              />
            )}
            <Button variant="outline" loading={savingDraft} onClick={() => saveDraft(pageKey, def.key, content)}>
              Enregistrer le brouillon
            </Button>
            <Button asChild variant="outline">
              <a
                href={`/api/preview?path=${encodeURIComponent(path)}`}
                target="_blank"
                rel="noopener"
                onClick={async (e) => {
                  if (dirty) {
                    e.preventDefault();
                    const r = await saveDraft(pageKey, def.key, content);
                    if (r.ok) window.open(`/api/preview?path=${encodeURIComponent(path)}`, "_blank");
                  }
                }}
              >
                Aperçu
              </a>
            </Button>
            <Button loading={publishing} onClick={() => publish(pageKey, def.key, content)}>
              Publier
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function FieldEditor({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const id = useId();
  switch (field.type) {
    case "text":
      return (
        <Field label={field.label} htmlFor={id} hint={field.help}>
          <Input id={id} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
        </Field>
      );
    case "textarea":
      return (
        <Field label={field.label} htmlFor={id} hint={field.help ?? "Laissez une ligne vide pour créer un nouveau paragraphe."}>
          <Textarea id={id} rows={field.rows ?? 4} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
        </Field>
      );
    case "image":
      return <ImagePicker label={field.label} value={(value as { url: string; alt: string }) ?? null} onChange={(v) => onChange(v ?? { url: "", alt: "" })} />;
    case "link": {
      const l = (value as { label: string; href: string }) ?? { label: "", href: "" };
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={`${field.label} — texte`} htmlFor={`${id}-l`}>
            <Input id={`${id}-l`} value={l.label} onChange={(e) => onChange({ ...l, label: e.target.value })} />
          </Field>
          <Field label={`${field.label} — lien`} htmlFor={`${id}-h`} hint="Ex. /contact, /tarifs#femme ou https://…">
            <Select
              id={`${id}-h`}
              value={INTERNAL_LINKS.some((x) => x.href === l.href) ? l.href : "__custom"}
              onChange={(e) => e.target.value !== "__custom" && onChange({ ...l, href: e.target.value })}
            >
              {INTERNAL_LINKS.map((x) => (
                <option key={x.href} value={x.href}>
                  {x.label}
                </option>
              ))}
              <option value="__custom">Autre lien…</option>
            </Select>
            {!INTERNAL_LINKS.some((x) => x.href === l.href) && (
              <Input className="mt-2" value={l.href} onChange={(e) => onChange({ ...l, href: e.target.value })} placeholder="https://" aria-label="Lien personnalisé" />
            )}
          </Field>
        </div>
      );
    }
    case "list": {
      const items = (Array.isArray(value) ? value : []) as Content[];
      const set = (next: Content[]) => onChange(next);
      return (
        <div>
          <p className="text-sm font-medium">{field.label}</p>
          <ol className="mt-2 space-y-3">
            {items.map((it, i) => (
              <li key={i} className="rounded-xl border border-encre/10 bg-ivoire/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-taupe">
                    {field.itemLabel} {i + 1}
                  </span>
                  <span className="flex gap-0.5">
                    <Button type="button" variant="ghost" size="icon" aria-label="Monter" disabled={i === 0} onClick={() => set(swap(items, i, i - 1))}>
                      <ArrowUp />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" aria-label="Descendre" disabled={i === items.length - 1} onClick={() => set(swap(items, i, i + 1))}>
                      <ArrowDown />
                    </Button>
                    <Button type="button" variant="danger-ghost" size="icon" aria-label="Retirer" onClick={() => set(items.filter((_, j) => j !== i))}>
                      <Trash2 />
                    </Button>
                  </span>
                </div>
                <div className="grid gap-4">
                  {field.fields.map((sf) => (
                    <FieldEditor key={sf.name} field={sf} value={it[sf.name]} onChange={(v) => set(items.map((x, j) => (j === i ? { ...x, [sf.name]: v } : x)))} />
                  ))}
                </div>
              </li>
            ))}
          </ol>
          {(!field.max || items.length < field.max) && (
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => set([...items, {}])}>
              <Plus /> Ajouter : {field.itemLabel.toLowerCase()}
            </Button>
          )}
        </div>
      );
    }
  }
}

const swap = <T,>(arr: T[], a: number, b: number) => {
  const n = [...arr];
  [n[a], n[b]] = [n[b], n[a]];
  return n;
};

const INTERNAL_LINKS = [
  { href: "/contact", label: "Contact & rendez-vous" },
  { href: "/prestations", label: "Prestations" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/tarifs#femme", label: "Tarifs — Femme" },
  { href: "/tarifs#homme", label: "Tarifs — Homme" },
  { href: "/tarifs#coloration", label: "Tarifs — Coloration" },
  { href: "/tarifs#balayage-meches", label: "Tarifs — Balayage & mèches" },
  { href: "/coloriste-visagiste", label: "Coloriste & visagiste" },
  { href: "/forfaits-offres", label: "Forfaits & offres" },
  { href: "/galerie", label: "Galerie" },
  { href: "/a-propos", label: "À propos" },
  { href: "/zone-intervention", label: "Zone d'intervention" },
  { href: "/bijoux-cadeaux", label: "Bijoux & cadeaux" },
];

export function PageSettingsForm(p: { pageKey: string; canBeDraft: boolean; status: "draft" | "published"; seoTitle: string; seoDescription: string; ogImageUrl: string }) {
  const [save, saving] = useServerAction(savePageSettings);
  const [title, setTitle] = useState(p.seoTitle);
  const [desc, setDesc] = useState(p.seoDescription);
  const [og, setOg] = useState(p.ogImageUrl ? { url: p.ogImageUrl, alt: "" } : null);
  return (
    <Card>
      <CardHeader title="Référencement & statut de la page" description="Ce que Google et les réseaux sociaux affichent." />
      <form
        onSubmit={submitWith((fd) => {
          fd.set("ogImageUrl", og?.url ?? "");
          return save(fd).then(() => undefined);
        })}
        className="grid gap-5 p-5 md:p-6"
      >
        <input type="hidden" name="key" value={p.pageKey} />
        <Field label={`Titre pour Google (${title.length}/60 conseillés)`} htmlFor="seoTitle">
          <Input id="seoTitle" name="seoTitle" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
        </Field>
        <Field label={`Description pour Google (${desc.length}/160 conseillés)`} htmlFor="seoDescription">
          <Textarea id="seoDescription" name="seoDescription" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={320} />
        </Field>
        <div className="rounded-xl border border-encre/10 bg-white p-4">
          <p className="text-xs text-taupe">Aperçu Google</p>
          <p className="mt-1 truncate text-[1.05rem] text-[#1a0dab]">{title} | Hair Home Concept</p>
          <p className="line-clamp-2 text-sm text-[#4d5156]">{desc}</p>
        </div>
        <ImagePicker label="Image de partage (réseaux sociaux)" value={og} onChange={setOg} />
        {p.canBeDraft && (
          <Field label="Statut de la page" htmlFor="status" hint="Une page en brouillon disparaît du menu et du site, mais reste modifiable.">
            <Select id="status" name="status" defaultValue={p.status}>
              <option value="published">En ligne</option>
              <option value="draft">Brouillon (invisible)</option>
            </Select>
          </Field>
        )}
        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            Enregistrer
          </Button>
        </div>
      </form>
    </Card>
  );
}
