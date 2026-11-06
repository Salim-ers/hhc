import type { Metadata } from "next";
import { count, eq } from "drizzle-orm";
import { AdminShell } from "@/components/admin/shell";
import { requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Administration" },
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [{ n }] = await getDb()
    .select({ n: count() })
    .from(schema.appointmentRequests)
    .where(eq(schema.appointmentRequests.status, "nouvelle"));
  return (
    <AdminShell user={user} newRequests={n}>
      {children}
    </AdminShell>
  );
}
