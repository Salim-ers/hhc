"use server";

import { eq } from "drizzle-orm";
import { assertUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { fail, logChange, ok, run, type ActionResult } from "@/lib/admin/actions-core";

const STATUSES = ["nouvelle", "a_contacter", "en_attente", "confirmee", "terminee", "annulee"] as const;
export type RequestStatus = (typeof STATUSES)[number];

export async function updateRequest(id: string, data: { status?: string; internalNote?: string }): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser();
    const patch: Partial<typeof schema.appointmentRequests.$inferInsert> = { updatedAt: new Date() };
    if (data.status) {
      if (!STATUSES.includes(data.status as RequestStatus)) return fail("Statut invalide.");
      patch.status = data.status as RequestStatus;
    }
    if (data.internalNote !== undefined) patch.internalNote = data.internalNote.slice(0, 4000) || null;
    const [row] = await getDb().update(schema.appointmentRequests).set(patch).where(eq(schema.appointmentRequests.id, id)).returning();
    if (!row) return fail("Demande introuvable.");
    if (data.status) await logChange(user, "update", "demande", id, `Demande de ${row.fullName} : statut « ${data.status.replace("_", " ")} »`);
    return ok(data.status ? "Statut mis à jour." : "Note enregistrée.");
  });
}

/** Suppression (droit à l'effacement RGPD) — réservée à la propriétaire. */
export async function deleteRequest(id: string): Promise<ActionResult> {
  return run(async () => {
    const user = await assertUser("owner");
    const [row] = await getDb().delete(schema.appointmentRequests).where(eq(schema.appointmentRequests.id, id)).returning();
    if (row) await logChange(user, "delete", "demande", id, `Demande de ${row.fullName} supprimée`);
    return ok("Demande supprimée définitivement.");
  });
}
