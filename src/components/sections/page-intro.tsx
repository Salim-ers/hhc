import { ImageReveal, Reveal, TextReveal } from "@/components/motion/reveal";
import { Img } from "@/components/ui/img";
import { cn } from "@/lib/utils";

/** En-tête des pages intérieures : panneau sombre arrondi, titre révélé mot à mot, photo dans l'arche du miroir. */
export function PageIntro({
  title,
  subtitle,
  image,
  children,
}: {
  title: string;
  subtitle?: string;
  image?: { url: string; alt: string } | null;
  children?: React.ReactNode;
}) {
  return (
    <section className="panel on-dark grain relative isolate overflow-hidden bg-noir">
      <div aria-hidden className="pointer-events-none absolute -left-[15%] -top-[30%] -z-10 h-[90%] w-[60%]">
        <div className="halo h-full w-full rounded-full bg-[radial-gradient(closest-side,rgba(199,167,108,0.18),transparent)] blur-2xl" />
      </div>
      <div
        className={cn(
          "container-x grid items-end gap-10 pb-12 pt-[calc(var(--header-h)+3rem)] md:pb-16 lg:grid-cols-12",
          image && "lg:pt-[calc(var(--header-h)+2rem)]",
        )}
      >
        <div className={cn(image ? "lg:col-span-7" : "lg:col-span-10", "lg:pb-4")}>
          <TextReveal text={title} as="h1" immediate delay={0.1} className="t-h1 text-ivoire" />
          {subtitle && (
            <Reveal delay={0.35}>
              <p className="t-lead muted mt-6 max-w-[38rem] md:mt-8">{subtitle}</p>
            </Reveal>
          )}
          {children && <Reveal delay={0.5}>{children}</Reveal>}
        </div>
        {image && (
          <div className="hidden sm:block lg:col-span-4 lg:col-start-9">
            <ImageReveal className="arch ml-auto aspect-[3/4] w-full max-w-[22rem] lg:max-w-none">
              <Img src={image.url} alt={image.alt} fill loading="eager" sizes="(min-width:1024px) 30vw, 60vw" className="object-cover" />
            </ImageReveal>
          </div>
        )}
      </div>
    </section>
  );
}
