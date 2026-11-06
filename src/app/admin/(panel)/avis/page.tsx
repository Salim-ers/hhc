import { asc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { ReviewsBoard } from "./board";

export const dynamic = "force-dynamic";
export const metadata = { title: "Avis clients" };

export default async function AvisAdmin() {
  await requireUser();
  const items = await getDb().select().from(schema.testimonials).orderBy(asc(schema.testimonials.sortOrder));
  return (
    <>
      <PageHeader
        title="Avis clients"
        description="Publiez uniquement des témoignages authentiques, avec l'accord de la personne. Sans avis publié, l'accueil affiche une invitation à laisser un avis."
      />
      <ReviewsBoard items={items} />
    </>
  );
}
