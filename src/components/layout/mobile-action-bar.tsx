"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { Phone } from "lucide-react";
import { telHref } from "@/lib/utils";

/** Barre d'action mobile : appeler ou demander un rendez-vous, discrète, après le premier écran. */
export function MobileActionBar({ phoneE164, whatsapp }: { phoneE164: string; whatsapp: string | null }) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setShow(y > 480));
  if (pathname.startsWith("/contact")) return null;
  return (
    <motion.div
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 md:hidden"
      initial={false}
      animate={{ y: show ? 0 : 120, opacity: show ? 1 : 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden={!show}
    >
      <div className="flex gap-2 rounded-full bg-noir/90 p-1.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-ivoire/10 backdrop-blur-xl">
        <a
          href={telHref(phoneE164)}
          tabIndex={show ? 0 : -1}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-ivoire/10 text-ivoire"
        >
          <Phone className="h-4 w-4" aria-hidden /> Appeler
        </a>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
            tabIndex={show ? 0 : -1}
            className="flex min-h-12 items-center justify-center rounded-full bg-ivoire/10 px-4 text-ivoire"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        )}
        <Link href="/contact" tabIndex={show ? 0 : -1} className="flex min-h-12 flex-[1.4] items-center justify-center rounded-full bg-champagne text-noir">
          Prendre rendez-vous
        </Link>
      </div>
    </motion.div>
  );
}
