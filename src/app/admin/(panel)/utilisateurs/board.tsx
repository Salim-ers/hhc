"use client";

import { useState } from "react";
import { KeyRound, Plus } from "lucide-react";
import { Badge, Button, Card, Field, Input, Select, Sheet } from "@/components/admin/ui";
import { submitWith, useServerAction } from "@/components/admin/use-action";
import { createUser, resetUserPassword, setUserActive, setUserRole } from "@/app/admin/_actions/users";

type U = { id: string; name: string; email: string; role: "owner" | "editor"; active: boolean; lastLoginAt: string | null };

export function UsersBoard({ users, meId }: { users: U[]; meId: string }) {
  const [creating, setCreating] = useState(false);
  const [reset, setReset] = useState<U | null>(null);
  const [create, saving] = useServerAction(createUser, { onSuccess: () => setCreating(false) });
  const [active] = useServerAction(setUserActive);
  const [role] = useServerAction(setUserRole);
  const [doReset, resetting] = useServerAction(resetUserPassword, { onSuccess: () => setReset(null) });
  const [pwd, setPwd] = useState("");
  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button variant="gold" onClick={() => setCreating(true)}>
          <Plus /> Ajouter un compte
        </Button>
      </div>
      <Card>
        <ul className="divide-y divide-encre/8">
          {users.map((u) => (
            <li key={u.id} className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:px-6">
              <span className="min-w-0 flex-1">
                <span className="block font-medium">
                  {u.name} {u.id === meId && <span className="text-sm text-taupe">(vous)</span>}
                </span>
                <span className="block text-sm text-taupe">{u.email}</span>
                <span className="text-xs text-taupe">Dernière connexion : {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("fr-FR") : "jamais"}</span>
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {!u.active && <Badge tone="red">Désactivé</Badge>}
                <Select value={u.role} onChange={(e) => role(u.id, e.target.value as U["role"])} className="w-auto" aria-label="Rôle" disabled={u.id === meId}>
                  <option value="owner">Propriétaire</option>
                  <option value="editor">Éditeur / éditrice</option>
                </Select>
                <Button variant="outline" size="sm" onClick={() => setReset(u)}>
                  <KeyRound /> Mot de passe
                </Button>
                {u.id !== meId && (
                  <Button variant={u.active ? "danger-ghost" : "outline"} size="sm" onClick={() => active(u.id, !u.active)}>
                    {u.active ? "Désactiver" : "Réactiver"}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Sheet open={creating} onOpenChange={setCreating} title="Nouveau compte" description="Choisissez un mot de passe provisoire et transmettez-le en personne.">
        <form onSubmit={submitWith((fd) => create(fd).then(() => undefined))} className="space-y-5">
          <Field label="Prénom" htmlFor="name">
            <Input id="name" name="name" required />
          </Field>
          <Field label="E-mail" htmlFor="email">
            <Input id="email" name="email" type="email" required />
          </Field>
          <Field label="Rôle" htmlFor="role">
            <Select id="role" name="role" defaultValue="editor">
              <option value="editor">Éditeur / éditrice</option>
              <option value="owner">Propriétaire</option>
            </Select>
          </Field>
          <Field label="Mot de passe provisoire" htmlFor="password" hint="12 caractères minimum, avec lettres et chiffres.">
            <Input id="password" name="password" type="text" autoComplete="new-password" required />
          </Field>
          <Button type="submit" loading={saving} className="w-full">
            Créer le compte
          </Button>
        </form>
      </Sheet>
      <Sheet open={!!reset} onOpenChange={(v) => !v && setReset(null)} title={`Nouveau mot de passe — ${reset?.name ?? ""}`} description="Toutes les sessions ouvertes de ce compte seront fermées.">
        <div className="space-y-5">
          <Field label="Nouveau mot de passe" htmlFor="np" hint="12 caractères minimum, avec lettres et chiffres.">
            <Input id="np" value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="new-password" />
          </Field>
          <Button className="w-full" loading={resetting} onClick={() => reset && doReset(reset.id, pwd).then(() => setPwd(""))}>
            Réinitialiser
          </Button>
        </div>
      </Sheet>
    </>
  );
}
