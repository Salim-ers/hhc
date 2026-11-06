"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import {
  BadgePercent,
  ExternalLink,
  FileText,
  History,
  Image as ImageIcon,
  Images,
  Inbox,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  MapPin,
  Menu,
  MessageSquareQuote,
  CircleHelp,
  Scissors,
  Settings,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Monogram } from "@/components/brand/monogram";
import { logout } from "@/app/admin/_actions/auth";
import { cn } from "@/lib/utils";

/** Indicateur sur le lien cliqué tant que la page n'est pas arrivée ; n'apparaît que si elle tarde (voir .nav-pending). */
function NavPending({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  return pending ? <LoaderCircle aria-hidden className={cn("nav-pending h-4 w-4 animate-spin text-or-profond", className)} /> : null;
}

type NavLink = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; ownerOnly?: boolean };

export function AdminShell({
  user,
  newRequests,
  children,
}: {
  user: { name: string; role: "owner" | "editor"; email: string };
  newRequests: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const groups: { title: string; links: NavLink[] }[] = [
    {
      title: "Au quotidien",
      links: [
        { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
        { href: "/admin/demandes", label: "Demandes", icon: Inbox, badge: newRequests },
        { href: "/admin/prestations", label: "Prestations & prix", icon: Scissors },
        { href: "/admin/offres", label: "Offres & forfaits", icon: BadgePercent },
      ],
    },
    {
      title: "Le site",
      links: [
        { href: "/admin/contenus", label: "Textes & pages", icon: FileText },
        { href: "/admin/galerie", label: "Galerie", icon: Images },
        { href: "/admin/medias", label: "Médiathèque", icon: ImageIcon },
        { href: "/admin/zones", label: "Communes desservies", icon: MapPin },
        { href: "/admin/faq", label: "Questions fréquentes", icon: CircleHelp },
        { href: "/admin/avis", label: "Avis clients", icon: MessageSquareQuote },
      ],
    },
    {
      title: "Réglages",
      links: [
        { href: "/admin/parametres", label: "Paramètres", icon: Settings },
        { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users, ownerOnly: true },
        { href: "/admin/historique", label: "Historique", icon: History },
        { href: "/admin/compte", label: "Mon compte", icon: UserRound },
      ],
    },
  ];

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Administration" className="space-y-7">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="px-3 text-xs font-medium text-taupe">{g.title}</p>
          <ul className="mt-2 space-y-0.5">
            {g.links
              .filter((l) => !l.ownerOnly || user.role === "owner")
              .map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    prefetch
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-lg px-3 text-[0.95rem] transition-colors",
                      isActive(l.href) ? "bg-noir text-ivoire" : "text-encre hover:bg-encre/5",
                    )}
                  >
                    <l.icon className={cn("h-[1.1rem] w-[1.1rem]", isActive(l.href) ? "text-champagne" : "text-taupe")} />
                    <span className="flex-1">{l.label}</span>
                    <NavPending />
                    {!!l.badge && <span className="rounded-full bg-champagne px-2 py-0.5 text-xs font-semibold text-noir">{l.badge}</span>}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="space-y-1 border-t border-encre/10 pt-4">
      <a href="/" target="_blank" rel="noopener" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-[0.95rem] hover:bg-encre/5">
        <ExternalLink className="h-[1.1rem] w-[1.1rem] text-taupe" /> Voir le site
      </a>
      <form action={logout}>
        <button className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-[0.95rem] hover:bg-encre/5">
          <LogOut className="h-[1.1rem] w-[1.1rem] text-taupe" /> Se déconnecter
        </button>
      </form>
      <p className="px-3 pt-2 text-xs text-taupe">
        {user.name} · {user.role === "owner" ? "Propriétaire" : "Éditrice"}
      </p>
    </div>
  );

  const quick: NavLink[] = [
    { href: "/admin", label: "Accueil", icon: LayoutDashboard },
    { href: "/admin/demandes", label: "Demandes", icon: Inbox, badge: newRequests },
    { href: "/admin/prestations", label: "Prix", icon: Scissors },
    { href: "/admin/contenus", label: "Textes", icon: FileText },
  ];

  return (
    <div className="min-h-[100svh] bg-ivoire font-sans text-encre">
      <Toaster position="top-center" richColors closeButton toastOptions={{ style: { fontFamily: "var(--font-jost)" } }} />
      {/* Barre latérale (ordinateur) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-encre/10 bg-lin px-4 py-6 lg:flex">
        <Link href="/admin" className="mb-8 flex items-center gap-3 px-3">
          <Monogram className="h-8 w-auto text-or-logo" title="" aria-hidden />
          <span className="font-display text-lg leading-tight">
            Hair Home Concept
            <span className="block font-sans text-xs text-taupe">Administration</span>
          </span>
        </Link>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        {footer}
      </aside>

      {/* En-tête mobile */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-encre/10 bg-lin/95 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Monogram className="h-6 w-auto text-or-logo" title="" aria-hidden />
          <span className="font-display">Administration</span>
        </Link>
        <button type="button" onClick={() => setOpen(true)} className="flex h-11 w-11 items-center justify-center" aria-label="Ouvrir le menu">
          <Menu className="h-5 w-5" />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-noir/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col bg-lin px-4 py-5 shadow-2xl">
            <div className="mb-4 flex justify-end">
              <button type="button" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center" aria-label="Fermer le menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{nav}</div>
            {footer}
          </div>
        </div>
      )}

      <main className="px-4 pb-28 pt-6 md:px-8 lg:ml-72 lg:pb-16 lg:pt-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* Raccourcis mobiles */}
      <nav aria-label="Raccourcis" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-encre/10 bg-lin/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {quick.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            prefetch
            className={cn("relative flex min-h-16 flex-col items-center justify-center gap-1 text-[0.72rem]", isActive(q.href) ? "text-encre" : "text-taupe")}
          >
            <q.icon className={cn("h-5 w-5", isActive(q.href) && "text-or-profond")} />
            {q.label}
            <NavPending className="absolute left-[calc(50%+0.6rem)] top-2.5 h-3.5 w-3.5" />
            {!!q.badge && <span className="absolute right-[28%] top-2 h-2 w-2 rounded-full bg-champagne" />}
          </Link>
        ))}
      </nav>
    </div>
  );
}
