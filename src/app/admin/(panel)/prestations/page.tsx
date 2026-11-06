import Link from "next/link";
import { asc } from "drizzle-orm";
import { Plus } from "lucide-react";
import {PageHeader } from "@/components/admin/ui";
import { buttonVariants } from "@/components/admin/button-variants";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { ServicesBoard } from "./services-board";

export const dynamic = "force-dynamic";
export const metadata = { title: "Prestations & prix" };

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ verifier?: string; cat?: string }> }) {
  await requireUser();
  const db = getDb();
  const [cats, svcs, vars, sp] = await Promise.all([
    db.select().from(schema.priceCategories).orderBy(asc(schema.priceCategories.sortOrder)),
    db.select().from(schema.services).orderBy(asc(schema.services.sortOrder)),
    db.select().from(schema.serviceVariants).orderBy(asc(schema.serviceVariants.sortOrder)),
    searchParams,
  ]);
  return (
    <>
      <PageHeader
        title="Prestations & prix"
        description="Modifiez un prix, ajoutez une prestation, masquez-la ou changez l'ordre d'affichage. Chaque enregistrement est immédiatement visible sur la page Tarifs."
        actions={
          <Link href="/admin/prestations/nouvelle" className={buttonVariants({ variant: "gold" })}>
            <Plus /> Ajouter une prestation
          </Link>
        }
      />
      <ServicesBoard
        categories={cats}
        services={svcs.map((s) => ({ ...s, variants: vars.filter((v) => v.serviceId === s.id) }))}
        onlyReview={sp.verifier === "1"}
        initialCat={sp.cat}
      />
    </>
  );
}
