import { asc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { FaqBoard } from "./board";

export const dynamic = "force-dynamic";
export const metadata = { title: "Questions fréquentes" };

export default async function FaqAdmin() {
  await requireUser();
  const items = await getDb().select().from(schema.faqs).orderBy(asc(schema.faqs.sortOrder));
  return (
    <>
      <PageHeader title="Questions fréquentes" description="Affichées sur la page d'accueil et lues par Google et les assistants IA (données structurées FAQ)." />
      <FaqBoard items={items} />
    </>
  );
}
