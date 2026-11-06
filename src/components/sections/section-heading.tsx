import { Reveal, TextReveal } from "@/components/motion/reveal";
import { cn, paragraphs } from "@/lib/utils";

/** Titre de section : le titre seul porte la hiérarchie (pas de surtitre décoratif). */
export function SectionHeading({
  title,
  body,
  className,
  align = "left",
  as = "h2",
}: {
  title: string;
  body?: string;
  className?: string;
  align?: "left" | "center";
  as?: "h2" | "h3";
}) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", className)}>
      <TextReveal text={title} as={as} className="t-h2" />
      {body && (
        <Reveal delay={0.15}>
          <div className={cn("t-lead muted mt-6 max-w-[40rem] space-y-4", align === "center" && "mx-auto")}>
            {paragraphs(body).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}
