import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Boutons publics en forme de pilule. Micro-interaction : au survol, une couleur monte depuis
 * le bas comme un liquide (transform uniquement, donc fluide) et la flèche s'envole.
 */
const button = cva(
  "group/btn relative isolate inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden rounded-full px-7 py-3 text-[0.95rem] font-normal tracking-[0.01em] transition-[color,border-color,transform] duration-500 ease-[var(--ease-luxe)] active:scale-[0.97] focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        gold: "bg-champagne text-noir before:bg-champagne-clair",
        light: "border border-ivoire/35 text-ivoire hover:border-ivoire hover:text-noir before:bg-ivoire",
        dark: "border border-encre/25 text-encre hover:border-espresso hover:text-ivoire before:bg-espresso",
        solid: "bg-noir text-ivoire hover:text-noir before:bg-champagne",
      },
      size: { md: "", lg: "min-h-14 px-8 text-base" },
    },
    defaultVariants: { variant: "gold", size: "md" },
  },
);

const fill =
  "before:absolute before:inset-0 before:-z-10 before:translate-y-[101%] before:rounded-[inherit] before:transition-transform before:duration-700 before:ease-[var(--ease-luxe)] hover:before:translate-y-0 focus-visible:before:translate-y-0";

type Variant = VariantProps<typeof button>;

function Arrow() {
  return (
    <span aria-hidden className="relative -mr-2 flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-current/10">
      <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-luxe)] group-hover/btn:-translate-y-6 group-hover/btn:translate-x-6" />
      <ArrowUpRight className="absolute h-4 w-4 -translate-x-6 translate-y-6 transition-transform duration-500 ease-[var(--ease-luxe)] group-hover/btn:translate-x-0 group-hover/btn:translate-y-0" />
    </span>
  );
}

export function LinkButton({
  href,
  children,
  className,
  variant,
  size,
  arrow = false,
  ...rest
}: Variant & { href: string; children: React.ReactNode; className?: string; arrow?: boolean } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
  >) {
  const isExternal = /^(https?:|tel:|mailto:)/.test(href);
  const cls = cn(button({ variant, size }), fill, className);
  const content = (
    <>
      {children}
      {arrow && <Arrow />}
    </>
  );
  if (isExternal)
    return (
      <a href={href} className={cls} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
        {content}
      </a>
    );
  return (
    <Link href={href} className={cls} {...rest}>
      {content}
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
    <button className={cn(button({ variant, size }), fill, className)} {...rest}>
      {children}
    </button>
  );
}
