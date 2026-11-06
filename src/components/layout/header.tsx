"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { LogoInline } from "@/components/brand/monogram";
import type { NavItem } from "@/lib/content/navigation";
import { cn, telHref } from "@/lib/utils";

type Props = {
  nav: NavItem[];
  secondary: NavItem[];
  phone: string;
  phoneE164: string;
  email: string;
  hours: string;
  banner: { text: string; href: string | null; cta: string | null } | null;
  /** Logo importé depuis l'administration (sinon, le logo officiel vectorisé). */
  customLogo?: string | null;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function Header({ nav, secondary, phone, phoneE164, email, hours, banner, customLogo }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  // Sur l'accueil, le Hero porte déjà le bouton de rendez-vous : celui de l'en-tête attend qu'il soit dépassé.
  const [pastHero, setPastHero] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 40);
    setPastHero(y > window.innerHeight * 0.7);
    setHidden(!open && y > 320 && y > prev + 4);
    if (y < prev - 4) setHidden(false);
  });

  useEffect(() => {
    setOpen(false);
    // Arrivée en milieu de page (rechargement, ancre) : l'état ne doit pas attendre le premier défilement.
    setSolid(window.scrollY > 40);
    setPastHero(window.scrollY > window.innerHeight * 0.7);
  }, [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const showCta = !isHome || pastHero;

  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-champagne focus:px-5 focus:py-2 focus:text-noir"
      >
        Aller au contenu
      </a>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: hidden ? "-120%" : "0%" }}
        transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
      >
        {banner && !solid && (
          <div className="flex justify-center px-3 pt-3">
            <div className="flex min-h-9 items-center gap-3 rounded-full bg-champagne px-5 py-1.5 text-center text-sm text-noir">
              <span>{banner.text}</span>
              {banner.href && (
                <Link href={banner.href} className="font-medium underline underline-offset-4">
                  {banner.cta ?? "En profiter"}
                </Link>
              )}
            </div>
          </div>
        )}
        <div className="container-x pt-2 md:pt-3">
          <div
            className={cn(
              "-mx-3 flex h-16 items-center justify-between gap-6 rounded-full px-3 transition-[background-color,box-shadow,backdrop-filter] duration-700 md:-mx-5 md:px-5",
              solid || open
                ? "bg-noir/80 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.7)] ring-1 ring-ivoire/10 backdrop-blur-xl"
                : "bg-transparent",
            )}
          >
            <Link href="/" className="relative z-10 shrink-0 rounded-full" aria-label="Hair Home Concept, accueil">
              {customLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={customLogo} alt="Hair Home Concept" className="h-9 w-auto md:h-10" />
              ) : (
                <LogoInline />
              )}
            </Link>

            <nav aria-label="Navigation principale" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "relative block rounded-full px-3.5 py-2 text-[0.92rem] transition-colors duration-300 xl:px-4",
                        isActive(item.href) ? "bg-ivoire/10 text-ivoire" : "text-ivoire/75 hover:bg-ivoire/[0.06] hover:text-ivoire",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <AnimatePresence initial={false}>
                {showCta && (
                  <motion.div
                    key="cta"
                    className="hidden md:block"
                    initial={reduce ? false : { opacity: 0, scale: 0.85, x: 12 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={reduce ? undefined : { opacity: 0, scale: 0.85, x: 12 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  >
                    <Link
                      href="/contact"
                      className="inline-flex min-h-11 items-center rounded-full bg-champagne px-5 text-[0.92rem] text-noir transition-colors duration-300 hover:bg-champagne-clair"
                    >
                      Prendre rendez-vous
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="menu-mobile"
                className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full text-ivoire ring-1 ring-ivoire/20 lg:hidden"
              >
                <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
                <span className="relative block h-2.5 w-5">
                  <span className={cn("absolute left-0 top-0 h-px w-5 bg-current transition-transform duration-500", open && "translate-y-[5px] rotate-45")} />
                  <span
                    className={cn(
                      "absolute bottom-0 right-0 h-px bg-current transition-all duration-500",
                      open ? "w-5 -translate-y-[5px] -rotate-45" : "w-3",
                    )}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-2 z-40 overflow-y-auto rounded-[2rem] bg-noir text-ivoire lg:hidden"
            initial={{ clipPath: "circle(0% at 92% 2.5rem)" }}
            animate={{ clipPath: "circle(150% at 92% 2.5rem)" }}
            exit={{ clipPath: "circle(0% at 92% 2.5rem)" }}
            transition={{ duration: reduce ? 0 : 0.8, ease: [0.65, 0, 0.35, 1] }}
          >
            <div className="container-x relative flex min-h-full flex-col pb-8 pt-[calc(var(--header-h)+1.5rem)]">
              <nav aria-label="Menu mobile">
                <ul className="space-y-1">
                  {[{ key: "home", label: "Accueil", href: "/" }, ...nav, ...secondary].map((item, i) => (
                    <motion.li
                      key={item.href}
                      initial={reduce ? false : { opacity: 0, y: 28, rotate: 2 }}
                      animate={{ opacity: 1, y: 0, rotate: 0 }}
                      transition={{ delay: 0.15 + i * 0.045, duration: 0.7, ease: EASE }}
                      className="origin-left"
                    >
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={cn(
                          "block py-1.5 font-display text-[clamp(1.9rem,8.5vw,2.8rem)] leading-tight",
                          isActive(item.href) ? "text-champagne" : "text-ivoire",
                        )}
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <motion.div
                className="mt-auto space-y-4 pt-10"
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7, ease: EASE }}
              >
                <Link href="/contact" className="flex min-h-14 items-center justify-center rounded-full bg-champagne text-noir">
                  Prendre rendez-vous
                </Link>
                <div className="flex flex-col gap-1 text-center text-ivoire/70">
                  <a href={telHref(phoneE164)} className="text-xl text-ivoire">
                    {phone}
                  </a>
                  <a href={`mailto:${email}`}>{email}</a>
                  <p className="text-sm">{hours}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
