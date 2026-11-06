import { asc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { OffersBoard } from "./offers-board";

export const dynamic = "force-dynamic";
export const metadata = { title: "Offres & forfaits" };

export default async function OffersPage() {
  await requireUser();
  const offers = await getDb().select().from(schema.offers).orderBy(asc(schema.offers.sortOrder));
  return (
    <>
      <PageHeader
        title="Offres & forfaits"
        description="Forfaits Beauty Color, formules, parrainage, bons cadeaux et bannières. Une offre en brouillon, expirée ou pas encore commencée n'est jamais affichée."
      />
      <OffersBoard offers={offers} />
    </>
  );
}
