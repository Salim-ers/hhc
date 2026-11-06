"use client";

import type React from "react";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/admin/actions-core";

/** Exécute une action serveur, affiche une notification claire et rafraîchit l'écran. */
export function useServerAction<A extends unknown[], T>(
  fn: (...args: A) => Promise<ActionResult<T>>,
  opts: { refresh?: boolean; onSuccess?: (r: ActionResult<T> & { ok: true }) => void } = {},
) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (...args: A) =>
    new Promise<ActionResult<T>>((resolve) => {
      start(async () => {
        let r: ActionResult<T>;
        try {
          r = await fn(...args);
        } catch (e) {
          r = { ok: false, error: e instanceof Error ? e.message : "Erreur réseau. Vérifiez votre connexion." };
        }
        if (r.ok) {
          toast.success(r.message);
          opts.onSuccess?.(r);
          if (opts.refresh !== false) router.refresh();
        } else toast.error(r.error);
        resolve(r);
      });
    });
  return [run, pending] as const;
}

/**
 * Gestionnaire de soumission : évite la remise à zéro automatique des formulaires par React
 * (les saisies restent en place en cas d'erreur) et transmet la valeur du bouton cliqué.
 */
export function submitWith(fn: (fd: FormData) => unknown) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const fd = new FormData(e.currentTarget, submitter && submitter.getAttribute("name") ? submitter : undefined);
    fn(fd);
  };
}
