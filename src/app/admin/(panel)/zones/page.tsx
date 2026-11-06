import { asc } from "drizzle-orm";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { AreasBoard } from "./board";

export const dynamic = "force-dynamic";
export const metadata = { title: "Communes desservies" };

export default async function ZonesAdmin() {
  await requireUser();
  const items = await getDb().select().from(schema.serviceAreas).orderBy(asc(schema.serviceAreas.sortOrder));
  return (
    <>
      <PageHeader
        title="Communes desservies"
        description="Liste affichée sur la page Zone d'intervention et proposée dans le formulaire. Les textes sur les frais de déplacement se règlent dans Paramètres."
        actions={<Link href="/admin/parametres#travel" className="text-sm text-or-profond underline-offset-4 hover:underline">Frais de déplacement</Link>}
      />
      <AreasBoard items={items} />
    </>
  );
}
