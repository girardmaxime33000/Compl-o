const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Page HTML minimale (noindex) renvoyée par les liens des e-mails de la newsletter. `body` est du HTML de confiance. */
export function emailLinkPage(title: string, body: string, status = 200) {
  return new Response(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)} | Compléo</title></head><body style="font-family:Arial,sans-serif;max-width:480px;margin:48px auto;padding:0 16px;line-height:1.5">${body}</body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );
}

export const escapeHtml = esc;
