import "server-only";

/**
 * Envoi d'e-mails via l'API Resend (https://resend.com).
 * Variables : RESEND_API_KEY, EMAIL_FROM (ex. « Hair Home Concept <rdv@hairhomeconcept.com> »).
 * Sans clé, l'envoi est simplement ignoré (et signalé dans les journaux).
 */
export async function sendEmail(opts: { to: string; subject: string; html: string; text: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] RESEND_API_KEY absent : notification non envoyée.");
    return { sent: false as const, reason: "not_configured" };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Hair Home Concept <onboarding@resend.dev>",
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      reply_to: opts.replyTo,
    }),
  });
  if (!res.ok) {
    console.error("[email] Échec Resend", res.status, await res.text().catch(() => ""));
    return { sent: false as const, reason: "error" };
  }
  return { sent: true as const };
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
