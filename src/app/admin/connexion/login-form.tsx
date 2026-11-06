"use client";

import { startTransition, useActionState } from "react";
import { Button, Field, Input } from "@/components/admin/ui";
import { login, type LoginState } from "../_actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="mt-8 space-y-5"
    >
      <Field label="E-mail" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      <Field label="Mot de passe" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      {state.error && (
        <p role="alert" className="rounded-lg bg-[#f6e2de] px-3.5 py-2.5 text-sm text-[#9f3a2c]">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" loading={pending}>
        Se connecter
      </Button>
      <p className="text-center text-sm text-taupe">Mot de passe oublié ? Demandez une réinitialisation à votre prestataire.</p>
    </form>
  );
}
