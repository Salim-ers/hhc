"use server";

import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { hashIp } from "@/lib/auth/session";
import { getPublicDb, hasDatabase, schema } from "@/lib/db";
import { getSettings } from "@/lib/data/public";
import { escapeHtml, sendEmail } from "./email";

export type RequestState =
  | { status: "idle" }
  | { status: "success"; firstName: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

const phoneRe = /^[+0-9 ().-]{8,20}$/;

const RequestSchema = z.object({
  fullName: z.string().trim().min(2, "Merci d'indiquer vos nom et prénom.").max(120),
  phone: z.string().trim().regex(phoneRe, "Numéro de téléphone invalide."),
  email: z.union([z.literal(""), z.string().trim().email("Adresse e-mail invalide.").max(160)]),
  commune: z.string().trim().min(2, "Indiquez la commune d'intervention.").max(80),
  service: z.string().trim().min(2, "Choisissez une prestation.").max(120),
  preferredDate: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide.")]),
  timeSlot: z.string().trim().max(60),
  message: z.string().trim().max(2000, "Message trop long (2000 caractères max)."),
  consent: z.literal("on", { message: "Votre accord est nécessaire pour traiter la demande." }),
  sourcePage: z.string().max(80).optional(),
});

/** Demande de rendez-vous : enregistrée en base (statut « Nouvelle »), notification e-mail à Angèle. */
export async function submitAppointmentRequest(_prev: RequestState, formData: FormData): Promise<RequestState> {
  // Pot de miel anti-robots : champ invisible, doit rester vide.
  if (String(formData.get("website") ?? "")) return { status: "success", firstName: "" };
  // Délai minimal de remplissage (les robots soumettent instantanément).
  const started = Number(formData.get("startedAt") ?? 0);
  if (started && Date.now() - started < 2500) return { status: "error", message: "Merci de vérifier le formulaire avant l'envoi." };

  const parsed = RequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { status: "error", message: "Certains champs sont à compléter.", fieldErrors };
  }
  const d = parsed.data;
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = hashIp(ip);
  const settings = await getSettings();

  if (!hasDatabase && !process.env.RESEND_API_KEY) {
    return {
      status: "error",
      message: `Version de démonstration : les demandes ne sont pas encore enregistrées. Appelez le ${settings.business.phone}.`,
    };
  }

  const id = randomUUID();
  if (hasDatabase) {
    const db = getPublicDb();
    const r = await db.execute(sql`select hhc_recent_request_count(${ipHash}, 60) as n`);
    if (Number((r.rows[0] as { n: number }).n) >= 5) {
      return { status: "error", message: `Trop de demandes en peu de temps. Vous pouvez appeler directement le ${settings.business.phone}.` };
    }
    await db.insert(schema.appointmentRequests).values({
      id,
      fullName: d.fullName,
      phone: d.phone,
      email: d.email || null,
      commune: d.commune,
      service: d.service,
      preferredDate: d.preferredDate || null,
      timeSlot: d.timeSlot || null,
      message: d.message || null,
      consentAt: new Date(),
      sourcePage: d.sourcePage ?? null,
      ipHash,
    });
  }

  const rows: [string, string][] = [
    ["Nom", d.fullName],
    ["Téléphone", d.phone],
    ["E-mail", d.email || "—"],
    ["Commune", d.commune],
    ["Prestation", d.service],
    ["Date souhaitée", d.preferredDate ? new Date(d.preferredDate).toLocaleDateString("fr-FR", { dateStyle: "full" }) : "—"],
    ["Créneau", d.timeSlot || "—"],
    ["Message", d.message || "—"],
  ];
  const adminUrl = `${(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")}/admin/demandes`;
  await sendEmail({
    to: settings.notifications.email,
    replyTo: d.email || undefined,
    subject: `Nouvelle demande de rendez-vous — ${d.fullName} (${d.commune})`,
    text: rows.map(([k, v]) => `${k} : ${v}`).join("\n") + `\n\nGérer la demande : ${adminUrl}`,
    html: `<div style="font-family:Georgia,serif;color:#1d1715;max-width:560px">
      <h2 style="font-weight:400;margin:0 0 16px">Nouvelle demande de rendez-vous</h2>
      <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:14px">
      ${rows.map(([k, v]) => `<tr><td style="padding:8px 12px 8px 0;color:#6f625a;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`).join("")}
      </table>
      <p style="font-family:Arial,sans-serif;font-size:14px;margin-top:20px"><a href="${adminUrl}" style="color:#8a6a22">Ouvrir dans l'administration</a></p>
    </div>`,
  }).then(async (res) => {
    if (res.sent && hasDatabase) {
      // Le rôle public ne peut pas modifier les demandes : marquage via la connexion serveur principale.
      const { getDb } = await import("@/lib/db");
      await getDb().execute(sql`update appointment_requests set email_notified = true where id = ${id}`);
    }
  });

  return { status: "success", firstName: d.fullName.split(/\s+/)[0] ?? "" };
}
