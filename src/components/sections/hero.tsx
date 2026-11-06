"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { useIntroReady } from "@/components/layout/intro-loader";
import { Magnetic, TextReveal } from "@/components/motion/reveal";
import { LinkButton } from "@/components/ui/button";
import { Img } from "@/components/ui/img";

type Image = { url: string; alt: string };
type Link = { label: string; href: string };

type Props = {
  title: string;
  subtitle: string;
  image: Image | null;
  imageDetail: Image | null;
  highlights: string[];
  ctaPrimary: Link | null;
  ctaSecondary: Link | null;
};

const EASE = [0.22, 1, 0.36, 1] as const;
const SILK = [0.65, 0, 0.35, 1] as const;

/** Mèches dorées : courbes qui se dessinent puis qu'un reflet parcourt, comme la lumière sur une chevelure. */
const STRANDS = [
  "M560 40 C 420 120, 520 300, 380 420 S 140 560, 60 780",
  "M600 120 C 470 200, 560 360, 430 470 S 210 610, 120 800",
  "M520 0 C 360 90, 470 250, 330 380 S 80 520, 0 700",
];

/**
 * Hero « Le miroir ». La photographie apparaît dans l'arche d'un miroir de coiffeuse,
 * une seconde image la chevauche, des mèches dorées se tracent derrière. Le tout réagit
 * doucement à la souris et au défilement. Tout démarre à la fin de l'écran d'ouverture.
 */
export function Hero({ title, subtitle, image, imageDetail, highlights, ctaPrimary, ctaSecondary }: Props) {
  const ready = useIntroReady();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const go = ready ? "show" : "hide";

  // Défilement : le miroir s'éloigne lentement, la petite photo remonte, le texte s'efface.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const still = reduce ?? false;
  const mirrorY = useTransform(scrollYProgress, [0, 1], still ? [0, 0] : [0, 140]);
  const mirrorScale = useTransform(scrollYProgress, [0, 1], still ? [1, 1] : [1, 0.9]);
  const detailY = useTransform(scrollYProgress, [0, 1], still ? [0, 0] : [0, -180]);
  const textY = useTransform(scrollYProgress, [0, 1], still ? [0, 0] : [0, -90]);
  const textFade = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  // Souris : légère profondeur entre les deux photographies (souris uniquement).
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 70, damping: 20, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 70, damping: 20, mass: 0.6 });
  const imgX = useTransform(sx, (v) => v * -16);
  const imgY = useTransform(sy, (v) => v * -16);
  const detX = useTransform(sx, (v) => v * 26);
  const detY = useTransform(sy, (v) => v * 26);
  const strandsX = useTransform(sx, (v) => v * 10);

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
  };

  const rise = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 18 } as const),
    animate: go,
    variants: { hide: {}, show: { opacity: 1, y: 0 } },
    transition: { duration: 1, ease: EASE, delay },
  });

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      aria-label="Présentation"
      className="on-dark grain relative isolate mx-2 mt-2 overflow-hidden rounded-[2rem] bg-noir md:mx-3 md:mt-3 md:rounded-[3rem]"
    >
      {/* Halo de lumière qui respire */}
      <div aria-hidden className="pointer-events-none absolute -right-[10%] top-[8%] -z-10 h-[70%] w-[70%] lg:right-[2%] lg:w-[48%]">
        <motion.div
          className="halo h-full w-full rounded-full bg-[radial-gradient(closest-side,rgba(199,167,108,0.32),rgba(199,167,108,0.08)_55%,transparent)] blur-2xl"
          initial={reduce ? false : { opacity: 0 }}
          animate={go}
          variants={{ hide: {}, show: { opacity: 1 } }}
          transition={{ duration: 2.4, ease: EASE }}
        />
      </div>

      <div className="container-x grid min-h-[calc(100svh-1rem)] content-center gap-9 pb-14 pt-[calc(var(--header-h)+1.25rem)] md:min-h-[calc(100svh-1.5rem)] lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-16">
        {/* ─── Le miroir ─── */}
        <div className="relative flex justify-end lg:order-2 lg:col-span-5 lg:col-start-8 lg:justify-center">
          {/* Mèches dorées derrière le miroir */}
          <motion.svg
            aria-hidden
            viewBox="0 0 600 800"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
            className="pointer-events-none absolute -inset-y-[8%] -left-[30%] right-[-12%] -z-10 h-[116%] w-[142%] lg:-left-[45%] lg:w-[160%]"
            style={{ x: strandsX }}
          >
            <defs>
              <linearGradient id="hero-glint" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f7e7b0" stopOpacity="0" />
                <stop offset="0.5" stopColor="#f7e7b0" stopOpacity="0.95" />
                <stop offset="1" stopColor="#f7e7b0" stopOpacity="0" />
              </linearGradient>
            </defs>
            {STRANDS.map((d, i) => (
              <g key={d}>
                <motion.path
                  d={d}
                  stroke="#c7a76c"
                  strokeOpacity={0.42 - i * 0.1}
                  strokeWidth={1.1}
                  strokeLinecap="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={go}
                  variants={{ hide: {}, show: { pathLength: 1 } }}
                  transition={{ duration: 2.6, ease: SILK, delay: 0.25 + i * 0.22 }}
                />
                {/* Toujours rendu (même structure serveur / navigateur) ; n'anime qu'hors mouvement réduit. */}
                <motion.path
                  d={d}
                  stroke="url(#hero-glint)"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeDasharray="90 1400"
                  initial={{ strokeDashoffset: 90, opacity: 0 }}
                  animate={ready && !reduce ? { strokeDashoffset: -1310, opacity: [0, 1, 1, 0] } : undefined}
                  transition={{ duration: 5.5, ease: "linear", repeat: Infinity, repeatDelay: 1.8 + i * 1.3, delay: 2.4 + i * 0.9 }}
                />
              </g>
            ))}
          </motion.svg>

          {/* La largeur suit la hauteur d'écran disponible pour garder une arche parfaite (format 3:4). */}
          <motion.div
            className="relative w-[min(66%,17rem,26svh)] sm:w-[min(52%,20rem,30svh)] lg:w-[min(100%,58svh,34rem)]"
            style={{ y: mirrorY, scale: mirrorScale }}
          >
            {/* Arche du miroir : la photo se dévoile de bas en haut */}
            <motion.div
              data-reveal
              className="arch relative aspect-[3/4] w-full overflow-hidden bg-cacao"
              initial={reduce ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
              animate={go}
              variants={{ hide: {}, show: { clipPath: "inset(0% 0% 0% 0%)" } }}
              transition={{ duration: 1.6, ease: SILK, delay: 0.1 }}
            >
              <motion.div className="absolute inset-0" style={{ x: imgX, y: imgY }}>
                <motion.div
                  data-reveal
                  className="absolute inset-0"
                  initial={reduce ? false : { scale: 1.3 }}
                  animate={go}
                  variants={{ hide: {}, show: { scale: 1 } }}
                  transition={{ duration: 2.8, ease: EASE, delay: 0.1 }}
                >
                  <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.08 }}
                    animate={reduce || !ready ? undefined : { scale: [1.08, 1.15] }}
                    transition={{ duration: 16, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: 2.8 }}
                  >
                    {image && (
                      <Img
                        src={image.url}
                        alt={image.alt}
                        fill
                        priority
                        sizes="(min-width: 1024px) 36vw, 66vw"
                        quality={80}
                        className="object-cover object-[22%_40%]"
                      />
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
              {/* Reflet du miroir : un voile clair glisse une fois sur la vitre */}
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-ivoire/18 to-transparent"
                initial={{ x: "0%" }}
                animate={ready && !reduce ? { x: "420%" } : undefined}
                transition={{ duration: 1.6, ease: SILK, delay: 1.5 }}
              />
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-champagne/25" />
            </motion.div>

            {/* Petite photo en superposition */}
            {imageDetail && (
              <motion.div className="absolute -bottom-[8%] -left-[22%] w-[46%] lg:-left-[26%] lg:w-[42%]" style={{ y: detailY }}>
                <motion.div style={{ x: detX, y: detY }}>
                  <motion.div
                    data-reveal
                    className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] border-[5px] border-noir shadow-[0_30px_60px_-20px_rgba(0,0,0,0.85)] md:rounded-[1.75rem] md:border-[7px]"
                    initial={reduce ? false : { opacity: 0, scale: 0.6, rotate: -14 }}
                    animate={go}
                    variants={{ hide: {}, show: { opacity: 1, scale: 1, rotate: -5 } }}
                    transition={{ type: "spring", stiffness: 90, damping: 15, delay: 1.05 }}
                  >
                    <Img src={imageDetail.url} alt={imageDetail.alt} fill sizes="(min-width: 1024px) 15vw, 30vw" className="object-cover" />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* ─── Le texte ─── */}
        <motion.div className="relative lg:order-1 lg:col-span-7 lg:pr-6" style={{ y: textY, opacity: textFade }}>
          <TextReveal text={title} as="h1" play={ready} delay={0.35} stagger={0.07} className="t-display max-w-[13ch] text-ivoire" />
          <motion.p className="t-lead muted mt-6 max-w-[33rem] md:mt-8" {...rise(0.95)}>
            {subtitle}
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap items-center gap-3 md:mt-10" {...rise(1.1)}>
            {ctaPrimary && (
              <Magnetic>
                <LinkButton href={ctaPrimary.href} variant="gold" size="lg" arrow>
                  {ctaPrimary.label}
                </LinkButton>
              </Magnetic>
            )}
            {ctaSecondary && (
              <Magnetic strength={0.18}>
                <LinkButton href={ctaSecondary.href} variant="light" size="lg">
                  {ctaSecondary.label}
                </LinkButton>
              </Magnetic>
            )}
          </motion.div>
          {highlights.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2 md:mt-14">
              {highlights.map((h, i) => (
                <motion.li
                  key={h}
                  className="rounded-full border border-ivoire/15 bg-ivoire/[0.04] px-4 py-2 text-[0.88rem] text-ivoire/80 backdrop-blur-sm"
                  initial={reduce ? false : { opacity: 0, y: 12, scale: 0.92 }}
                  animate={go}
                  variants={{ hide: {}, show: { opacity: 1, y: 0, scale: 1 } }}
                  transition={{ type: "spring", stiffness: 160, damping: 18, delay: 1.35 + i * 0.1 }}
                >
                  {h}
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </section>
  );
}
