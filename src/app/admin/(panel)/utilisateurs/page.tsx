import { asc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { UsersBoard } from "./board";

export const dynamic = "force-dynamic";
export const metadata = { title: "Utilisateurs" };

export default async function UsersPage() {
  const me = await requireUser("owner");
  const users = await getDb()
    .select({ id: schema.users.id, name: schema.users.name, email: schema.users.email, role: schema.users.role, active: schema.users.active, lastLoginAt: schema.users.lastLoginAt })
    .from(schema.users)
    .orderBy(asc(schema.users.createdAt));
  return (
    <>
      <PageHeader title="Utilisateurs" description="Propriétaire : accès complet. Éditrice / éditeur : contenus, prix et demandes, sans les réglages sensibles (mentions légales, modules, comptes)." />
      <UsersBoard users={users.map((u) => ({ ...u, lastLoginAt: u.lastLoginAt?.toISOString() ?? null }))} meId={me.id} />
    </>
  );
}
