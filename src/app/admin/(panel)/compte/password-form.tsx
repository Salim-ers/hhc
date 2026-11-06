"use client";

import { useRef } from "react";
import { Button, Field, Input } from "@/components/admin/ui";
import { submitWith, useServerAction } from "@/components/admin/use-action";
import { changePassword } from "@/app/admin/_actions/auth";

export function PasswordForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [save, saving] = useServerAction(changePassword, { onSuccess: () => ref.current?.reset() });
  return (
    <form ref={ref} onSubmit={submitWith((fd) => save(fd).then(() => undefined))} className="space-y-5 p-5 md:p-6">
      <Field label="Mot de passe actuel" htmlFor="current">
        <Input id="current" name="current" type="password" autoComplete="current-password" required />
      </Field>
      <Field label="Nouveau mot de passe" htmlFor="next" hint="12 caractères minimum, avec lettres et chiffres.">
        <Input id="next" name="next" type="password" autoComplete="new-password" required />
      </Field>
      <Field label="Confirmer le nouveau mot de passe" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      <Button type="submit" loading={saving}>
        Modifier le mot de passe
      </Button>
    </form>
  );
}
