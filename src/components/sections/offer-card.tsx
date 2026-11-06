import Link from "next/link";
import type { PublicOffer } from "@/lib/data/types";
import { cn, formatPrice } from "@/lib/utils";

const KIND_LABEL: Record<PublicOffer["kind"], string> = {
  forfait: "Forfait",
  formule: "Formule",
  promotion: "Avantage",
  parrainage: "Parrainage",
  bon_cadeau: "Cadeau",
  banniere: "Offre du moment",
};

export function offerHref(o: PublicOffer) {
  return o.ctaHref || `/contact?prestation=${encodeURIComponent(o.title)}`;
}

/** Carte d'offre premium : tarif, composition, conditions et appel à l'action. */
export function OfferCard({ offer, tone = "light", className }: { offer: PublicOffer; tone?: "light" | "dark"; className?: string }) {
  const dark = tone === "dark";
  const price = offer.priceCents != null && !offer.priceLabel ? formatPrice(offer.priceCents) : offer.priceLabel;
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col border p-8 transition-[transform,border-color,box-shadow] duration-700 ease-[var(--ease-luxe)] hover:-translate-y-1 md:p-10",
        dark
          ? "on-dark border-ivoire/12 bg-cacao hover:border-champagne/50 hover:shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)]"
          : "border-encre/12 bg-lin hover:border-or-profond/40 hover:shadow-[0_40px_80px_-50px_rgba(56,43,39,0.45)]",
        className,
      )}
    >
      <p className={cn("text-sm", dark ? "text-champagne" : "text-or-profond")}>{KIND_LABEL[offer.kind]}</p>
      <h3 className="t-h3 mt-3">{offer.title}</h3>
      {offer.subtitle && <p className="muted mt-2 font-display text-lg italic">{offer.subtitle}</p>}

      {price && (
        <p className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="tabular font-display text-5xl font-light leading-none">{price}</span>
          {offer.compareAtCents != null && (
            <span className="muted text-sm">
              au lieu de <s className="tabular">{formatPrice(offer.compareAtCents)}</s>
            </span>
          )}
        </p>
      )}
      {offer.description && <p className="muted mt-6">{offer.description}</p>}

      {offer.items.length > 0 && (
        <ul className={cn("mt-6 space-y-2 border-t pt-6 text-[0.95rem]", dark ? "border-ivoire/10" : "border-encre/10")}>
          {offer.items.map((it) => (
            <li key={it} className="flex gap-3">
              <span aria-hidden className={cn("mt-[0.7em] h-px w-3 shrink-0", dark ? "bg-champagne" : "bg-or-profond")} />
              {it}
            </li>
          ))}
        </ul>
      )}
      {offer.conditions && <p className="muted mt-6 text-sm leading-relaxed">{offer.conditions}</p>}
      {offer.code && (
        <p className="mt-4 text-sm">
          Code : <span className="tabular border border-current/30 px-2 py-0.5">{offer.code}</span>
        </p>
      )}

      <div className="mt-auto pt-8">
        <Link
          href={offerHref(offer)}
          className={cn(
            "inline-flex min-h-11 items-center border-b pb-1 text-[0.95rem] transition-colors",
            dark ? "border-champagne/60 text-ivoire hover:text-champagne" : "border-or-profond/50 hover:text-or-profond",
          )}
        >
          {offer.ctaLabel || "Prendre rendez-vous"}
          <span className="sr-only"> — {offer.title}</span>
        </Link>
      </div>
    </article>
  );
}
