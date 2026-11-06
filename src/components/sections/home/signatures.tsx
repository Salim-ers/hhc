import Link from "next/link";
import { ImageReveal, Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/sections/section-heading";
import { Img } from "@/components/ui/img";
import { cn } from "@/lib/utils";

type Item = { title: string; text: string; image?: { url: string; alt: string }; href?: string };

/** Compositions décalées : quatre grandes images, une ligne éditoriale. */
export function SignaturesSection({ eyebrow, title, items }: { eyebrow: string; title: string; items: Item[] }) {
  return (
    <section className="on-dark grain relative bg-noir py-24 md:py-36">
      <div className="container-x">
        <SectionHeading eyebrow={eyebrow} title={title} className="max-w-4xl" />
        <ul className="mt-16 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
          {items.map((it, i) => (
            <li key={it.title} className={cn(i % 2 === 1 && "lg:mt-24", i === 2 && "lg:mt-10", i === 3 && "lg:mt-36")}>
              <Link href={it.href || "/prestations"} className="group block">
                <ImageReveal delay={i * 0.08} className={cn("aspect-[3/4] w-full", i === 0 && "arc-tl")}>
                  {it.image?.url && (
                    <Img
                      src={it.image.url}
                      alt={it.image.alt}
                      fill
                      sizes="(min-width:1024px) 24vw, (min-width:640px) 46vw, 92vw"
                      className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-luxe)] group-hover:scale-[1.06]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-noir/60 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                </ImageReveal>
                <Reveal delay={0.1 + i * 0.08}>
                  <h3 className="t-h3 mt-6 text-ivoire">{it.title}</h3>
                  <span aria-hidden className="mt-4 block h-px w-10 bg-champagne transition-all duration-700 ease-[var(--ease-luxe)] group-hover:w-24" />
                  <p className="muted mt-4 text-[0.97rem]">{it.text}</p>
                </Reveal>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
