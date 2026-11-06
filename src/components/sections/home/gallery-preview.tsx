import Link from "next/link";
import { ImageReveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { Img } from "@/components/ui/img";
import type { PublicGalleryItem } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/** Mosaïque immersive : grille éditoriale à tailles variables. */
export function GalleryPreview({ eyebrow, title, cta, items }: { eyebrow: string; title: string; cta: { label: string; href: string } | null; items: PublicGalleryItem[] }) {
  const pics = items.slice(0, 8);
  if (!pics.length) return null;
  // 8 vignettes qui remplissent exactement 5 colonnes × 3 rangées sur grand écran.
  const spans = [
    "col-span-2 row-span-2",
    "row-span-2",
    "",
    "",
    "col-span-2 lg:col-span-2",
    "",
    "lg:col-span-2",
    "col-span-2",
  ];
  return (
    <section className="on-dark grain relative bg-noir py-24 md:py-36">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading eyebrow={eyebrow} title={title} />
          {cta && (
            <Link href={cta.href} className="link-underline shrink-0 font-display text-xl italic text-champagne">
              {cta.label}
            </Link>
          )}
        </div>
        <ul className="mt-14 grid grid-flow-dense auto-rows-[38vw] grid-cols-2 gap-3 sm:auto-rows-[28vw] md:gap-4 lg:auto-rows-[15vw] lg:grid-cols-5 3xl:auto-rows-[13vw]">
          {pics.map((g, i) => (
            <li key={g.id} className={cn("relative", spans[i])}>
              <ImageReveal delay={(i % 4) * 0.07} className="h-full w-full">
                <Img src={g.imageUrl} alt={g.alt} fill sizes="(min-width:1024px) 30vw, 50vw" className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-luxe)] hover:scale-105" />
              </ImageReveal>
            </li>
          ))}
        </ul>
        {pics.some((p) => p.isStock) && (
          <p className="muted mt-6 text-sm">Photographies d&apos;inspiration — les réalisations d&apos;Angèle viendront bientôt les remplacer.</p>
        )}
      </div>
    </section>
  );
}
