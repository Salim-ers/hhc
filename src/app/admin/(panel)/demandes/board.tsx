"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Mail, MapPin, MessageSquare, Phone, Search, Trash2 } from "lucide-react";
import { Badge, Button, Card, ConfirmDialog, EmptyState, Field, Input, Select, Sheet, Textarea } from "@/components/admin/ui";
import { useServerAction } from "@/components/admin/use-action";
import { deleteRequest, updateRequest } from "@/app/admin/_actions/requests";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/admin/labels";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  commune: string;
  service: string;
  preferredDate: string | null;
  timeSlot: string | null;
  message: string | null;
  status: keyof typeof STATUS_LABEL;
  internalNote: string | null;
  emailNotified: boolean;
  sourcePage: string | null;
  createdAt: string;
  consentAt: string;
};

const fmt = (iso: string) => new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Paris" });
const tel = (p: string) => `tel:${p.replace(/[^+\d]/g, "")}`;

export function RequestsBoard({ rows, openId, canDelete }: { rows: Row[]; openId?: string; canDelete: boolean }) {
  const [status, setStatus] = useState<string>("actives");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Row | null>(null);
  useEffect(() => {
    if (openId) setSel(rows.find((r) => r.id === openId) ?? null);
  }, [openId, rows]);
  useEffect(() => {
    if (sel) setSel(rows.find((r) => r.id === sel.id) ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { actives: 0, toutes: rows.length };
    for (const r of rows) {
      c[r.status] = (c[r.status] ?? 0) + 1;
      if (!["terminee", "annulee"].includes(r.status)) c.actives++;
    }
    return c;
  }, [rows]);

  const shown = rows.filter((r) => {
    const okStatus = status === "toutes" ? true : status === "actives" ? !["terminee", "annulee"].includes(r.status) : r.status === status;
    const okQ = !q || `${r.fullName} ${r.phone} ${r.email ?? ""} ${r.commune} ${r.service} ${r.message ?? ""}`.toLowerCase().includes(q.toLowerCase());
    return okStatus && okQ;
  });

  const filters = [
    { v: "actives", l: "En cours" },
    ...Object.entries(STATUS_LABEL).map(([v, l]) => ({ v, l })),
    { v: "toutes", l: "Toutes" },
  ];

  return (
    <>
      <div className="mb-4 relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un nom, une commune, un téléphone…" className="pl-9" />
      </div>
      <div className="scrollbar-none -mx-4 mb-5 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        {filters.map((f) => (
          <button
            key={f.v}
            onClick={() => setStatus(f.v)}
            className={cn("h-10 shrink-0 rounded-full border px-4 text-sm", status === f.v ? "border-noir bg-noir text-ivoire" : "border-encre/15 bg-white")}
          >
            {f.l} <span className="opacity-60">{counts[f.v] ?? 0}</span>
          </button>
        ))}
      </div>
      {shown.length ? (
        <Card>
          <ul className="divide-y divide-encre/8">
            {shown.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => setSel(r)} className={cn("flex w-full items-center gap-4 px-4 py-4 text-left hover:bg-ivoire md:px-6", r.status === "nouvelle" && "bg-[#fbf6ea]")}>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{r.fullName}</span>
                    <span className="block truncate text-sm text-taupe">
                      {r.service} · {r.commune}
                      {r.preferredDate ? ` · souhaité le ${new Date(r.preferredDate).toLocaleDateString("fr-FR")}` : ""}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                    <span className="text-xs text-taupe">{fmt(r.createdAt)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <EmptyState title="Aucune demande" text={q || status !== "actives" ? "Aucun résultat pour ce filtre." : "Les demandes envoyées depuis le site apparaîtront ici."} />
      )}
      <RequestSheet row={sel} onClose={() => setSel(null)} canDelete={canDelete} />
    </>
  );
}

function RequestSheet({ row, onClose, canDelete }: { row: Row | null; onClose: () => void; canDelete: boolean }) {
  const [note, setNote] = useState("");
  const [update, updating] = useServerAction(updateRequest);
  const [remove] = useServerAction(deleteRequest, { onSuccess: onClose });
  useEffect(() => setNote(row?.internalNote ?? ""), [row]);
  return (
    <Sheet open={!!row} onOpenChange={(v) => !v && onClose()} title={row?.fullName ?? ""} description={row ? `Reçue le ${fmt(row.createdAt)}` : undefined}>
      {row && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-2">
            <Button asChild size="lg">
              <a href={tel(row.phone)}>
                <Phone /> Appeler
              </a>
            </Button>
            {row.email ? (
              <Button asChild size="lg" variant="outline">
                <a href={`mailto:${row.email}?subject=${encodeURIComponent("Votre demande de rendez-vous — Hair Home Concept")}`}>
                  <Mail /> E-mail
                </a>
              </Button>
            ) : (
              <Button asChild size="lg" variant="outline">
                <a href={`sms:${row.phone.replace(/[^+\d]/g, "")}`}>
                  <MessageSquare /> SMS
                </a>
              </Button>
            )}
          </div>
          <dl className="divide-y divide-encre/8 rounded-xl border border-encre/10 bg-white">
            {[
              [Phone, "Téléphone", row.phone],
              [Mail, "E-mail", row.email ?? "—"],
              [MapPin, "Commune", row.commune],
              [CalendarDays, "Date souhaitée", row.preferredDate ? new Date(row.preferredDate).toLocaleDateString("fr-FR", { dateStyle: "full" }) : "—"],
              [CalendarDays, "Créneau", row.timeSlot ?? "—"],
            ].map(([Icon, k, v]) => {
              const I = Icon as typeof Phone;
              return (
                <div key={k as string} className="flex gap-3 px-4 py-3">
                  <I className="mt-0.5 h-4 w-4 shrink-0 text-or-profond" />
                  <dt className="w-28 shrink-0 text-sm text-taupe">{k as string}</dt>
                  <dd className="min-w-0 break-words">{v as string}</dd>
                </div>
              );
            })}
            <div className="px-4 py-3">
              <dt className="text-sm text-taupe">Prestation</dt>
              <dd className="font-medium">{row.service}</dd>
            </div>
            {row.message && (
              <div className="px-4 py-3">
                <dt className="text-sm text-taupe">Message</dt>
                <dd className="whitespace-pre-wrap">{row.message}</dd>
              </div>
            )}
          </dl>
          <Field label="Statut" htmlFor="status">
            <Select id="status" value={row.status} onChange={(e) => update(row.id, { status: e.target.value })} disabled={updating}>
              {Object.entries(STATUS_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Note interne" htmlFor="note" hint="Visible uniquement dans l'administration.">
            <Textarea id="note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex. rappelée le 12/11, RDV proposé jeudi 14h" />
          </Field>
          <Button variant="outline" onClick={() => update(row.id, { internalNote: note })} loading={updating}>
            Enregistrer la note
          </Button>
          <p className="text-xs text-taupe">
            Consentement RGPD donné le {fmt(row.consentAt)} · notification e-mail {row.emailNotified ? "envoyée" : "non envoyée"} · depuis la page {row.sourcePage ?? "—"}
          </p>
          {canDelete && (
            <ConfirmDialog
              trigger={
                <Button variant="danger-ghost">
                  <Trash2 /> Supprimer définitivement
                </Button>
              }
              title="Supprimer cette demande ?"
              description="Action irréversible (par exemple pour répondre à une demande d'effacement RGPD)."
              onConfirm={() => remove(row.id).then(() => undefined)}
            />
          )}
        </div>
      )}
    </Sheet>
  );
}
