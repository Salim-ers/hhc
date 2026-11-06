"use client";

/**
 * Kit d'interface de l'administration — composants au style shadcn/ui (Radix + Tailwind),
 * déclinés dans l'identité Hair Home Concept : ivoire, encre, or profond, grandes zones tactiles.
 */
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Dialog from "@radix-ui/react-dialog";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import { Loader2, X } from "lucide-react";
import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button-variants";

export { buttonVariants };

/* ─────────────── Button ─────────────── */
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean; loading?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild, loading, children, disabled, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} {...props}>
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Loader2 className="animate-spin" aria-hidden />}
          {children}
        </>
      )}
    </Comp>
  );
});

/* ─────────────── Champs ─────────────── */
const fieldBase =
  "w-full rounded-lg border border-encre/15 bg-white px-3.5 text-[1rem] text-encre shadow-[0_1px_0_rgba(0,0,0,0.02)] outline-none transition-colors placeholder:text-taupe/60 focus:border-or-profond focus:ring-2 focus:ring-champagne/30 disabled:bg-ivoire";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return <input ref={ref} className={cn(fieldBase, "h-11", className)} {...p} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...p },
  ref,
) {
  return <textarea ref={ref} className={cn(fieldBase, "min-h-24 py-2.5 leading-relaxed", className)} {...p} />;
});

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...p }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        fieldBase,
        "h-11 cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22><path d=%22M1 1l5 5 5-5%22 stroke=%22%236f625a%22 fill=%22none%22 stroke-width=%221.5%22/></svg>')] bg-[position:right_0.9rem_center] bg-no-repeat pr-9",
        className,
      )}
      {...p}
    />
  );
});

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
  error,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  error?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-encre">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-[0.82rem] text-taupe">{hint}</p>}
      {error && <p className="text-[0.82rem] text-[#9f3a2c]">{error}</p>}
    </div>
  );
}

/** Interrupteur accessible, envoyé dans les formulaires sous la forme « on ». */
export function Switch({
  name,
  defaultChecked,
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
}: {
  name?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}) {
  const [inner, setInner] = useState(Boolean(defaultChecked));
  const value = checked ?? inner;
  const id = name ? `sw-${name}` : undefined;
  return (
    <div className="flex items-start gap-3">
      <SwitchPrimitive.Root
        id={id}
        checked={value}
        disabled={disabled}
        onCheckedChange={(v) => {
          setInner(v);
          onCheckedChange?.(v);
        }}
        className="relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer rounded-full bg-encre/15 transition-colors data-[state=checked]:bg-or-profond disabled:opacity-50"
      >
        <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[1.375rem]" />
      </SwitchPrimitive.Root>
      {name && <input type="hidden" name={name} value={value ? "on" : ""} />}
      {(label || description) && (
        <label htmlFor={id} className="cursor-pointer">
          {label && <span className="block text-[0.95rem] text-encre">{label}</span>}
          {description && <span className="block text-[0.82rem] text-taupe">{description}</span>}
        </label>
      )}
    </div>
  );
}

/* ─────────────── Surfaces ─────────────── */
export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-encre/10 bg-white shadow-[0_1px_2px_rgba(29,23,21,0.04)]", className)} {...p} />;
}

export function CardHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-encre/8 px-5 py-4 md:px-6">
      <div>
        <h2 className="font-display text-xl">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-taupe">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Badge({ tone = "neutral", children, className }: { tone?: "neutral" | "gold" | "green" | "red" | "dark" | "blue"; children: React.ReactNode; className?: string }) {
  const tones = {
    neutral: "bg-encre/6 text-encre/80",
    gold: "bg-champagne/25 text-[#6b5218]",
    green: "bg-[#e3efe4] text-[#2f6b3a]",
    red: "bg-[#f6e2de] text-[#9f3a2c]",
    dark: "bg-noir text-ivoire",
    blue: "bg-[#e3ebf4] text-[#2c5282]",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>{children}</span>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-taupe">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-encre/20 bg-white/60 px-6 py-14 text-center">
      <p className="font-display text-2xl">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-taupe">{text}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

/* ─────────────── Confirmation ─────────────── */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Supprimer",
  onConfirm,
  danger = true,
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  danger?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[90] bg-noir/50 backdrop-blur-[2px]" />
        <AlertDialog.Content className="fixed inset-x-4 bottom-4 z-[91] mx-auto max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2">
          <AlertDialog.Title className="font-display text-2xl">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-taupe">{description}</AlertDialog.Description>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <Button variant="outline">Annuler</Button>
            </AlertDialog.Cancel>
            <Button
              variant={danger ? "danger" : "primary"}
              loading={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onConfirm();
                } finally {
                  setBusy(false);
                  setOpen(false);
                }
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

/* ─────────────── Panneau latéral / modale ─────────────── */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-noir/45 backdrop-blur-[2px]" />
        <Dialog.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-[81] flex max-h-[92svh] flex-col rounded-t-3xl bg-lin shadow-2xl outline-none sm:inset-y-3 sm:left-auto sm:right-3 sm:max-h-none sm:rounded-2xl",
            wide ? "sm:w-[min(980px,calc(100vw-1.5rem))]" : "sm:w-[min(560px,calc(100vw-1.5rem))]",
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-encre/10 px-5 py-4">
            <div>
              <Dialog.Title className="font-display text-2xl">{title}</Dialog.Title>
              {description ? <Dialog.Description className="text-sm text-taupe">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Fermer">
                <X />
              </Button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
