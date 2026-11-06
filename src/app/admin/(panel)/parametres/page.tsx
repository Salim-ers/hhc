import { PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { SettingsForms } from "./forms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = await getSettings();
  return (
    <>
      <PageHeader title="Paramètres" description="Coordonnées, horaires, déplacements, réseaux sociaux, logo, mentions légales et modules du site. Chaque bloc s'enregistre et se publie séparément." />
      <SettingsForms settings={settings as unknown as Record<string, Record<string, unknown>>} isOwner={user.role === "owner"} />
    </>
  );
}
