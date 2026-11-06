"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Phone } from "lucide-react";
import { useIntroReady } from "@/components/layout/intro-loader";
import { TextReveal } from "@/components/motion/reveal";
import { LinkButton } from "@/components/ui/button";
import { Img } from "@/components/ui/img";
import { telHref } from "@/lib/utils";

type Props = {
  title: string;
  subtitle: string;
  image: { url: string; alt: string } | null;
  ctaPrimary: { label: string; href: string } | null;
  ctaSecondary: { label: string; href: string } | null;
  phone: string;
  phoneE164: string;
  hours: string;
  travel: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;
const SILK = [0.65, 0, 0.35, 1] as const;

/**
 * Hero « couverture » : une grande photographie panoramique, puis le titre et l'essentiel
 * (rendez-vous, téléphone, horaires, déplacement), comme l'ouverture d'un article de magazine.
 * La photo s'ouvre depuis une petite capsule, puis glisse lentement au défilement.
 */
export function Hero({ title, subtitle, image, ctaPrimary, ctaSecondary, phone, phoneE164, hours, travel }: Props) {
  const ready = useIntroReady();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const go = ready ? "show" : "hide";

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "14%"]);

  // L'état initial est le même au serveur et au navigateur ; en mouvement réduit, la durée est nulle.
  const rise = (delay: number) => ({
    "data-reveal": "",
    initial: { opacity: 0, y: 16 },
    animate: go,
    variants: { hide: {}, show: { opacity: 1, y: 0 } },
    transition: reduce ? { duration: 0 } : { duration: 0.9, ease: EASE, delay },
  });

  return (
    <section ref={ref} aria-label="Présentation" className="relative bg-lin pt-[calc(var(--header-h)+0.5rem)] md:pt-[calc(var(--header-h)+0.75rem)]">
      <div className="container-x">
        {/* La photographie : s'ouvre depuis une capsule au centre */}
        <motion.div
          data-reveal
          className="relative h-[40svh] min-h-[16rem] overflow-hidden rounded-[1.75rem] bg-sable md:h-[48svh] md:rounded-[2.5rem] lg:h-[46svh]"
          initial={{ clipPath: "inset(40% 44% 40% 44% round 999px)" }}
          animate={go}
          variants={{ hide: {}, show: { clipPath: "inset(0% 0% 0% 0% round 40px)" } }}
          transition={reduce ? { duration: 0 } : { duration: 1.6, ease: SILK, delay: 0.1 }}
        >
          <motion.div className="absolute -inset-y-[8%] inset-x-0" style={{ y: imgY }}>
            <motion.div
              data-reveal
              className="absolute inset-0"
              initial={{ scale: 1.25 }}
              animate={go}
              variants={{ hide: {}, show: { scale: 1 } }}
              transition={reduce ? { duration: 0 } : { duration: 2.4, ease: EASE, delay: 0.1 }}
            >
              {image && (
                <Img
                  src={image.url}
                  alt={image.alt}
                  fill
                  priority
                  sizes="(min-width: 1600px) 1600px, 100vw"
                  quality={80}
                  className="object-cover object-[25%_42%]"
                />
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Le titre et l'essentiel */}
        <div className="grid gap-6 pb-9 pt-7 md:pt-10 lg:grid-cols-12 lg:items-end lg:gap-10 lg:pb-10">
          <TextReveal text={title} as="h1" play={ready} delay={0.55} stagger={0.08} className="t-display text-[clamp(3rem,0.9rem+6.6vw,9rem)] text-encre lg:col-span-7" />
          <div className="lg:col-span-5 lg:pb-[0.4em]">
            <motion.p className="t-lead muted max-w-[34rem]" {...rise(0.85)}>
              {subtitle}
            </motion.p>
            <motion.div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4" {...rise(1)}>
              {ctaPrimary && (
                <LinkButton href={ctaPrimary.href} variant="solid" size="lg">
                  {ctaPrimary.label}
                </LinkButton>
              )}
              <a href={telHref(phoneE164)} className="group inline-flex items-center gap-2.5 text-[1.02rem] text-encre">
                <Phone className="h-4 w-4 text-or-profond" aria-hidden />
                <span className="link-underline">{phone}</span>
              </a>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="flex flex-col gap-2 border-t border-encre/10 py-5 text-[0.92rem] text-taupe sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-10"
          {...rise(1.15)}
        >
          <p>{hours}</p>
          <p>{travel}</p>
          {ctaSecondary && (
            <Link href={ctaSecondary.href} className="link-underline text-encre sm:ml-auto">
              {ctaSecondary.label}
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}
