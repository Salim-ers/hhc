import { desc } from "drizzle-orm";
import { Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Historique" };

const ACTION: Record<string, string> = { create: "Ajout", update: "Modification", delete: "Suppression", publish: "Publication", unpublish: "Retrait", draft: "Brouillon" };

export default async function HistoryPage() {
  await requireUser();
  const rows = await getDb().select().from(schema.auditLog).orderBy(desc(schema.auditLog.createdAt)).limit(300);
  return (
    <>
      <PageHeader title="Historique" description="Les 300 dernières modifications importantes : qui, quoi, quand." />
      {rows.length ? (
        <Card>
          <ul className="divide-y divide-encre/8">
            {rows.map((r) => (
              <li key={r.id} className="grid gap-1 px-4 py-3 text-sm md:grid-cols-[10rem_7rem_1fr_9rem] md:items-baseline md:px-6">
                <span className="text-taupe">{r.createdAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" })}</span>
                <span className="text-or-profond">{ACTION[r.action] ?? r.action}</span>
                <span>{r.summary}</span>
                <span className="text-taupe md:text-right">{r.userName ?? "—"}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <EmptyState title="Aucune modification" text="Les modifications apparaîtront ici." />
      )}
    </>
  );
}
