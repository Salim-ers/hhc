"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { LogoInline, Monogram } from "@/components/brand/monogram";
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
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 40);
    setHidden(!open && y > 320 && y > prev + 4);
    if (y < prev - 4) setHidden(false);
  });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:bg-champagne focus:px-4 focus:py-2 focus:text-noir"
      >
        Aller au contenu
      </a>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
      >
        {banner && !solid && (
          <div className="bg-champagne text-noir">
            <div className="container-x flex min-h-9 items-center justify-center gap-3 py-1.5 text-center text-sm">
              <span>{banner.text}</span>
              {banner.href && (
                <Link href={banner.href} className="underline underline-offset-4">
                  {banner.cta ?? "Découvrir"}
                </Link>
              )}
            </div>
          </div>
        )}
        <div
          className={cn(
            "transition-[background-color,backdrop-filter,border-color] duration-700",
            solid || open ? "border-b border-ivoire/10 bg-noir/85 backdrop-blur-xl" : "border-b border-transparent bg-transparent",
          )}
        >
          <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-6">
            <Link href="/" className="relative z-10 shrink-0" aria-label="Hair Home Concept — accueil">
              {customLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={customLogo} alt="Hair Home Concept" className="h-9 w-auto md:h-10" />
              ) : (
                <LogoInline />
              )}
            </Link>

            <nav aria-label="Navigation principale" className="hidden lg:block">
              <ul className="flex items-center gap-1 xl:gap-3">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "relative px-2.5 py-2 text-[0.92rem] text-ivoire/80 transition-colors hover:text-ivoire",
                        "after:absolute after:inset-x-2.5 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-champagne after:transition-transform after:duration-500 hover:after:scale-x-100",
                        isActive(item.href) && "text-ivoire after:scale-x-100",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="hidden min-h-11 items-center border border-champagne/60 px-5 text-[0.92rem] text-ivoire transition-colors duration-500 hover:bg-champagne hover:text-noir md:inline-flex"
              >
                Prendre rendez-vous
              </Link>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="menu-mobile"
                className="relative z-10 flex h-11 w-11 items-center justify-center text-ivoire lg:hidden"
              >
                <span className="sr-only">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
                <span className="relative block h-3 w-7">
                  <span
                    className={cn(
                      "absolute left-0 top-0 h-px w-7 bg-current transition-transform duration-500",
                      open && "translate-y-1.5 rotate-45",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute bottom-0 right-0 h-px bg-current transition-all duration-500",
                      open ? "w-7 -translate-y-1.5 -rotate-45" : "w-4",
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
            className="fixed inset-0 z-40 overflow-y-auto bg-noir text-ivoire lg:hidden"
            initial={{ clipPath: "circle(0% at 92% 2.5rem)" }}
            animate={{ clipPath: "circle(150% at 92% 2.5rem)" }}
            exit={{ clipPath: "circle(0% at 92% 2.5rem)" }}
            transition={{ duration: reduce ? 0 : 0.8, ease: [0.65, 0, 0.35, 1] }}
          >
            <Monogram aria-hidden title="" className="pointer-events-none absolute -right-[18vw] bottom-[8vh] w-[90vw] text-champagne/[0.06]" />
            <div className="container-x relative flex min-h-full flex-col pb-10 pt-[calc(var(--header-h)+2rem)]">
              <nav aria-label="Menu mobile">
                <ul className="space-y-1">
                  {[{ key: "home", label: "Accueil", href: "/" }, ...nav, ...secondary].map((item, i) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.045, duration: 0.7, ease: EASE }}
                    >
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={cn(
                          "block py-1.5 font-display text-[clamp(2rem,9vw,3rem)] font-light leading-tight",
                          isActive(item.href) ? "text-champagne" : "text-ivoire",
                        )}
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto space-y-2 pt-10 text-ivoire/70">
                <a href={telHref(phoneE164)} className="block text-xl text-ivoire">
                  {phone}
                </a>
                <a href={`mailto:${email}`} className="block">
                  {email}
                </a>
                <p className="text-sm">{hours}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
