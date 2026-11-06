import Link from "next/link";

/** Bandeau visible uniquement en mode aperçu des brouillons. */
export function PreviewBar({ path }: { path: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[95] flex flex-wrap items-center justify-center gap-3 bg-[#2c5282] px-4 py-2.5 text-sm text-white">
      <span>Aperçu des brouillons — ces modifications ne sont pas encore visibles des visiteurs.</span>
      <a href={`/api/preview?off=1&path=${encodeURIComponent(path)}`} className="underline underline-offset-4">
        Quitter l&apos;aperçu
      </a>
      <Link href="/admin/contenus" className="underline underline-offset-4">
        Retour à l&apos;administration
      </Link>
    </div>
  );
}
