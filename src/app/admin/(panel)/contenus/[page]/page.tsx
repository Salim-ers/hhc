import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ChevronLeft, ExternalLink } from "lucide-react";
import {PageHeader } from "@/components/admin/ui";
import { buttonVariants } from "@/components/admin/button-variants";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { getPageDef } from "@/lib/content/section-registry";
import { PageSettingsForm, SectionEditor } from "./editors";

export const dynamic = "force-dynamic";

export default async function PageEditor({ params }: { params: Promise<{ page: string }> }) {
  await requireUser();
  const { page: key } = await params;
  const def = getPageDef(key);
  if (!def) notFound();
  const db = getDb();
  const [[page], rows] = await Promise.all([
    db.select().from(schema.pages).where(eq(schema.pages.key, key)),
    db.select().from(schema.sections).where(eq(schema.sections.pageKey, key)).orderBy(asc(schema.sections.sortOrder)),
  ]);
  const ordered = [
    ...rows.map((r) => ({ row: r, def: def.sections.find((s) => s.key === r.key) })).filter((x) => x.def),
    ...def.sections.filter((s) => !rows.find((r) => r.key === s.key)).map((s) => ({ row: null, def: s })),
  ];
  return (
    <>
      <Link href="/admin/contenus" className="mb-4 inline-flex items-center gap-1 text-sm text-taupe hover:text-encre">
        <ChevronLeft className="h-4 w-4" /> Textes & pages
      </Link>
      <PageHeader
        title={def.title}
        description="Chaque section s'enregistre séparément. « Publier » met la section en ligne immédiatement."
        actions={
          <a href={`/api/preview?path=${encodeURIComponent(def.path)}`} target="_blank" rel="noopener" className={buttonVariants({ variant: "outline" })}>
            <ExternalLink /> Aperçu des brouillons
          </a>
        }
      />
      <div className="space-y-4">
        {ordered.map(({ row, def: sdef }, i) => (
          <SectionEditor
            key={sdef!.key}
            pageKey={key}
            path={def.path}
            def={sdef!}
            draft={{ ...sdef!.defaults, ...((row?.draft as Record<string, unknown>) ?? {}) }}
            visible={row?.visible ?? true}
            pending={row?.hasUnpublishedChanges ?? false}
            publishedAt={row?.publishedAt?.toISOString() ?? null}
            first={i === 0}
            last={i === ordered.length - 1}
          />
        ))}
      </div>
      <div className="mt-10">
        <PageSettingsForm
          pageKey={key}
          canBeDraft={def.canBeDraft}
          status={page?.status ?? "published"}
          seoTitle={page?.seoTitle ?? def.seoTitle}
          seoDescription={page?.seoDescription ?? def.seoDescription}
          ogImageUrl={page?.ogImageUrl ?? ""}
        />
      </div>
    </>
  );
}
