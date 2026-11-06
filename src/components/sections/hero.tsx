"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, Clock, MapPin, Phone } from "lucide-react";
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
const STRANDS = 6;

/**
 * Hero : le texte et l'essentiel à gauche (rendez-vous, téléphone, déplacement, horaires),
 * une grande photo à droite (au-dessus sur mobile). La photo se dévoile par bandes verticales
 * qui se lèvent l'une après l'autre, comme des mèches, puis glisse lentement au défilement.
 */
export function Hero({ title, subtitle, image, ctaPrimary, ctaSecondary, phone, phoneE164, hours, travel }: Props) {
  const ready = useIntroReady();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const go = ready ? "show" : "hide";

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "12%"]);

  // L'état initial est le même au serveur et au navigateur ; en mouvement réduit, la durée est nulle.
  const rise = (delay: number) => ({
    "data-reveal": "",
    initial: { opacity: 0, y: 18 },
    animate: go,
    variants: { hide: {}, show: { opacity: 1, y: 0 } },
    transition: reduce ? { duration: 0 } : { duration: 0.9, ease: EASE, delay },
  });

  return (
    <section ref={ref} aria-label="Présentation" className="relative bg-lin pt-[calc(var(--header-h)+0.25rem)] md:pt-[calc(var(--header-h)+0.5rem)]">
      <div className="container-x flex flex-col pb-8 lg:grid lg:h-[min(calc(100svh-var(--header-h)-1.25rem),64rem)] lg:min-h-[36rem] lg:grid-cols-12 lg:gap-12 lg:pb-5 xl:gap-16">
        {/* Le texte */}
        <div className="@container flex flex-col pt-7 md:pt-9 lg:col-span-5 lg:pt-0">
          <div className="flex flex-1 flex-col justify-center lg:pb-8">
            <TextReveal
              text={title}
              as="h1"
              play={ready}
              delay={0.45}
              stagger={0.07}
              className="t-display text-[min(13.6cqw,4.4rem)] text-encre lg:text-[min(13.6cqw,6.4rem)]"
            />
            <motion.p className="t-lead muted mt-5 max-w-[31rem] md:mt-7" {...rise(0.8)}>
              {subtitle}
            </motion.p>
            <motion.div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4 md:mt-9" {...rise(0.95)}>
              {ctaPrimary && (
                <LinkButton href={ctaPrimary.href} variant="solid" size="lg" arrow>
                  {ctaPrimary.label}
                </LinkButton>
              )}
              <a href={telHref(phoneE164)} className="inline-flex items-center gap-2.5 text-[1.02rem] text-encre">
                <Phone className="h-4 w-4 text-or-profond" aria-hidden />
                <span className="link-underline">{phone}</span>
              </a>
            </motion.div>
          </div>

          <motion.div className="mt-10 border-t border-encre/10 pt-5 lg:mt-0" {...rise(1.1)}>
            <ul className="grid gap-2.5 text-[0.93rem] text-taupe">
              <li className="flex items-start gap-3">
                <MapPin className="mt-[0.2em] h-4 w-4 shrink-0 text-or-profond" aria-hidden />
                {travel}
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-[0.2em] h-4 w-4 shrink-0 text-or-profond" aria-hidden />
                {hours}
              </li>
            </ul>
            {ctaSecondary && (
              <Link href={ctaSecondary.href} className="group mt-4 inline-flex items-center gap-2 text-[0.95rem] text-encre">
                <span className="link-underline">{ctaSecondary.label}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:translate-x-1" aria-hidden />
              </Link>
            )}
          </motion.div>
        </div>

        {/* La photo : au-dessus du texte sur mobile, à droite sur grand écran */}
        <div className="relative order-first h-[40svh] min-h-[17rem] overflow-hidden rounded-[1.75rem] bg-sable sm:h-[50svh] md:rounded-[2.5rem] lg:order-none lg:col-span-7 lg:h-full lg:min-h-0">
          <motion.div className="absolute -inset-y-[7%] inset-x-0" style={{ y: imgY }}>
            <motion.div
              data-reveal
              className="absolute inset-0"
              initial={{ scale: 1.16 }}
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
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  quality={80}
                  className="object-cover object-[58%_45%] xl:object-[46%_45%]"
                />
              )}
            </motion.div>
          </motion.div>

          {/* Bandes qui se lèvent pour dévoiler la photo (masquées sans JavaScript) */}
          <div aria-hidden data-cover className="pointer-events-none absolute inset-0 flex">
            {Array.from({ length: STRANDS }, (_, i) => (
              <motion.span
                key={i}
                className="-mr-px h-full flex-1 origin-top bg-lin"
                initial={{ scaleY: 1 }}
                animate={go}
                variants={{ hide: {}, show: { scaleY: 0 } }}
                transition={reduce ? { duration: 0 } : { duration: 1.1, ease: SILK, delay: 0.1 + i * 0.075 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
