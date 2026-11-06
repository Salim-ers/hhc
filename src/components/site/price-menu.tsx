"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Img } from "@/components/ui/img";
import type { PublicCategory, PublicService } from "@/lib/data/types";
import { cn, formatPrice } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * La carte des prestations et de leurs tarifs. Tout le contenu est rendu côté serveur
 * (indexable, lisible sans JavaScript) ; une fois l'interface chargée, les onglets
 * n'affichent qu'une catégorie à la fois. L'onglet suit l'ancre de l'URL (/prestations#coloration).
 */
export function PriceMenu({ categories }: { categories: PublicCategory[] }) {
  const [active, setActive] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const slugs = useMemo(() => categories.map((c) => c.slug), [categories]);

  useEffect(() => {
    const read = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      setActive(slugs.includes(h) ? h : slugs[0]);
    };
    read();
    // Arrivée via une ancre (/prestations#homme) : on cale la vue sur la barre d'onglets.
    if (slugs.includes(decodeURIComponent(window.location.hash.slice(1)))) {
      requestAnimationFrame(() => {
        const top = (rootRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 96;
        window.scrollTo({ top, behavior: "auto" });
      });
    }
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [slugs]);

  useEffect(() => {
    if (!active) return;
    const el = tabsRef.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [active, reduce]);

  const select = (slug: string) => {
    setActive(slug);
    history.replaceState(null, "", `#${slug}`);
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + slugs.length) % slugs.length;
    select(slugs[next]);
    tabsRef.current?.querySelector<HTMLElement>(`[data-tab="${slugs[next]}"]`)?.focus();
  };

  const enhanced = active !== null;

  return (
    <div ref={rootRef}>
      <div className="sticky top-[calc(var(--header-h)+0.25rem)] z-30 -mx-2 sm:mx-0">
        <div
          ref={tabsRef}
          role="tablist"
          aria-label="Catégories de prestations"
          className="scrollbar-none flex gap-1 overflow-x-auto rounded-full bg-ivoire/90 p-1.5 shadow-[0_20px_40px_-30px_rgba(56,43,39,0.6)] ring-1 ring-encre/[0.06] backdrop-blur-lg sm:w-fit"
        >
          {categories.map((c, i) => {
            const on = active === c.slug;
            return (
              <a
                key={c.slug}
                href={`#${c.slug}`}
                role="tab"
                data-tab={c.slug}
                id={`tab-${c.slug}`}
                aria-selected={on}
                aria-controls={`panel-${c.slug}`}
                tabIndex={enhanced ? (on ? 0 : -1) : 0}
                onClick={(e) => {
                  e.preventDefault();
                  select(c.slug);
                }}
                onKeyDown={(e) => onKey(e, i)}
                className={cn(
                  "relative isolate shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-[0.95rem] transition-colors duration-300",
                  on ? "text-ivoire" : "text-taupe hover:text-encre",
                )}
              >
                {on && (
                  <motion.span
                    layoutId="price-tab"
                    className="absolute inset-0 -z-10 rounded-full bg-espresso"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {c.label}
              </a>
            );
          })}
        </div>
      </div>

      <div className="pt-12 md:pt-16">
        <AnimatePresence mode="wait" initial={false}>
          {categories.map((c) =>
            !enhanced || active === c.slug ? (
              <motion.section
                key={c.slug}
                id={enhanced ? `panel-${c.slug}` : c.slug}
                role={enhanced ? "tabpanel" : undefined}
                aria-labelledby={enhanced ? `tab-${c.slug}` : undefined}
                initial={reduce || !enhanced ? false : { opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduce ? undefined : { opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.5, ease: EASE }}
                className={cn(!enhanced && "mb-24 scroll-mt-32")}
              >
                <CategoryPanel category={c} animate={enhanced && !reduce} />
              </motion.section>
            ) : null,
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CategoryPanel({ category: c, animate }: { category: PublicCategory; animate: boolean }) {
  const visual = c.services.find((s) => s.imageUrl);
  const groups = useMemo(() => {
    const map = new Map<string, PublicService[]>();
    for (const s of c.services) {
      const k = s.section ?? "";
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return [...map.entries()];
  }, [c.services]);
  let row = 0;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
      <aside className="lg:col-span-4">
        <div className="lg:sticky lg:top-44">
          <h2 className="t-h2">{c.label}</h2>
          {c.intro && <p className="muted mt-5 max-w-sm">{c.intro}</p>}
          {visual?.imageUrl && (
            <div className="arch relative mt-10 hidden aspect-[3/4] w-full max-w-[19rem] overflow-hidden lg:block">
              <motion.div
                className="absolute inset-0"
                initial={animate ? { scale: 1.15 } : false}
                animate={{ scale: 1 }}
                transition={{ duration: 1.4, ease: EASE }}
              >
                <Img src={visual.imageUrl} alt={visual.imageAlt ?? ""} fill sizes="22vw" className="object-cover" />
              </motion.div>
            </div>
          )}
          {c.footnote && <p className="muted mt-6 text-sm">{c.footnote}</p>}
        </div>
      </aside>

      <div className="space-y-12 lg:col-span-8">
        {groups.map(([section, items]) => (
          <div key={section || "default"}>
            {section && <h3 className="mb-3 inline-flex rounded-full bg-sable px-4 py-1.5 font-display text-lg text-or-profond">{section}</h3>}
            <ul>
              {items.map((s) => (
                <ServiceRow key={s.id} s={s} category={c.label} delay={animate ? Math.min(row++ * 0.035, 0.45) : null} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceRow({ s, category, delay }: { s: PublicService; category: string; delay: number | null }) {
  const price = s.priceCents == null ? "Sur devis" : `${s.priceFrom ? "à partir de " : ""}${formatPrice(s.priceCents)}`;
  return (
    <motion.li
      className="group border-b border-encre/10 py-5"
      initial={delay == null ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: delay ?? 0 }}
    >
      <div className="flex items-baseline gap-3">
        <h4 className="font-display text-[clamp(1.15rem,1.05rem+0.4vw,1.4rem)] leading-snug">{s.name}</h4>
        <span aria-hidden className="leader" />
        <p className="tabular shrink-0 font-display text-[clamp(1.25rem,1.1rem+0.5vw,1.6rem)]">
          {s.compareAtCents != null && <s className="mr-2 align-middle text-base text-taupe">{formatPrice(s.compareAtCents)}</s>}
          {price}
        </p>
      </div>
      {(s.description || s.variants.length > 0) && (
        <div className="mt-1.5 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          {s.description ? <p className="muted max-w-xl text-[0.95rem]">{s.description}</p> : <span />}
          {s.variants.map((v) => (
            <p key={v.label} className="tabular shrink-0 text-[0.95rem] text-taupe sm:text-right">
              {v.label} · <span className="text-encre">{formatPrice(v.priceCents)}</span>
            </p>
          ))}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.8rem]">
        {s.promoLabel && <span className="rounded-full bg-espresso px-3 py-1 text-ivoire">{s.promoLabel}</span>}
        {s.badge && <span className="rounded-full border border-or-profond/35 px-3 py-1 text-or-profond">{s.badge}</span>}
        {s.supplementCents != null && (
          <span className="tabular px-1 text-taupe">
            + {formatPrice(s.supplementCents)} {s.supplementLabel?.toLowerCase()}
          </span>
        )}
        {s.durationMinutes && <span className="px-1 text-taupe">≈ {s.durationMinutes} min</span>}
        {s.conditions && <span className="px-1 text-taupe">{s.conditions}</span>}
        <Link
          href={`/contact?prestation=${encodeURIComponent(`${category} : ${s.name}`)}`}
          className="ml-auto inline-flex min-h-9 items-center rounded-full border border-encre/15 px-4 text-encre/75 transition-[opacity,background-color,color] duration-300 hover:border-espresso hover:bg-espresso hover:text-ivoire md:opacity-0 md:focus-visible:opacity-100 md:group-hover:opacity-100"
        >
          Demander ce rendez-vous<span className="sr-only"> : {s.name}</span>
        </Link>
      </div>
    </motion.li>
  );
}
