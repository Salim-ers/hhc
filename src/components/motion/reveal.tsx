"use client";

import { motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Fragment, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const SILK = [0.65, 0, 0.35, 1] as const;

/*
 * Toutes les révélations portent l'attribut `data-reveal` : sans JavaScript, une règle
 * <noscript> (layout racine) neutralise leur état initial pour que le contenu reste visible.
 */

/** Apparition douce au défilement (une seule fois). */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "section" | "article";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      data-reveal
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1.1, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

/**
 * Titre révélé mot à mot : chaque mot remonte derrière un masque avec une légère rotation,
 * comme une mèche qui retombe en place. « \n » force un retour à la ligne.
 */
export function TextReveal({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
  stagger = 0.045,
  immediate = false,
  play,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  stagger?: number;
  /** Démarre sans attendre l'entrée dans l'écran (en-têtes de page). */
  immediate?: boolean;
  /** Pilotage externe (Hero : attend la fin de l'écran d'ouverture). */
  play?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  // Mouvement réduit : affichage immédiat (durée nulle). L'état initial reste identique au rendu serveur,
  // sinon Motion considère la valeur déjà « arrivée » et laisse le mot masqué.
  const show = Boolean(reduce) || (play ?? (immediate || inView));
  let index = 0;
  return (
    <Tag ref={ref} className={className}>
      {text.split("\n").map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line
            .split(" ")
            .filter(Boolean)
            .map((word, wi, words) => {
              const i = index++;
              return (
                <Fragment key={wi}>
                  <span className="-mb-[0.14em] -mr-[0.06em] inline-block overflow-hidden pb-[0.14em] pr-[0.06em] align-top">
                    <motion.span
                      data-reveal
                      className="inline-block origin-bottom-left"
                      initial={{ y: "108%", rotate: 4 }}
                      animate={show ? { y: "0%", rotate: 0 } : undefined}
                      transition={reduce ? { duration: 0 } : { duration: 1.05, ease: EASE, delay: delay + i * stagger }}
                    >
                      {word}
                    </motion.span>
                  </span>
                  {wi < words.length - 1 && " "}
                </Fragment>
              );
            })}
        </Fragment>
      ))}
    </Tag>
  );
}

/** Image révélée par un rideau avec un léger zoom arrière. L'arrondi est porté par `className`. */
export function ImageReveal({
  children,
  className,
  from = "bottom",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  from?: "bottom" | "left" | "right";
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const hidden = { bottom: "inset(100% 0% 0% 0%)", left: "inset(0% 100% 0% 0%)", right: "inset(0% 0% 0% 100%)" }[from];
  return (
    <motion.div
      data-reveal
      className={cn("relative overflow-hidden", className)}
      initial={reduce ? false : { clipPath: hidden }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: 1.4, ease: SILK, delay }}
    >
      <motion.div
        data-reveal
        className="absolute inset-0"
        initial={reduce ? false : { scale: 1.18 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        transition={{ duration: 2, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Parallaxe légère : le contenu glisse plus lentement que la page. */
export function Parallax({ children, className, strength = 60 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-strength, strength]);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div className="absolute -inset-y-[12%] inset-x-0" style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

/** Attraction magnétique au survol de la souris (jamais au toucher, ni en mouvement réduit). */
export function Magnetic({ children, className, strength = 0.28 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.5 });
  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };
  return (
    <motion.div ref={ref} className={cn("inline-flex", className)} style={{ x: sx, y: sy }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.div>
  );
}
