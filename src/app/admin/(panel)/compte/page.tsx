import { Card, CardHeader, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { PasswordForm } from "./password-form";

export const metadata = { title: "Mon compte" };

export default async function AccountPage() {
  const me = await requireUser();
  return (
    <>
      <PageHeader title="Mon compte" description={`${me.name} · ${me.email} · ${me.role === "owner" ? "Propriétaire" : "Éditeur / éditrice"}`} />
      <Card className="max-w-xl">
        <CardHeader title="Changer de mot de passe" />
        <PasswordForm />
      </Card>
    </>
  );
}
