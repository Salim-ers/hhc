"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Monogram } from "@/components/brand/monogram";

/**
 * Carte Google Maps de la ZONE d'intervention (et non d'un lieu d'accueil).
 * Chargée uniquement après accord du visiteur (Google dépose des cookies) — choix mémorisé.
 * Avec NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY, utilise l'API Maps Embed officielle ; sinon l'intégration publique.
 */
export function ServiceMap({ query, lat, lng, zoom = 11 }: { query: string; lat: number; lng: number; zoom?: number }) {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem("hhc-maps") === "1") setAllowed(true);
    } catch {}
  }, []);
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  const src = key
    ? `https://www.google.com/maps/embed/v1/view?key=${key}&center=${lat},${lng}&zoom=${zoom}&maptype=roadmap`
    : `https://maps.google.com/maps?q=${encodeURIComponent(query)}&ll=${lat},${lng}&z=${zoom}&output=embed`;

  const allow = () => {
    setAllowed(true);
    try {
      localStorage.setItem("hhc-maps", "1");
    } catch {}
  };

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-espresso md:aspect-[16/11]">
      {allowed ? (
        <iframe
          title="Carte de la zone d'intervention : Troyes et son agglomération"
          src={src}
          className="absolute inset-0 h-full w-full border-0 grayscale-[0.35] sepia-[0.15]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="on-dark grain absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
          {/* Représentation stylisée de la zone : cercles concentriques autour de Troyes */}
          <svg aria-hidden viewBox="0 0 400 300" className="absolute inset-0 h-full w-full opacity-60">
            {[40, 80, 120, 160].map((r) => (
              <circle key={r} cx="200" cy="150" r={r} fill="none" stroke="#c7a76c" strokeOpacity={0.5 - r / 450} strokeDasharray={r === 160 ? "3 6" : undefined} />
            ))}
            <circle cx="200" cy="150" r="80" fill="#c7a76c" fillOpacity="0.08" />
          </svg>
          <Monogram title="" aria-hidden className="relative w-20 text-champagne" />
          <p className="relative mt-6 font-display text-2xl text-ivoire">Troyes, Sainte-Savine & agglomération</p>
          <p className="muted relative mt-2 max-w-sm text-sm">
            La carte interactive est fournie par Google Maps, qui peut déposer des cookies.
          </p>
          <button
            type="button"
            onClick={allow}
            className="relative mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-champagne/60 px-5 text-ivoire transition-colors hover:bg-champagne hover:text-noir"
          >
            <MapPin className="h-4 w-4" aria-hidden /> Afficher la carte
          </button>
        </div>
      )}
      <p className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-noir/80 px-3 py-1.5 text-xs text-ivoire backdrop-blur">
        Zone desservie : service exclusivement à domicile, sans accueil du public
      </p>
    </div>
  );
}
