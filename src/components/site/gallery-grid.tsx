"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Img } from "@/components/ui/img";
import type { PublicGalleryItem } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const ASPECT: Record<string, string> = { portrait: "aspect-[4/5]", tall: "aspect-[3/4.4]", square: "aspect-square", landscape: "aspect-[4/3]" };

/** Galerie : grille éditoriale à hauteurs variables, filtres, visionneuse plein écran (clavier + glisser). */
export function GalleryGrid({ items, categories }: { items: PublicGalleryItem[]; categories: { value: string; label: string }[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const lastFocus = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const shown = useMemo(() => (filter === "all" ? items : items.filter((i) => i.category === filter)), [items, filter]);
  const usedCats = categories.filter((c) => items.some((i) => i.category === c.value));

  const close = useCallback(() => {
    setOpen(null);
    lastFocus.current?.focus();
  }, []);
  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + shown.length) % shown.length)), [shown.length]);

  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  const current = open !== null ? shown[open] : null;

  return (
    <>
      <div role="group" aria-label="Filtrer la galerie" className="scrollbar-none -mx-[var(--gutter)] flex gap-1 overflow-x-auto px-[var(--gutter)] pb-2">
        {[{ value: "all", label: "Tout voir" }, ...usedCats].map((c) => (
          <button
            key={c.value}
            type="button"
            aria-pressed={filter === c.value}
            onClick={() => setFilter(c.value)}
            className={cn(
              "shrink-0 border px-4 py-2 text-[0.92rem] transition-colors duration-300",
              filter === c.value ? "border-champagne bg-champagne text-noir" : "border-ivoire/20 text-ivoire/75 hover:border-ivoire/50 hover:text-ivoire",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <motion.ul layout className="mt-10 columns-2 gap-3 md:gap-4 lg:columns-3 2xl:columns-4">
        <AnimatePresence mode="popLayout">
          {shown.map((g, i) => (
            <motion.li
              layout={!reduce}
              key={g.id}
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-3 break-inside-avoid md:mb-4"
            >
              <button
                type="button"
                onClick={(e) => {
                  lastFocus.current = e.currentTarget;
                  setOpen(i);
                }}
                className={cn("group relative block w-full overflow-hidden", ASPECT[g.layout] ?? ASPECT.portrait)}
                aria-label={`Agrandir : ${g.alt}`}
              >
                <Img
                  src={g.imageUrl}
                  alt={g.alt}
                  fill
                  sizes="(min-width:1536px) 24vw, (min-width:1024px) 32vw, 50vw"
                  className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.05]"
                />
                <span className="absolute inset-0 bg-noir/0 transition-colors duration-500 group-hover:bg-noir/20" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <AnimatePresence>
        {current && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Visionneuse"
            className="fixed inset-0 z-[80] flex items-center justify-center bg-noir/96 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={close}
          >
            <button ref={closeRef} type="button" onClick={close} className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center text-ivoire" aria-label="Fermer">
              <X className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className="absolute left-2 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 items-center justify-center text-ivoire/80 hover:text-ivoire md:flex"
              aria-label="Photo précédente"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              className="absolute right-2 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 items-center justify-center text-ivoire/80 hover:text-ivoire md:flex"
              aria-label="Photo suivante"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={current.id}
                className="relative h-[78svh] w-[92vw] max-w-5xl"
                initial={reduce ? false : { opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -30 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -70) step(1);
                  if (info.offset.x > 70) step(-1);
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Img src={current.imageUrl} alt={current.alt} fill sizes="92vw" className="pointer-events-none object-contain" quality={85} />
                <figcaption className="absolute -bottom-10 left-0 right-0 text-center text-sm text-ivoire/65">
                  {current.caption || current.alt} · {open! + 1} / {shown.length}
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
