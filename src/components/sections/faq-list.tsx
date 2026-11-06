import type { PublicFaq } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/** FAQ accessible sans JavaScript (details/summary), en cartes arrondies, ouverture fluide en CSS. */
export function FaqList({ faqs, tone = "light" }: { faqs: PublicFaq[]; tone?: "light" | "dark" }) {
  if (!faqs.length) return null;
  const dark = tone === "dark";
  return (
    <div className="space-y-3">
      {faqs.map((f) => (
        <details
          key={f.id}
          className={cn(
            "faq-item group rounded-[1.5rem] px-6 transition-colors duration-500 md:px-8 [&_summary::-webkit-details-marker]:hidden",
            dark ? "bg-ivoire/[0.05] open:bg-ivoire/[0.08]" : "bg-ivoire open:bg-sable/70",
          )}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-[1.5rem] py-6 text-left">
            <h3 className="font-display text-[clamp(1.2rem,1.05rem+0.6vw,1.6rem)] font-normal leading-snug">{f.question}</h3>
            <span
              aria-hidden
              className={cn(
                "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-[var(--ease-luxe)] group-open:rotate-45",
                dark ? "bg-ivoire/10" : "bg-lin",
              )}
            >
              <span className="absolute h-px w-3.5 bg-current" />
              <span className="absolute h-3.5 w-px bg-current" />
            </span>
          </summary>
          <p className="muted max-w-3xl pb-7 pr-12">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
