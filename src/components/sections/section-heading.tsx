import { LineReveal, Reveal } from "@/components/motion/reveal";
import { cn, paragraphs } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  body,
  className,
  align = "left",
  as = "h2",
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  className?: string;
  align?: "left" | "center";
  as?: "h2" | "h3";
}) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <Reveal y={10}>
          <p className={cn("eyebrow", align === "center" && "justify-center")}>{eyebrow}</p>
        </Reveal>
      )}
      <LineReveal text={title} as={as} className="t-h2 mt-5" />
      {body && (
        <Reveal delay={0.15}>
          <div className={cn("t-lead muted mt-7 max-w-[40rem] space-y-4", align === "center" && "mx-auto")}>
            {paragraphs(body).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}
