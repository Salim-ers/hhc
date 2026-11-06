"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Monogram } from "@/components/brand/monogram";
import { useIntroReady } from "@/components/layout/intro-loader";
import { LineReveal } from "@/components/motion/reveal";
import { LinkButton } from "@/components/ui/button";
import { Img } from "@/components/ui/img";

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: { url: string; alt: string } | null;
  ctaPrimary: { label: string; href: string } | null;
  ctaSecondary: { label: string; href: string } | null;
};

const EASE = [0.22, 1, 0.36, 1] as const;
const SILK = [0.65, 0, 0.35, 1] as const;

/**
 * Hero cinématique. L'image s'ouvre par un cercle — le « C » du monogramme —
 * puis respire d'un très lent zoom. Les titres montent ligne par ligne, les filets
 * dorés (les fûts du « H ») se tracent. Tout démarre à la fin du loader.
 */
export function Hero({ eyebrow, title, subtitle, image, ctaPrimary, ctaSecondary }: Props) {
  const ready = useIntroReady();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "18%"]);
  const textY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "-22%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const go = ready ? "show" : "hide";

  return (
    <section ref={ref} className="on-dark grain relative isolate min-h-[100svh] overflow-hidden bg-noir" aria-label="Présentation">
      {/* Image — plein cadre sur mobile, à droite sur grand écran */}
      <motion.div className="absolute inset-0 lg:left-[38%]" style={{ y: imgY }}>
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { clipPath: "circle(0% at 38% 46%)" }}
          animate={go}
          variants={{ hide: {}, show: { clipPath: "circle(140% at 38% 46%)" } }}
          transition={{ duration: 2.1, ease: SILK, delay: 0.1 }}
        >
          <motion.div
            className="absolute inset-0"
            initial={reduce ? false : { scale: 1.22 }}
            animate={go}
            variants={{ hide: {}, show: { scale: 1.04 } }}
            transition={{ duration: 3.6, ease: EASE }}
          >
            {image && (
              <Img
                src={image.url}
                alt={image.alt}
                fill
                priority
                sizes="(min-width: 1024px) 62vw, 100vw"
                quality={80}
                className="object-cover object-[50%_30%]"
              />
            )}
          </motion.div>
          {/* Voiles pour la lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/35 to-noir/10 lg:bg-gradient-to-r lg:from-noir lg:via-noir/20 lg:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-noir to-transparent" />
        </motion.div>
      </motion.div>

      {/* Monogramme décoratif : en filigrane, il chevauche le texte et l'image */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-[6vw] top-[14vh] w-[78vw] max-w-[1100px] text-champagne lg:left-[18%] lg:top-[16vh] lg:w-[54vw]"
        initial={reduce ? false : { opacity: 0, x: -40 }}
        animate={go}
        variants={{ hide: {}, show: { opacity: 0.07, x: 0 } }}
        transition={{ duration: 2.4, ease: EASE, delay: 0.5 }}
      >
        <Monogram title="" className="w-full" />
      </motion.div>

      {/* Filets dorés verticaux, tracés comme les fûts du « H » */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[var(--gutter)] hidden w-px lg:block">
        <motion.span
          className="absolute inset-0 origin-top bg-gradient-to-b from-transparent via-champagne/50 to-transparent"
          initial={reduce ? false : { scaleY: 0 }}
          animate={go}
          variants={{ hide: {}, show: { scaleY: 1 } }}
          transition={{ duration: 1.8, ease: SILK, delay: 0.3 }}
        />
      </div>

      <motion.div
        className="container-x relative z-10 flex min-h-[100svh] flex-col justify-end pb-[max(7rem,14vh)] pt-32 lg:justify-center lg:pb-24"
        style={{ y: textY, opacity: fade }}
      >
        <div className="max-w-[46rem] lg:pl-10">
          <motion.p
            className="eyebrow on-dark"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={go}
            variants={{ hide: {}, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 1, ease: EASE, delay: 0.55 }}
          >
            {eyebrow}
          </motion.p>
          {ready ? (
            <LineReveal text={title} as="h1" immediate delay={0.7} className="t-display mt-6 text-ivoire" italicLast />
          ) : (
            <h1 className="t-display mt-6 text-ivoire opacity-0">{title.replace("\n", " ")}</h1>
          )}
          <motion.p
            className="t-lead muted mt-8 max-w-[34rem]"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={go}
            variants={{ hide: {}, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 1.1, ease: EASE, delay: 1.25 }}
          >
            {subtitle}
          </motion.p>
          <motion.div
            className="mt-10 flex flex-wrap gap-3"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={go}
            variants={{ hide: {}, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 1.1, ease: EASE, delay: 1.45 }}
          >
            {ctaPrimary && (
              <LinkButton href={ctaPrimary.href} variant="gold" size="lg">
                {ctaPrimary.label}
              </LinkButton>
            )}
            {ctaSecondary && (
              <LinkButton href={ctaSecondary.href} variant="light" size="lg">
                {ctaSecondary.label}
              </LinkButton>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Indicateur de défilement */}
      <motion.div
        aria-hidden
        className="absolute bottom-8 right-[var(--gutter)] z-10 hidden items-center gap-4 text-sm text-ivoire/60 md:flex"
        initial={reduce ? false : { opacity: 0 }}
        animate={go}
        variants={{ hide: {}, show: { opacity: 1 } }}
        transition={{ duration: 1, delay: 2 }}
      >
        <span className="font-display italic">Découvrir</span>
        <span className="relative h-14 w-px overflow-hidden bg-ivoire/15">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-champagne"
            animate={reduce ? undefined : { y: ["-100%", "200%"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: SILK }}
          />
        </span>
      </motion.div>
    </section>
  );
}
