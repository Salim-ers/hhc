import { asc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { GalleryBoard } from "./board";

export const dynamic = "force-dynamic";
export const metadata = { title: "Galerie" };

export default async function GalleryAdmin() {
  await requireUser();
  const items = await getDb().select().from(schema.galleryItems).orderBy(asc(schema.galleryItems.sortOrder));
  return (
    <>
      <PageHeader title="Galerie" description="Les photos de la page Galerie et de la mosaïque d'accueil (les 8 premières). Ajoutez vos réalisations et masquez les photos temporaires." />
      <GalleryBoard items={items} />
    </>
  );
}
