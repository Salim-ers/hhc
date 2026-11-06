"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { TextReveal } from "@/components/motion/reveal";
import { useMediaQuery } from "@/components/motion/use-media-query";
import { Img } from "@/components/ui/img";

type Item = { title: string; text: string; image?: { url: string; alt: string }; href?: string };

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Prestations signatures.
 * Grand écran : la section se fige et les cartes glissent horizontalement au rythme du défilement.
 * Mobile / tablette : carrousel natif à balayer, aimanté sur chaque carte.
 * Mouvement réduit : simple rangée défilante, sans épinglage.
 */
export function SignaturesSection({ title, items }: { title: string; items: Item[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px)");
  const pinned = wide && !reduce && items.length > 2;
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!pinned || !track) return;
    const measure = () => setDistance(Math.max(0, track.scrollWidth - (track.parentElement?.clientWidth ?? window.innerWidth)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [pinned, items.length]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const { scrollXProgress } = useScroll({ container: trackRef });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const progress = pinned ? scrollYProgress : scrollXProgress;

  /** Clavier : une carte qui reçoit le focus est ramenée à l'écran. */
  const reveal = (i: number) => {
    if (!pinned || !sectionRef.current || items.length < 2) return;
    const top = sectionRef.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (i / (items.length - 1)) * distance, behavior: "auto" });
  };

  return (
    <section
      ref={sectionRef}
      aria-label={title}
      className="panel on-dark grain relative overflow-clip bg-noir"
      style={pinned && distance ? { height: `calc(100svh + ${distance}px)` } : undefined}
    >
      <div className={pinned ? "sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden py-16" : "py-20 md:py-28"}>
        <div className="container-x flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <TextReveal text={title} className="t-h2 max-w-3xl" />
          <div aria-hidden className="h-[3px] w-full shrink-0 overflow-hidden rounded-full bg-ivoire/10 md:mb-4 md:w-48">
            <motion.div className="h-full origin-left rounded-full bg-champagne" style={{ scaleX: progress }} />
          </div>
        </div>

        <div className="relative mt-10 lg:mt-14">
          <motion.ul
            ref={trackRef}
            style={pinned ? { x } : undefined}
            className={
              pinned
                ? "flex w-max gap-5 px-[var(--gutter)]"
                : "scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-[var(--gutter)] px-[var(--gutter)] pb-2"
            }
          >
            {items.map((it, i) => (
              <motion.li
                key={it.title}
                data-reveal
                className="w-[78vw] shrink-0 snap-start sm:w-[44vw] lg:w-[min(30rem,32vw,40svh)]"
                initial={reduce ? false : { opacity: 0, y: 60, rotate: 2.5 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, margin: "0px -5% -10% 0px" }}
                transition={{ duration: 1.1, ease: EASE, delay: i * 0.08 }}
              >
                <Link href={it.href || "/prestations"} onFocus={() => reveal(i)} className="group block rounded-[1.75rem] focus-visible:outline-offset-4">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-cacao">
                    {it.image?.url && (
                      <Img
                        src={it.image.url}
                        alt={it.image.alt}
                        fill
                        sizes="(min-width:1024px) 30vw, (min-width:640px) 44vw, 78vw"
                        className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.07]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-noir/0 to-noir/0 opacity-60 transition-opacity duration-700 group-hover:opacity-100" />
                    <span className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-ivoire text-noir transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:rotate-45 group-hover:scale-110">
                      <ArrowUpRight className="h-5 w-5" aria-hidden />
                    </span>
                  </div>
                  <h3 className="t-h3 mt-5 text-ivoire">{it.title}</h3>
                  <p className="muted mt-2 max-w-[26rem] text-[0.97rem]">{it.text}</p>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
