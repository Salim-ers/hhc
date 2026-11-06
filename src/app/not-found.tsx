import Link from "next/link";
import { Monogram } from "@/components/brand/monogram";

export default function NotFound() {
  return (
    <main className="on-dark grain relative flex min-h-[100svh] flex-col items-center justify-center bg-noir px-6 text-center">
      <Monogram className="w-28 text-or-logo" />
      <h1 className="t-h1 mt-10">Cette page n&apos;existe pas.</h1>
      <p className="muted mt-5 max-w-md">Elle a peut-être été déplacée lors de la refonte du site.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/" className="border border-champagne/60 px-6 py-3 text-ivoire hover:bg-champagne hover:text-noir">
          Retour à l&apos;accueil
        </Link>
        <Link href="/tarifs" className="border border-ivoire/25 px-6 py-3 text-ivoire hover:border-ivoire">
          Voir les tarifs
        </Link>
      </div>
    </main>
  );
}
