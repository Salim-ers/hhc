import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { RequestsBoard } from "./board";

export const dynamic = "force-dynamic";
export const metadata = { title: "Demandes de rendez-vous" };

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const user = await requireUser();
  const [rows, sp] = await Promise.all([getDb().select().from(schema.appointmentRequests).orderBy(desc(schema.appointmentRequests.createdAt)).limit(1000), searchParams]);
  return (
    <>
      <PageHeader title="Demandes de rendez-vous" description="Chaque demande envoyée depuis le site arrive ici (et par e-mail). Rappelez la personne, puis faites évoluer le statut." />
      <RequestsBoard
        rows={rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(), consentAt: r.consentAt.toISOString() }))}
        openId={sp.id}
        canDelete={user.role === "owner"}
      />
    </>
  );
}
