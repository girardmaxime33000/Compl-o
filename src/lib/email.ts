import { createHmac, timingSafeEqual } from "node:crypto";

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  /** URL de désinscription en un clic (e-mails non transactionnels). */
  unsubscribeUrl?: string;
}

export const isEmailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

/** Envoi via l'API REST de Resend. Ne lève jamais : retourne { ok: false } en cas d'échec. */
export async function sendEmail(msg: EmailMessage): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return { ok: false, error: "E-mail non configuré." };

  const headers: Record<string, string> = {};
  if (msg.unsubscribeUrl) {
    headers["List-Unsubscribe"] = `<${msg.unsubscribeUrl}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [msg.to],
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        reply_to: msg.replyTo,
        headers,
        attachments: msg.attachments?.map((a) => ({ filename: a.filename, content: a.content.toString("base64") })),
      }),
    });
    if (!res.ok) {
      console.error("resend", res.status, await res.text().catch(() => ""));
      return { ok: false, error: "Envoi impossible." };
    }
    return { ok: true };
  } catch (e) {
    console.error("resend", e);
    return { ok: false, error: "Envoi impossible." };
  }
}

function unsubscribeSecret() {
  return process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.CRON_SECRET || "";
}

export function unsubscribeToken(userId: string): string {
  return createHmac("sha256", unsubscribeSecret()).update(`unsub:${userId}`).digest("hex");
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  if (!unsubscribeSecret()) return false;
  const a = Buffer.from(unsubscribeToken(userId));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
