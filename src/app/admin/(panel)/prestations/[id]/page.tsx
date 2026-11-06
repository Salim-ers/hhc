import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { ServiceForm } from "./service-form";

export const dynamic = "force-dynamic";

export default async function EditServicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ cat?: string }> }) {
  await requireUser();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const db = getDb();
  const cats = await db.select().from(schema.priceCategories).orderBy(asc(schema.priceCategories.sortOrder));
  const isNew = id === "nouvelle";
  let service = null;
  let variants: { label: string; priceCents: number }[] = [];
  if (!isNew) {
    if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
    [service] = await db.select().from(schema.services).where(eq(schema.services.id, id));
    if (!service) notFound();
    variants = await db.select().from(schema.serviceVariants).where(eq(schema.serviceVariants.serviceId, id)).orderBy(asc(schema.serviceVariants.sortOrder));
  }
  const sections = [...new Set((await db.select({ s: schema.services.section }).from(schema.services)).map((r) => r.s).filter(Boolean))] as string[];
  const cat = cats.find((c) => c.id === (service?.categoryId ?? sp.cat));
  return (
    <>
      <Link href="/admin/prestations" className="mb-4 inline-flex items-center gap-1 text-sm text-taupe hover:text-encre">
        <ChevronLeft className="h-4 w-4" /> Prestations & prix
      </Link>
      <PageHeader title={isNew ? "Nouvelle prestation" : service!.name} description={cat ? `Onglet « ${cat.label} » de la page Tarifs` : undefined} />
      <ServiceForm categories={cats.filter((c) => c.slug !== "forfaits")} service={service} variants={variants} defaultCategory={sp.cat} sections={sections} previewHref={`/tarifs#${cat?.slug ?? ""}`} />
    </>
  );
}
