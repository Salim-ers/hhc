import type { PublicFaq } from "@/lib/data/types";

/** FAQ accessible sans JavaScript (details/summary), animée en CSS. */
export function FaqList({ faqs, tone = "light" }: { faqs: PublicFaq[]; tone?: "light" | "dark" }) {
  if (!faqs.length) return null;
  const border = tone === "dark" ? "border-ivoire/15" : "border-encre/15";
  return (
    <div className={`border-t ${border}`}>
      {faqs.map((f) => (
        <details key={f.id} className={`group border-b ${border} [&_summary::-webkit-details-marker]:hidden`}>
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left">
            <h3 className="font-display text-[clamp(1.3rem,1.1rem+0.8vw,1.75rem)] font-normal leading-snug">{f.question}</h3>
            <span
              aria-hidden
              className="relative mt-2 h-4 w-4 shrink-0 before:absolute before:left-0 before:top-1/2 before:h-px before:w-4 before:bg-current after:absolute after:left-1/2 after:top-0 after:h-4 after:w-px after:bg-current after:transition-transform after:duration-500 group-open:after:scale-y-0"
            />
          </summary>
          <p className="muted max-w-3xl pb-7 pr-10">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
