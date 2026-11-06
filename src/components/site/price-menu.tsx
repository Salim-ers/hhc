"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Img } from "@/components/ui/img";
import type { PublicCategory, PublicOffer, PublicService } from "@/lib/data/types";
import { cn, formatPrice } from "@/lib/utils";

type Props = { categories: PublicCategory[]; forfaits: PublicOffer[] };

/**
 * La carte des tarifs. Tout le contenu est rendu côté serveur (indexable, lisible sans JavaScript) ;
 * une fois l'interface chargée, les onglets n'affichent qu'une catégorie à la fois.
 * L'onglet est synchronisé avec l'ancre de l'URL (/tarifs#coloration).
 */
export function PriceMenu({ categories, forfaits }: Props) {
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
    // Arrivée via une ancre (/tarifs#homme) : on cale la vue sur la barre d'onglets.
    if (slugs.includes(decodeURIComponent(window.location.hash.slice(1)))) {
      requestAnimationFrame(() => {
        const top = (rootRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 80;
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
      <div className="sticky top-0 z-30 -mx-[var(--gutter)] border-b border-encre/10 bg-lin/92 px-[var(--gutter)] backdrop-blur-lg">
        <div ref={tabsRef} role="tablist" aria-label="Catégories de tarifs" className="scrollbar-none flex gap-1 overflow-x-auto py-3">
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
                  "relative shrink-0 whitespace-nowrap px-4 py-2.5 text-[0.95rem] transition-colors duration-300",
                  on ? "text-noir" : "text-taupe hover:text-encre",
                )}
              >
                {on && (
                  <motion.span
                    layoutId="price-tab"
                    className="absolute inset-0 -z-10 bg-champagne/90"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}
                {c.label}
              </a>
            );
          })}
        </div>
      </div>

      <div className="pt-14 md:pt-20">
        <AnimatePresence mode="wait" initial={false}>
          {categories.map((c) =>
            !enhanced || active === c.slug ? (
              <motion.section
                key={c.slug}
                id={enhanced ? `panel-${c.slug}` : c.slug}
                role={enhanced ? "tabpanel" : undefined}
                aria-labelledby={enhanced ? `tab-${c.slug}` : undefined}
                initial={reduce || !enhanced ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cn(!enhanced && "mb-24 scroll-mt-28")}
              >
                <CategoryPanel category={c} forfaits={forfaits} />
              </motion.section>
            ) : null,
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CategoryPanel({ category: c, forfaits }: { category: PublicCategory; forfaits: PublicOffer[] }) {
  const visual = c.services.find((s) => s.imageUrl);
  const groups = useMemo(() => {
    const map = new Map<string, PublicService[]>();
    for (const s of c.services) {
      const k = s.section ?? "";
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return [...map.entries()];
  }, [c.services]);
  const isForfaits = c.slug === "forfaits";

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <aside className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <h2 className="t-h2">{c.label}</h2>
          {c.intro && <p className="muted mt-5 max-w-sm">{c.intro}</p>}
          {visual?.imageUrl && (
            <div className="arc-tl relative mt-10 hidden aspect-[4/5] w-full max-w-xs overflow-hidden lg:block">
              <Img src={visual.imageUrl} alt={visual.imageAlt ?? ""} fill sizes="22vw" className="object-cover" />
            </div>
          )}
          {c.footnote && <p className="muted mt-6 text-sm">{c.footnote}</p>}
        </div>
      </aside>

      <div className="lg:col-span-8">
        {isForfaits ? (
          <ul className="divide-y divide-encre/10 border-y border-encre/10">
            {forfaits.map((o) => (
              <li key={o.id} className="grid gap-3 py-8 sm:grid-cols-[1fr_auto] sm:items-start">
                <div>
                  <h3 className="font-display text-2xl">{o.title}</h3>
                  {o.subtitle && <p className="muted mt-1 font-display italic">{o.subtitle}</p>}
                  {o.items.length > 0 && <p className="muted mt-3 text-[0.95rem]">{o.items.join(" · ")}</p>}
                  {o.conditions && <p className="mt-2 text-sm text-taupe">{o.conditions}</p>}
                </div>
                <div className="sm:text-right">
                  <p className="tabular font-display text-3xl">
                    {o.priceCents != null && !o.priceLabel ? formatPrice(o.priceCents) : o.priceLabel}
                  </p>
                  {o.compareAtCents != null && (
                    <p className="muted text-sm">
                      au lieu de <s>{formatPrice(o.compareAtCents)}</s>
                    </p>
                  )}
                  <Link href={`/contact?prestation=${encodeURIComponent(o.title)}`} className="mt-3 inline-block text-sm text-or-profond underline-offset-4 hover:underline">
                    Demander
                  </Link>
                </div>
              </li>
            ))}
            <li className="py-6">
              <Link href="/forfaits-offres" className="link-underline font-display text-xl italic text-or-profond">
                Toutes les offres, le parrainage et les bons cadeaux
              </Link>
            </li>
          </ul>
        ) : (
          <div className="space-y-14">
            {groups.map(([section, items]) => (
              <div key={section || "default"}>
                {section && <h3 className="mb-2 font-display text-xl italic text-or-profond">{section}</h3>}
                <ul>
                  {items.map((s) => (
                    <ServiceRow key={s.id} s={s} category={c.label} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceRow({ s, category }: { s: PublicService; category: string }) {
  const price = s.priceCents == null ? "Sur devis" : `${s.priceFrom ? "à partir de " : ""}${formatPrice(s.priceCents)}`;
  return (
    <li className="group border-b border-encre/10 py-5">
      <div className="flex items-baseline gap-3">
        <h4 className="font-display text-[clamp(1.15rem,1.05rem+0.4vw,1.4rem)] leading-snug">{s.name}</h4>
        <span aria-hidden className="leader" />
        <p className="tabular shrink-0 font-display text-[clamp(1.25rem,1.1rem+0.5vw,1.6rem)]">
          {s.compareAtCents != null && (
            <s className="mr-2 align-middle text-base text-taupe">{formatPrice(s.compareAtCents)}</s>
          )}
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
        {s.promoLabel && <span className="bg-espresso px-2.5 py-1 text-ivoire">{s.promoLabel}</span>}
        {s.badge && <span className="border border-or-profond/40 px-2.5 py-1 text-or-profond">{s.badge}</span>}
        {s.supplementCents != null && (
          <span className="tabular px-1 text-taupe">
            + {formatPrice(s.supplementCents)} {s.supplementLabel?.toLowerCase()}
          </span>
        )}
        {s.durationMinutes && <span className="px-1 text-taupe">≈ {s.durationMinutes} min</span>}
        {s.conditions && <span className="px-1 text-taupe">{s.conditions}</span>}
        <Link
          href={`/contact?prestation=${encodeURIComponent(`${category} — ${s.name}`)}`}
          className="ml-auto text-encre/70 opacity-100 transition-opacity hover:text-or-profond md:opacity-0 md:focus-visible:opacity-100 md:group-hover:opacity-100"
        >
          Demander ce rendez-vous<span className="sr-only"> : {s.name}</span>
        </Link>
      </div>
    </li>
  );
}
