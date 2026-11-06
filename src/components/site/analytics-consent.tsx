"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

/**
 * Mesure d'audience Google Analytics chargée UNIQUEMENT après accord explicite (RGPD / CNIL).
 * Sans identifiant configuré dans les Paramètres, rien n'est affiché ni chargé.
 */
export function AnalyticsConsent({ gaId }: { gaId: string }) {
  const [choice, setChoice] = useState<"yes" | "no" | null | "unknown">("unknown");
  useEffect(() => {
    try {
      const v = localStorage.getItem("hhc-consent");
      setChoice(v === "yes" || v === "no" ? v : null);
    } catch {
      setChoice(null);
    }
  }, []);
  if (!gaId || choice === "unknown") return null;
  const decide = (v: "yes" | "no") => {
    try {
      localStorage.setItem("hhc-consent", v);
    } catch {}
    setChoice(v);
  };
  return (
    <>
      {choice === "yes" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}</Script>
        </>
      )}
      {choice === null && (
        <div role="dialog" aria-label="Mesure d'audience" className="fixed inset-x-3 bottom-24 z-[70] mx-auto max-w-lg border border-ivoire/15 bg-noir p-5 text-sm text-ivoire shadow-2xl md:bottom-6">
          <p>Acceptez-vous la mesure d&apos;audience anonyme (Google Analytics) pour nous aider à améliorer le site ?</p>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => decide("no")} className="min-h-11 flex-1 border border-ivoire/30 px-4">
              Refuser
            </button>
            <button type="button" onClick={() => decide("yes")} className="min-h-11 flex-1 bg-champagne px-4 text-noir">
              Accepter
            </button>
          </div>
        </div>
      )}
    </>
  );
}
