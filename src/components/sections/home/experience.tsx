"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { ImageReveal, Parallax, Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { Img } from "@/components/ui/img";

/** La coiffure à domicile : titre et photo figés à gauche, avantages qui défilent à droite le long d'un fil doré. */
export function ExperienceSection(p: {
  title: string;
  body: string;
  image: { url: string; alt: string } | null;
  items: { title: string; text: string }[];
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section className="bg-lin py-20 md:py-28 lg:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionHeading title={p.title} body={p.body} />
            {p.image && (
              <ImageReveal className="mt-10 aspect-[16/11] w-full rounded-[1.75rem] lg:aspect-[5/4]">
                <Parallax className="absolute inset-0" strength={36}>
                  <Img src={p.image.url} alt={p.image.alt} fill sizes="(min-width:1024px) 38vw, 92vw" className="object-cover" />
                </Parallax>
              </ImageReveal>
            )}
          </div>
        </div>

        <div className="relative lg:col-span-6 lg:col-start-7 lg:pt-4">
          {/* Fil doré qui se remplit au défilement */}
          <div aria-hidden className="absolute bottom-6 left-[1.4rem] top-6 hidden w-px bg-encre/10 sm:block">
            <motion.div className="h-full w-full origin-top bg-or-profond" style={{ scaleY: reduce ? 1 : fill }} />
          </div>
          <ul ref={listRef} className="space-y-4 md:space-y-5">
            {p.items.map((it, i) => (
              <Reveal as="li" key={it.title} delay={0.05 * i} y={40} className="relative sm:pl-14">
                <span aria-hidden className="absolute left-[1.15rem] top-9 hidden h-[0.6rem] w-[0.6rem] rounded-full bg-or-profond ring-[6px] ring-lin sm:block" />
                <div className="rounded-[1.75rem] bg-ivoire p-7 transition-[transform,box-shadow] duration-700 ease-[var(--ease-luxe)] hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_rgba(56,43,39,0.5)] md:p-9">
                  <h3 className="t-h3">{it.title}</h3>
                  <p className="muted mt-3">{it.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
