import { cva } from "class-variance-authority";

/** Variantes de boutons, utilisables côté serveur comme côté client. */
export const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[0.95rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-or-profond disabled:pointer-events-none disabled:opacity-55 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-noir text-ivoire hover:bg-espresso",
        gold: "bg-champagne text-noir hover:bg-champagne-clair",
        outline: "border border-encre/15 bg-white text-encre hover:bg-ivoire",
        ghost: "text-encre hover:bg-encre/5",
        danger: "bg-[#9f3a2c] text-white hover:bg-[#86301f]",
        "danger-ghost": "text-[#9f3a2c] hover:bg-[#9f3a2c]/8",
      },
      size: { sm: "h-9 px-3 text-sm", md: "h-11 px-4", lg: "h-12 px-5 text-base", icon: "h-10 w-10" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
