import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Monogram, Wordmark } from "@/components/brand/monogram";
import { getSessionUser } from "@/lib/auth/session";
import { hasDatabase } from "@/lib/db";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/admin");
  return (
    <main className="grid min-h-[100svh] bg-noir lg:grid-cols-2">
      <div className="on-dark grain relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <Monogram title="" aria-hidden className="absolute -bottom-20 -left-16 w-[80%] text-champagne/[0.07]" />
        <Monogram className="relative h-12 w-auto text-or-logo" />
        <div className="relative">
          <p className="font-display text-5xl leading-tight text-ivoire">Votre site,<br />entre vos mains.</p>
          <p className="muted mt-5 max-w-sm">Modifiez vos tarifs, vos photos et vos textes, et suivez vos demandes de rendez-vous.</p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-lin px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <Monogram className="h-9 w-auto text-or-logo" title="" aria-hidden />
            <Wordmark className="h-4 w-auto text-espresso" />
          </div>
          <h1 className="font-display text-4xl">Connexion</h1>
          <p className="mt-2 text-taupe">Espace d&apos;administration Hair Home Concept.</p>
          {!hasDatabase && (
            <p className="mt-6 rounded-lg bg-champagne/20 p-4 text-sm text-[#6b5218]">
              Mode démonstration : la base de données Neon n&apos;est pas encore reliée. Suivez le README (étape « Base de données ») pour activer l&apos;administration.
            </p>
          )}
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
