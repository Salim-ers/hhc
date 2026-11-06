"use client";

import Link from "next/link";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Clock, MapPin, Pause, Phone, Play } from "lucide-react";
import { useIntroReady } from "@/components/layout/intro-loader";
import { TextReveal } from "@/components/motion/reveal";
import { LinkButton } from "@/components/ui/button";
import { Img } from "@/components/ui/img";
import { HERO_FILM } from "@/lib/content/hero-film";
import { telHref } from "@/lib/utils";

type Props = {
  title: string;
  subtitle: string;
  /** Lien .mp4 du film d'ouverture ; vide = photo plein cadre. */
  video: string;
  image: { url: string; alt: string } | null;
  ctaPrimary: { label: string; href: string } | null;
  ctaSecondary: { label: string; href: string } | null;
  phone: string;
  phoneE164: string;
  hours: string;
  travel: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

function signalHero(open: boolean) {
  if (open) document.documentElement.dataset.hero = "open";
  else delete document.documentElement.dataset.hero;
  window.dispatchEvent(new Event("hhc:hero"));
}
const SILK = [0.65, 0, 0.35, 1] as const;

/**
 * Hero plein écran : un film de coiffure en boucle dans un grand cadre arrondi.
 * À l'arrivée, le cadre s'ouvre depuis une petite fenêtre au centre jusqu'à remplir l'écran,
 * puis le titre monte mot à mot. Au défilement, le cadre recule légèrement et s'assombrit.
 * Le film ne démarre jamais en mouvement réduit ni en mode économie de données (l'affiche reste),
 * se met en pause hors de l'écran et peut être arrêté avec le bouton prévu.
 */
export function Hero({ title, subtitle, video, image, ctaPrimary, ctaSecondary, phone, phoneE164, hours, travel }: Props) {
  const ready = useIntroReady();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const go = ready ? "show" : "hide";

  const film = !video
    ? null
    : video === HERO_FILM.src
      ? HERO_FILM
      : { src: video, mobile: null, poster: image?.url ?? null, posterMobile: null };

  // L'en-tête passe en texte clair une fois que le film couvre le haut de l'écran.
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => signalHero(true), reduce ? 0 : 900);
    return () => clearTimeout(t);
  }, [ready, reduce]);
  useEffect(() => () => signalHero(false), []);

  useEffect(() => {
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    setCanPlay(!reduce && !saveData);
  }, [reduce]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (canPlay && inView && !paused) {
      v.muted = true;
      v.play().catch(() => setPaused(true));
    } else v.pause();
  }, [canPlay, inView, paused]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const frameScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 0.9]);
  const mediaY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "12%"]);
  const veil = useTransform(scrollYProgress, [0, 0.8], [0, 0.55]);

  // L'état initial est le même au serveur et au navigateur ; en mouvement réduit, la durée est nulle.
  const rise = (delay: number) => ({
    "data-reveal": "",
    initial: { opacity: 0, y: 22 },
    animate: go,
    variants: { hide: {}, show: { opacity: 1, y: 0 } },
    transition: reduce ? { duration: 0 } : { duration: 1, ease: EASE, delay },
  });

  return (
    <section ref={ref} data-hero aria-label="Présentation" className="relative h-[100svh] min-h-[36rem] bg-lin p-2 md:p-3">
      <motion.div className="relative h-full origin-top" style={{ scale: frameScale }}>
        <motion.div
          data-reveal
          className="relative h-full overflow-hidden rounded-[2rem] bg-cacao md:rounded-[3rem]"
          initial={{ clipPath: "inset(27% 36% 27% 36% round 2rem)" }}
          animate={go}
          variants={{ hide: {}, show: { clipPath: "inset(0% 0% 0% 0% round 0rem)" } }}
          transition={reduce ? { duration: 0 } : { duration: 1.7, ease: SILK, delay: 0.15 }}
        >
          {/* Le film (ou la photo) */}
          <motion.div className="absolute -inset-y-[6%] inset-x-0" style={{ y: mediaY }}>
            <motion.div
              data-reveal
              className="absolute inset-0"
              initial={{ scale: 1.35 }}
              animate={go}
              variants={{ hide: {}, show: { scale: 1 } }}
              transition={reduce ? { duration: 0 } : { duration: 2.6, ease: EASE, delay: 0.15 }}
            >
              {film ? (
                <>
                  {film.poster && (
                    <picture>
                      {film.posterMobile && <source media="(max-width: 767px)" srcSet={film.posterMobile} />}
                      <img src={film.poster} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
                    </picture>
                  )}
                  <video
                    ref={videoRef}
                    aria-hidden
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    disablePictureInPicture
                    onPlaying={() => setStarted(true)}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${started ? "opacity-100" : "opacity-0"}`}
                  >
                    {film.mobile && <source src={film.mobile} type="video/mp4" media="(max-width: 767px)" />}
                    <source src={film.src} type="video/mp4" />
                  </video>
                </>
              ) : (
                image && <Img src={image.url} alt={image.alt} fill priority sizes="100vw" quality={80} className="object-cover" />
              )}
            </motion.div>
          </motion.div>

          {/* Voiles : lisibilité du texte et de l'en-tête, assombrissement au défilement */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-noir/90 via-noir/35 to-noir/5" />
          <div aria-hidden className="absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-l from-noir/35 to-transparent lg:block" />
          <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-noir/45 to-transparent" />
          <motion.div aria-hidden className="absolute inset-0 bg-noir" style={{ opacity: veil }} />

          {/* Le texte */}
          <div className="container-x relative flex h-full w-full flex-col justify-end pb-6 pt-[calc(var(--header-h)+1rem)] sm:pb-8 md:pb-11 lg:pb-12">
            <div className="flex flex-col gap-5 lg:grid lg:grid-cols-12 lg:gap-x-10 lg:gap-y-8">
              <TextReveal
                text={title}
                as="h1"
                play={ready}
                delay={0.9}
                stagger={0.08}
                className="t-display text-[clamp(2.7rem,11.5vw,4.6rem)] text-ivoire md:text-[clamp(4rem,8vw,9rem)] lg:col-span-8 lg:row-start-1"
              />

              <motion.div className="text-ivoire/85 [text-shadow:0_1px_14px_rgba(16,16,16,0.55)] lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1 lg:self-end" {...rise(1.25)}>
                <p className="max-w-[30rem] text-[1.02rem] leading-relaxed md:text-[1.12rem]">{subtitle}</p>
                <ul className="mt-6 hidden gap-2.5 border-t border-ivoire/15 pt-5 text-[0.92rem] text-ivoire/70 sm:grid">
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-[0.2em] h-4 w-4 shrink-0 text-champagne" aria-hidden />
                    {travel}
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="mt-[0.2em] h-4 w-4 shrink-0 text-champagne" aria-hidden />
                    {hours}
                  </li>
                </ul>
                {ctaSecondary && (
                  <Link href={ctaSecondary.href} className="group mt-4 hidden items-center gap-2 text-[0.95rem] text-ivoire sm:inline-flex">
                    <span className="link-underline">{ctaSecondary.label}</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-luxe)] group-hover:translate-x-1" aria-hidden />
                  </Link>
                )}
              </motion.div>

              <motion.div className="flex flex-wrap items-center gap-x-7 gap-y-4 pt-1 lg:col-span-8 lg:row-start-2 lg:pt-0" {...rise(1.4)}>
                {ctaPrimary && (
                  <LinkButton href={ctaPrimary.href} size="lg" arrow>
                    {ctaPrimary.label}
                  </LinkButton>
                )}
                <a href={telHref(phoneE164)} className="inline-flex items-center gap-2.5 text-[1.02rem] text-ivoire">
                  <Phone className="h-4 w-4 text-champagne" aria-hidden />
                  <span className="link-underline">{phone}</span>
                </a>
              </motion.div>
            </div>
          </div>

          {/* Arrêt du film (critère WCAG 2.2.2) */}
          {film && canPlay && (
            <motion.button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Lire la vidéo" : "Mettre la vidéo en pause"}
              className="absolute right-4 top-[calc(var(--header-h)+0.75rem)] flex h-10 w-10 items-center justify-center rounded-full text-ivoire ring-1 ring-ivoire/30 backdrop-blur-md transition-colors duration-300 hover:bg-ivoire/15 md:right-6"
              {...rise(1.6)}
            >
              {paused ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
