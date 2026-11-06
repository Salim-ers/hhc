"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Monogram, Wordmark } from "@/components/brand/monogram";

const IntroContext = createContext<{ ready: boolean }>({ ready: true });
export const useIntroReady = () => useContext(IntroContext).ready;

const EASE = [0.65, 0, 0.35, 1] as const;
const DURATION = 2300;

/**
 * Écran d'ouverture — première visite de la session uniquement.
 * 1. Fond noir · 2. le monogramme se dessine · 3. reflet doré sur le métal ·
 * 4. apparition du nom · 5. fine ligne de progression · 6. le cercle du « C » s'ouvre sur la page.
 * Court (≈2,3 s), passable au clic ou avec Échap, jamais rejoué pendant la session.
 */
export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(true);

  useEffect(() => {
    const on = document.documentElement.classList.contains("intro");
    if (!on) return;
    setActive(true);
    setReady(false);
    const t = setTimeout(() => finish(), DURATION);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && finish();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem("hhc-intro", "1");
    } catch {}
    // Retire le voile CSS posé avant l'hydratation : le cercle peut alors révéler la page.
    document.documentElement.classList.remove("intro");
    setActive(false);
    setReady(true);
  }, []);

  return (
    <IntroContext.Provider value={{ ready }}>
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            key="intro"
            role="presentation"
            onClick={finish}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-noir"
            initial={{ clipPath: "circle(150% at 50% 46%)" }}
            exit={{ clipPath: "circle(0% at 50% 46%)" }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            <IntroArt />
          </motion.div>
        )}
      </AnimatePresence>
    </IntroContext.Provider>
  );
}

function IntroArt() {
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-[min(42vw,13rem)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Monogram className="w-full text-or-logo" />
        </motion.div>
        {/* Reflet métallique, masqué par la forme exacte du monogramme */}
        <motion.div
          aria-hidden
          className="shine absolute inset-0"
          style={{
            WebkitMaskImage: "url(/brand/logo-mark.svg)",
            maskImage: "url(/brand/logo-mark.svg)",
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
          }}
          initial={{ backgroundPosition: "120% 0", opacity: 0 }}
          animate={{ backgroundPosition: "-60% 0", opacity: [0, 1, 1, 0.9] }}
          transition={{ duration: 1.6, delay: 0.45, ease: EASE }}
        />
      </div>
      <motion.div
        className="mt-9 w-[min(68vw,22rem)]"
        initial={{ opacity: 0, y: 10, letterSpacing: "0.2em" }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <Wordmark className="w-full text-ivoire" />
      </motion.div>
      <div className="mt-8 h-px w-[min(56vw,16rem)] overflow-hidden bg-ivoire/10">
        <motion.div
          className="h-full origin-left bg-champagne"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.7, delay: 0.3, ease: EASE }}
        />
      </div>
    </div>
  );
}
