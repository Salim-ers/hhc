import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { LinkButton } from "@/components/ui/button";
import { Img } from "@/components/ui/img";
import type { PublicGalleryItem } from "@/lib/data/types";

/**
 * Aperçu de la galerie : deux rubans de photos qui défilent en sens contraires, en pause au survol.
 * Mouvement réduit : le CSS arrête le défilement, masque la copie et rend la rangée défilable à la main
 * (même HTML côté serveur et navigateur, donc aucune différence à l'hydratation).
 */
export function GalleryPreview({ title, cta, items }: { title: string; cta: { label: string; href: string } | null; items: PublicGalleryItem[] }) {
  const pics = items.slice(0, 12);
  if (pics.length < 4) return null;
  const half = Math.ceil(pics.length / 2);
  const rows = [pics.slice(0, half), pics.slice(half)];

  return (
    <section className="panel on-dark grain relative overflow-hidden bg-espresso py-20 md:py-28">
      <div className="container-x flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <SectionHeading title={title} />
        {cta && (
          <Reveal className="shrink-0">
            <LinkButton href={cta.href} variant="light" arrow>
              {cta.label}
            </LinkButton>
          </Reveal>
        )}
      </div>

      <div className="marquee-host mt-12 space-y-3 md:mt-16 md:space-y-4">
        {rows.map((row, r) => (
          <div key={r} className="marquee-row overflow-hidden">
            <ul
              className="marquee"
              data-direction={r === 1 ? "reverse" : undefined}
              style={{ "--marquee-duration": `${row.length * 11}s` } as React.CSSProperties}
            >
              {[row, row].flatMap((copy, c) =>
                copy.map((g) => (
                  <li key={`${c}-${g.id}`} aria-hidden={c === 1 || undefined} data-copy={c === 1 ? "" : undefined} className="shrink-0 pr-3 md:pr-4">
                    <div
                      className="relative h-[clamp(11rem,24vw,21rem)] overflow-hidden rounded-[1.5rem] md:rounded-[2rem]"
                      style={{ aspectRatio: r === 0 ? "3 / 4" : "4 / 5" }}
                    >
                      <Img src={g.imageUrl} alt={c === 1 ? "" : g.alt} fill sizes="(min-width:1024px) 18vw, 40vw" className="object-cover" />
                    </div>
                  </li>
                )),
              )}
            </ul>
          </div>
        ))}
      </div>

      {pics.some((p) => p.isStock) && (
        <p className="container-x muted mt-8 text-sm">Photographies d&apos;inspiration : les réalisations d&apos;Angèle viendront bientôt les remplacer.</p>
      )}
    </section>
  );
}
