import Link from "next/link";
import { Monogram } from "@/components/brand/monogram";

export default function NotFound() {
  return (
    <main className="on-dark grain relative m-2 flex min-h-[calc(100svh-1rem)] flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-noir px-6 text-center md:m-3 md:min-h-[calc(100svh-1.5rem)] md:rounded-[3rem]">
      <Monogram className="w-28 text-or-logo" />
      <h1 className="t-h1 mt-10">Cette page n&apos;existe pas.</h1>
      <p className="muted mt-5 max-w-md">Elle a peut-être été déplacée lors de la refonte du site.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/" className="rounded-full bg-champagne px-6 py-3 text-noir transition-colors hover:bg-champagne-clair">
          Retour à l&apos;accueil
        </Link>
        <Link href="/prestations" className="rounded-full border border-ivoire/25 px-6 py-3 text-ivoire transition-colors hover:border-ivoire">
          Prestations & tarifs
        </Link>
      </div>
    </main>
  );
}
