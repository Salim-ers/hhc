import Link from "next/link";
import { asc } from "drizzle-orm";
import { ChevronRight } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { PAGES } from "@/lib/content/section-registry";

export const dynamic = "force-dynamic";
export const metadata = { title: "Textes & pages" };

export default async function ContentIndex() {
  await requireUser();
  const db = getDb();
  const [pages, sections] = await Promise.all([
    db.select().from(schema.pages).orderBy(asc(schema.pages.sortOrder)),
    db.select({ pageKey: schema.sections.pageKey, pending: schema.sections.hasUnpublishedChanges, visible: schema.sections.visible }).from(schema.sections),
  ]);
  return (
    <>
      <PageHeader title="Textes & pages" description="Modifiez les titres, textes, images et boutons de chaque page. Vous pouvez enregistrer un brouillon, le prévisualiser, puis le publier." />
      <Card>
        <ul className="divide-y divide-encre/8">
          {PAGES.map((def) => {
            const p = pages.find((x) => x.key === def.key);
            const secs = sections.filter((s) => s.pageKey === def.key);
            const pending = secs.filter((s) => s.pending).length;
            return (
              <li key={def.key}>
                <Link href={`/admin/contenus/${def.key}`} className="flex items-center gap-4 px-4 py-4 hover:bg-ivoire md:px-6">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{def.title}</span>
                    <span className="block text-sm text-taupe">
                      {def.path} · {secs.length} section(s)
                    </span>
                  </span>
                  <span className="flex flex-wrap justify-end gap-1.5">
                    {p?.status === "draft" ? <Badge tone="neutral">Page en brouillon</Badge> : <Badge tone="green">En ligne</Badge>}
                    {pending > 0 && <Badge tone="gold">{pending} brouillon(s) à publier</Badge>}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-taupe" />
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
