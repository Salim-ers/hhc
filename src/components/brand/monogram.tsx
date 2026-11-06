import { MONOGRAM_PATH, MONOGRAM_VIEWBOX, TAGLINE_PATH, TAGLINE_VIEWBOX, WORDMARK_PATH, WORDMARK_VIEWBOX } from "./paths";

type Props = React.SVGProps<SVGSVGElement> & { title?: string };

/** Monogramme HHC officiel (vectorisé). Couleur héritée via `currentColor`. */
export function Monogram({ title = "Hair Home Concept", ...props }: Props) {
  return (
    <svg viewBox={MONOGRAM_VIEWBOX} role="img" aria-label={title} {...props}>
      <path d={MONOGRAM_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

export function Wordmark({ title = "Hair Home Concept", ...props }: Props) {
  return (
    <svg viewBox={WORDMARK_VIEWBOX} role="img" aria-label={title} {...props}>
      <path d={WORDMARK_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

export function Tagline({ title = "La coiffure autrement…", ...props }: Props) {
  return (
    <svg viewBox={TAGLINE_VIEWBOX} role="img" aria-label={title} {...props}>
      <path d={TAGLINE_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

/** Logo horizontal compact pour l'en-tête : monogramme + nom. */
export function LogoInline({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <Monogram className="h-7 w-auto text-or-logo md:h-8" title="" aria-hidden />
      <Wordmark
        className={`h-[0.95rem] w-auto md:h-[1.05rem] ${tone === "light" ? "text-ivoire" : "text-espresso"}`}
        title="Hair Home Concept"
      />
    </span>
  );
}
