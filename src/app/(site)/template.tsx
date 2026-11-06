"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Transition entre les pages : fondu et légère montée, à chaque navigation.
 * `data-reveal` : sans JavaScript, la règle <noscript> du layout racine affiche la page.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      data-reveal
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
