import Link from "next/link";
import { and, count, desc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { ArrowUpRight, BadgePercent, FileText, Image as ImageIcon, Inbox, Scissors } from "lucide-react";
import { Badge, Card, CardHeader, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/admin/labels";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ refus?: string }> }) {
  const user = await requireUser();
  const db = getDb();
  const now = new Date();
  const sp = await searchParams;
  const r = schema.appointmentRequests;
  const o = schema.offers;
  const [[published], [hidden], [toReview], [newReq], [totalReq], [activeOffers], [stockImgs], latest, history] = await Promise.all([
    db.select({ n: count() }).from(schema.services).where(eq(schema.services.isPublished, true)),
    db.select({ n: count() }).from(schema.services).where(eq(schema.services.isPublished, false)),
    db.select({ n: count() }).from(schema.services).where(eq(schema.services.needsReview, true)),
    db.select({ n: count() }).from(r).where(eq(r.status, "nouvelle")),
    db.select({ n: count() }).from(r),
    db
      .select({ n: count() })
      .from(o)
      .where(and(eq(o.status, "published"), or(isNull(o.startsAt), lte(o.startsAt, now)), or(isNull(o.endsAt), gte(o.endsAt, now)))),
    db.select({ n: count() }).from(schema.media).where(eq(schema.media.isStock, true)),
    db.select().from(r).orderBy(desc(r.createdAt)).limit(5),
    db.select().from(schema.auditLog).orderBy(desc(schema.auditLog.createdAt)).limit(8),
  ]);

  const hour = Number(new Intl.DateTimeFormat("fr-FR", { hour: "numeric", timeZone: "Europe/Paris" }).format(now));
  const hello = hour < 18 ? "Bonjour" : "Bonsoir";
  const stats = [
    { label: "Nouvelles demandes", value: newReq.n, sub: `${totalReq.n} au total`, href: "/admin/demandes", icon: Inbox, accent: newReq.n > 0 },
    { label: "Prestations publiées", value: published.n, sub: hidden.n ? `${hidden.n} masquée(s)` : "Toutes visibles", href: "/admin/prestations", icon: Scissors },
    { label: "Offres en cours", value: activeOffers.n, sub: "visibles sur le site", href: "/admin/offres", icon: BadgePercent },
    { label: "Photos temporaires", value: stockImgs.n, sub: "à remplacer par vos réalisations", href: "/admin/medias", icon: ImageIcon },
  ];

  return (
    <>
      <PageHeader title={`${hello} ${user.name}`} description="Voici l'essentiel de votre site aujourd'hui." />
      {sp.refus && <p className="mb-6 rounded-xl bg-[#f6e2de] px-4 py-3 text-sm text-[#9f3a2c]">Cette page est réservée au compte propriétaire.</p>}

      {toReview.n > 0 && (
        <Link href="/admin/prestations?verifier=1" className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-champagne/50 bg-champagne/15 px-5 py-4">
          <span>
            <strong className="font-medium">{toReview.n} tarifs importés de l&apos;ancien site</strong> sont à vérifier avant la mise en ligne
            définitive.
          </span>
          <ArrowUpRight className="h-5 w-5 shrink-0" />
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group">
            <Card className={`h-full p-5 transition-shadow group-hover:shadow-md ${s.accent ? "border-champagne bg-[#fbf6ea]" : ""}`}>
              <s.icon className="h-5 w-5 text-or-profond" />
              <p className="mt-4 font-display text-4xl">{s.value}</p>
              <p className="mt-1 text-sm font-medium">{s.label}</p>
              <p className="text-xs text-taupe">{s.sub}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Dernières demandes" actions={<Link href="/admin/demandes" className="text-sm text-or-profond underline-offset-4 hover:underline">Tout voir</Link>} />
          {latest.length ? (
            <ul className="divide-y divide-encre/8">
              {latest.map((q) => (
                <li key={q.id}>
                  <Link href={`/admin/demandes?id=${q.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-ivoire md:px-6">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{q.fullName}</span>
                      <span className="block truncate text-sm text-taupe">
                        {q.service} · {q.commune}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <Badge tone={STATUS_TONE[q.status]}>{STATUS_LABEL[q.status]}</Badge>
                      <span className="text-xs text-taupe">{q.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-6 py-10 text-center text-taupe">Aucune demande pour le moment. Elles apparaîtront ici dès leur envoi depuis le site.</p>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Accès rapides" />
          <div className="grid grid-cols-2 gap-2 p-4">
            {[
              { href: "/admin/prestations", label: "Modifier un prix", icon: Scissors },
              { href: "/admin/prestations/nouvelle", label: "Ajouter une prestation", icon: Scissors },
              { href: "/admin/medias", label: "Changer une photo", icon: ImageIcon },
              { href: "/admin/contenus/home", label: "Textes de l'accueil", icon: FileText },
              { href: "/admin/offres", label: "Créer une offre", icon: BadgePercent },
              { href: "/admin/parametres", label: "Horaires & contact", icon: FileText },
            ].map((a) => (
              <Link key={a.label} href={a.href} className="flex min-h-20 flex-col justify-between rounded-xl border border-encre/10 p-3 text-sm hover:border-or-profond/40 hover:bg-ivoire">
                <a.icon className="h-4 w-4 text-or-profond" />
                {a.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Dernières modifications" actions={<Link href="/admin/historique" className="text-sm text-or-profond underline-offset-4 hover:underline">Historique complet</Link>} />
        {history.length ? (
          <ul className="divide-y divide-encre/8">
            {history.map((h) => (
              <li key={h.id} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3 text-sm md:px-6">
                <span>{h.summary}</span>
                <span className="text-xs text-taupe">
                  {h.userName ?? "—"} · {h.createdAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 py-8 text-center text-taupe">Aucune modification enregistrée pour l&apos;instant.</p>
        )}
      </Card>
    </>
  );
}
