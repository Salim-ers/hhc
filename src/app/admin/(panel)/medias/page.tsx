import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { MediaLibrary } from "./media-library";

export const dynamic = "force-dynamic";
export const metadata = { title: "Médiathèque" };

export default async function MediaPage() {
  await requireUser();
  const items = await getDb().select().from(schema.media).orderBy(desc(schema.media.createdAt));
  return (
    <>
      <PageHeader
        title="Médiathèque"
        description="Toutes les images du site. « Remplacer » change une photo partout où elle apparaît — idéal pour remplacer les photos temporaires par vos réalisations."
      />
      <MediaLibrary items={items} />
    </>
  );
}
