import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Boutons publics. Micro-interaction : un voile se déploie depuis la gauche au survol
 * (transform uniquement, donc fluide), le texte reste parfaitement lisible.
 */
const button = cva(
  "group/btn relative isolate inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden px-7 py-3 text-[0.95rem] font-normal tracking-[0.02em] transition-colors duration-500 ease-[var(--ease-luxe)] focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        gold: "bg-champagne text-noir hover:text-noir before:bg-champagne-clair",
        light: "border border-ivoire/40 text-ivoire hover:text-noir before:bg-ivoire",
        dark: "border border-encre/30 text-encre hover:text-ivoire before:bg-espresso",
        solid: "bg-noir text-ivoire hover:text-noir before:bg-champagne",
      },
      size: { md: "", lg: "min-h-14 px-9 text-base" },
    },
    defaultVariants: { variant: "gold", size: "md" },
  },
);

const veil =
  "before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:transition-transform before:duration-700 before:ease-[var(--ease-luxe)] hover:before:scale-x-100 focus-visible:before:scale-x-100";

type Variant = VariantProps<typeof button>;

export function LinkButton({
  href,
  children,
  className,
  variant,
  size,
  ...rest
}: Variant & { href: string; children: React.ReactNode; className?: string } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
  >) {
  const isExternal = /^(https?:|tel:|mailto:)/.test(href);
  const cls = cn(button({ variant, size }), veil, className);
  if (isExternal)
    return (
      <a href={href} className={cls} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
        {children}
      </a>
    );
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  children,
  className,
  variant,
  size,
  ...rest
}: Variant & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(button({ variant, size }), veil, className)} {...rest}>
      {children}
    </button>
  );
}
