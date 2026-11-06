import { Monogram } from "@/components/brand/monogram";
import { ImageReveal, LineReveal, Reveal } from "@/components/motion/reveal";
import { Img } from "@/components/ui/img";
import { cn } from "@/lib/utils";

/** En-tête des pages intérieures : fond noir, titre éditorial, image à l'arc HHC. */
export function PageIntro({
  eyebrow,
  title,
  subtitle,
  image,
  children,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image?: { url: string; alt: string } | null;
  children?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="on-dark grain relative isolate overflow-hidden bg-noir">
      <Monogram
        aria-hidden
        title=""
        className="pointer-events-none absolute -bottom-[12%] -left-[8%] -z-10 w-[70vw] max-w-[900px] text-champagne/[0.05]"
      />
      <div
        className={cn(
          "container-x grid items-end gap-12 pb-16 pt-[calc(var(--header-h)+4rem)] lg:grid-cols-12 lg:gap-10",
          compact ? "lg:pb-20 lg:pt-[calc(var(--header-h)+6rem)]" : "lg:min-h-[78svh] lg:pb-24",
        )}
      >
        <div className={cn(image ? "lg:col-span-7" : "lg:col-span-10")}>
          <Reveal y={12}>
            <p className="eyebrow">{eyebrow}</p>
          </Reveal>
          <LineReveal text={title} as="h1" immediate delay={0.1} className="t-h1 mt-6 text-ivoire" />
          {subtitle && (
            <Reveal delay={0.35}>
              <p className="t-lead muted mt-8 max-w-[38rem]">{subtitle}</p>
            </Reveal>
          )}
          {children && <Reveal delay={0.5}>{children}</Reveal>}
        </div>
        {image && (
          <div className="lg:col-span-5">
            <ImageReveal className="arc-tl aspect-[4/5] w-full max-w-[34rem] lg:ml-auto">
              <Img src={image.url} alt={image.alt} fill priority sizes="(min-width:1024px) 34vw, 92vw" className="object-cover" />
            </ImageReveal>
          </div>
        )}
      </div>
    </section>
  );
}
