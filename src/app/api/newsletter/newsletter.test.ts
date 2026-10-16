import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, unknown> & { id: string; email: string; status: string };
const db: { rows: Row[]; nextId: number } = { rows: [], nextId: 1 };
const sent: { to: string; subject: string; text: string }[] = [];
const events: { name: string; props: unknown }[] = [];
let sendOk = true;

/** Faux client Supabase minimal : uniquement les appels utilisés par les routes de la newsletter. */
function table() {
  type Filter = (r: Row) => boolean;
  const make = (op: "select" | "delete" | "update", patch?: Record<string, unknown>, head?: boolean) => {
    const filters: Filter[] = [];
    const run = () => {
      const hit = db.rows.filter((r) => filters.every((f) => f(r)));
      if (op === "delete") db.rows = db.rows.filter((r) => !hit.includes(r));
      if (op === "update") for (const r of hit) Object.assign(r, patch);
      return hit;
    };
    const builder: Record<string, unknown> = {
      eq: (k: string, v: unknown) => (filters.push((r) => r[k] === v), builder),
      lt: (k: string, v: string) => (filters.push((r) => typeof r[k] === "string" && (r[k] as string) < v), builder),
      gte: (k: string, v: string) => (filters.push((r) => typeof r[k] === "string" && (r[k] as string) >= v), builder),
      maybeSingle: async () => ({ data: run()[0] ?? null, error: null }),
      then: (resolve: (v: unknown) => void) => {
        const hit = run();
        resolve(head ? { count: hit.length, error: null } : { data: hit, error: null });
      },
    };
    return builder;
  };
  return {
    select: (_cols: string, opts?: { head?: boolean }) => make("select", undefined, opts?.head),
    delete: () => make("delete"),
    update: (patch: Record<string, unknown>) => make("update", patch),
    insert: async (row: Record<string, unknown>) => {
      if (db.rows.some((r) => r.email === row.email)) return { error: { code: "23505", message: "duplicate" } };
      db.rows.push({ id: `00000000-0000-4000-8000-${String(db.nextId++).padStart(12, "0")}`, ...row } as Row);
      return { error: null };
    },
  };
}

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: () => table() }) }));
vi.mock("@/lib/email", async (orig) => ({
  ...(await orig<typeof import("@/lib/email")>()),
  sendEmail: async (m: { to: string; subject: string; text: string }) => (sent.push(m), sendOk ? { ok: true } : { ok: false }),
}));
vi.mock("@/lib/analytics-server", () => ({ recordEvent: async (name: string, props: unknown) => void events.push({ name, props }) }));

import { GET as confirmGet, POST as confirmPost } from "@/app/api/newsletter/confirm/route";
import { POST as subscribe } from "@/app/api/newsletter/subscribe/route";
import { GET as unsubscribe } from "@/app/api/newsletter/unsubscribe/route";
import { newsletterUnsubscribeUrl } from "@/lib/email-templates";

const body = (b: unknown) => new Request("http://localhost/api/newsletter/subscribe", { method: "POST", body: JSON.stringify(b), headers: { "Content-Type": "application/json" } });
const valid = { email: "Marie@Exemple.FR ", consent: true, source: "blog:calculer-net-micro-entrepreneur" };
const tokenOf = () => sent.at(-1)?.text.match(/t=([a-f0-9]{64})/)?.[1] ?? "";
const confirmReq = (t: string) => new Request("http://localhost/api/newsletter/confirm", { method: "POST", body: new URLSearchParams({ t }) });

beforeEach(() => {
  db.rows = [];
  db.nextId = 1;
  sent.length = 0;
  events.length = 0;
  sendOk = true;
  vi.stubEnv("NEWSLETTER_ENABLED", "true");
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("EMAIL_FROM", "Compléo <contact@compleo.work>");
  vi.stubEnv("CRON_SECRET", "s3cret-s3cret-s3cret-s3cret-s3cret");
});
afterEach(() => vi.unstubAllEnvs());

describe("inscription à la newsletter", () => {
  it("désactivée tant que NEWSLETTER_ENABLED n'est pas true (503, rien en base)", async () => {
    vi.stubEnv("NEWSLETTER_ENABLED", "");
    expect((await subscribe(body(valid))).status).toBe(503);
    expect(db.rows).toHaveLength(0);
    expect(sent).toHaveLength(0);
  });

  it("refuse sans consentement côté serveur, avec une adresse invalide ou une origine inattendue", async () => {
    expect((await subscribe(body({ ...valid, consent: false }))).status).toBe(400);
    expect((await subscribe(body({ ...valid, consent: undefined }))).status).toBe(400);
    expect((await subscribe(body({ ...valid, email: "pas-un-email" }))).status).toBe(400);
    expect((await subscribe(body({ ...valid, source: "<script>" }))).status).toBe(400);
    expect(db.rows).toHaveLength(0);
  });

  it("crée une ligne en attente, normalise l'adresse, stocke la preuve de consentement et envoie un lien", async () => {
    const res = await subscribe(body(valid));
    expect(res.status).toBe(200);
    expect(db.rows).toHaveLength(1);
    const row = db.rows[0] ?? ({} as Row);
    expect(row).toMatchObject({ email: "marie@exemple.fr", status: "pending", source: "blog:calculer-net-micro-entrepreneur" });
    expect(typeof row.consent_version).toBe("string");
    expect(row.consent_at).toBeTruthy();
    expect(sent).toHaveLength(1);
    expect(sent[0]?.to).toBe("marie@exemple.fr");
    expect(sent[0]?.text).toMatch(/\/api\/newsletter\/confirm\?t=[a-f0-9]{64}/);
    // Le jeton n'est jamais stocké en clair.
    expect(JSON.stringify(row)).not.toContain(tokenOf());
  });

  it("champ piège rempli : réponse normale, aucune action", async () => {
    const res = await subscribe(body({ ...valid, website: "http://spam" }));
    expect(res.status).toBe(200);
    expect(db.rows).toHaveLength(0);
    expect(sent).toHaveLength(0);
  });

  it("ne révèle pas si l'adresse existe : même réponse, pas de nouvel e-mail avant le délai", async () => {
    const first = await (await subscribe(body(valid))).json();
    const second = await (await subscribe(body(valid))).json();
    expect(second).toEqual(first);
    expect(sent).toHaveLength(1);
    expect(db.rows).toHaveLength(1);
  });

  it("supprime la ligne et renvoie 502 si l'envoi échoue", async () => {
    sendOk = false;
    expect((await subscribe(body(valid))).status).toBe(502);
    expect(db.rows).toHaveLength(0);
  });

  it("plafond global par heure : 429", async () => {
    const recent = new Date().toISOString();
    for (let i = 0; i < 100; i++) db.rows.push({ id: String(i), email: `a${i}@x.fr`, status: "confirmed", confirmation_sent_at: recent });
    expect((await subscribe(body(valid))).status).toBe(429);
    expect(sent).toHaveLength(0);
  });
});

describe("confirmation (double opt-in)", () => {
  it("GET n'enregistre rien et affiche un bouton ; POST confirme et mesure l'article d'origine", async () => {
    await subscribe(body(valid));
    const t = tokenOf();
    const page = await confirmGet(new Request(`http://localhost/api/newsletter/confirm?t=${t}`));
    expect(page.status).toBe(200);
    expect(await page.text()).toContain('method="post"');
    expect(db.rows[0]?.status).toBe("pending");

    const res = await confirmPost(confirmReq(t));
    expect(res.status).toBe(200);
    expect(db.rows[0]).toMatchObject({ status: "confirmed", confirmation_token_hash: null });
    expect(db.rows[0]?.confirmed_at).toBeTruthy();
    expect(events).toEqual([{ name: "newsletter_confirmed", props: { source: "blog", article: "calculer-net-micro-entrepreneur" } }]);
  });

  it("jeton déjà utilisé, inconnu, mal formé ou expiré : 400", async () => {
    await subscribe(body(valid));
    const t = tokenOf();
    expect((await confirmPost(confirmReq(t))).status).toBe(200);
    expect((await confirmPost(confirmReq(t))).status).toBe(400);
    expect((await confirmPost(confirmReq("a".repeat(64)))).status).toBe(400);
    expect((await confirmPost(confirmReq("pas-un-jeton"))).status).toBe(400);
    expect((await confirmGet(new Request("http://localhost/api/newsletter/confirm?t=x"))).status).toBe(400);

    await subscribe(body({ ...valid, email: "autre@exemple.fr" }));
    const other = db.rows.find((r) => r.email === "autre@exemple.fr");
    if (other) other.confirmation_sent_at = new Date(Date.now() - 49 * 3_600_000).toISOString();
    expect((await confirmPost(confirmReq(tokenOf()))).status).toBe(400);
  });

  it("une adresse confirmée ne reçoit plus de message d'inscription", async () => {
    await subscribe(body(valid));
    await confirmPost(confirmReq(tokenOf()));
    sent.length = 0;
    expect((await subscribe(body(valid))).status).toBe(200);
    expect(sent).toHaveLength(0);
  });
});

describe("désinscription", () => {
  it("lien signé valide : statut désinscrit ; lien falsifié ou sans secret : 400", async () => {
    await subscribe(body(valid));
    await confirmPost(confirmReq(tokenOf()));
    const id = db.rows[0]?.id ?? "";

    const bad = new URL(newsletterUnsubscribeUrl(id));
    bad.searchParams.set("t", "0".repeat(64));
    expect((await unsubscribe(new Request(bad))).status).toBe(400);
    expect(db.rows[0]?.status).toBe("confirmed");

    expect((await unsubscribe(new Request(newsletterUnsubscribeUrl(id)))).status).toBe(200);
    expect(db.rows[0]).toMatchObject({ status: "unsubscribed" });
    expect(db.rows[0]?.unsubscribed_at).toBeTruthy();

    vi.stubEnv("CRON_SECRET", "");
    vi.stubEnv("EMAIL_UNSUBSCRIBE_SECRET", "");
    expect((await unsubscribe(new Request(newsletterUnsubscribeUrl(id)))).status).toBe(400);
  });

  it("le jeton d'un abonné ne vaut pas pour un autre, ni pour la désinscription des e-mails de compte", async () => {
    const { newsletterUnsubscribeToken, unsubscribeToken } = await import("@/lib/email");
    const a = "11111111-1111-4111-8111-111111111111";
    expect(newsletterUnsubscribeToken(a)).not.toBe(newsletterUnsubscribeToken("22222222-2222-4222-8222-222222222222"));
    expect(newsletterUnsubscribeToken(a)).not.toBe(unsubscribeToken(a));
  });

  it("se réinscrire après une désinscription repasse en attente et redemande la confirmation", async () => {
    await subscribe(body(valid));
    await confirmPost(confirmReq(tokenOf()));
    await unsubscribe(new Request(newsletterUnsubscribeUrl(db.rows[0]?.id ?? "")));
    sent.length = 0;
    expect((await subscribe(body(valid))).status).toBe(200);
    expect(db.rows[0]).toMatchObject({ status: "pending", unsubscribed_at: null, confirmed_at: null });
    expect(sent).toHaveLength(1);
  });
});
