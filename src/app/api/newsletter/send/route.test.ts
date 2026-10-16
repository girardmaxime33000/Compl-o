import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, unknown>;
const db: Record<string, Row[]> = { newsletter_subscribers: [], newsletter_campaigns: [], newsletter_deliveries: [] };
const batches: { to: string; subject: string; html: string; text: string; unsubscribeUrl?: string }[][] = [];
let batchOk = true;

/** Faux client Supabase minimal : uniquement les appels utilisés par la route d'envoi. */
function from(name: string) {
  let op: "select" | "upsert" | "delete" | "insert" = "select";
  let rows: Row[] = [];
  const filters: ((r: Row) => boolean)[] = [];
  let window: [number, number] | null = null;
  const run = () => {
    let hit = db[name]!.filter((r) => filters.every((f) => f(r)));
    if (op === "delete") db[name] = db[name]!.filter((r) => !hit.includes(r));
    if (window) hit = hit.slice(window[0], window[1] + 1);
    return hit;
  };
  const b: Record<string, unknown> = {
    select: () => b,
    eq: (k: string, v: unknown) => (filters.push((r) => r[k] === v), b),
    in: (k: string, vs: unknown[]) => (filters.push((r) => vs.includes(r[k])), b),
    order: () => b,
    range: (a: number, z: number) => ((window = [a, z]), b),
    delete: () => ((op = "delete"), b),
    upsert: (input: Row[]) => {
      op = "upsert";
      rows = input.filter((i) => !db[name]!.some((r) => r.campaign_id === i.campaign_id && r.subscriber_id === i.subscriber_id));
      db[name]!.push(...rows);
      return b;
    },
    insert: async (row: Row) => {
      if (db[name]!.some((r) => r.id === row.id)) return { error: { code: "23505", message: "dup" } };
      db[name]!.push(row);
      return { error: null };
    },
    maybeSingle: async () => ({ data: run()[0] ?? null, error: null }),
    then: (resolve: (v: unknown) => void) => resolve(op === "upsert" ? { data: rows, error: null } : { data: run(), error: null }),
  };
  return b;
}

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from }) }));
vi.mock("@/lib/email", async (orig) => ({
  ...(await orig<typeof import("@/lib/email")>()),
  sendEmailBatch: async (m: (typeof batches)[number]) => (batches.push(m), batchOk ? { ok: true } : { ok: false }),
}));

import { POST } from "@/app/api/newsletter/send/route";
import { BLOG_POSTS } from "@/lib/blog";
import { SEND_BATCH_SIZE } from "@/lib/newsletter-send";

const SECRET = "secret-de-test-assez-long-1234";
const slug = BLOG_POSTS[0]!.slug;
const valid = { campaignId: "2026-11-a", subject: "Nos derniers articles", posts: [slug], mode: "send" as const };
const call = (body: unknown, auth: string | null = `Bearer ${SECRET}`) =>
  POST(new Request("http://localhost/api/newsletter/send", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json", ...(auth ? { authorization: auth } : {}) } }));

const addSubscribers = (n: number, status = "confirmed", prefix = "s") => {
  for (let i = 0; i < n; i++) db.newsletter_subscribers!.push({ id: `00000000-0000-4000-8000-${prefix}${String(i).padStart(11, "0")}`, email: `${prefix}${i}@exemple.fr`, status });
};
const deliveredIds = () => db.newsletter_deliveries!.map((d) => d.subscriber_id as string);
const recipients = () => batches.flat().map((m) => m.to);

beforeEach(() => {
  for (const k of Object.keys(db)) db[k] = [];
  batches.length = 0;
  batchOk = true;
  BLOG_POSTS[0]!.reviewedOn = "2026-10-16"; // l'article d'essai est « relu » le temps du test
  vi.stubEnv("NEWSLETTER_SEND_SECRET", SECRET);
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("EMAIL_FROM", "Compléo <contact@compleo.work>");
  vi.stubEnv("CRON_SECRET", "cron-secret-assez-long-1234567890");
});
afterEach(() => {
  delete BLOG_POSTS[0]!.reviewedOn;
  vi.unstubAllEnvs();
});

describe("autorisation et validation", () => {
  it("refuse sans en-tête, avec un mauvais secret, ou si le secret n'est pas configuré (aucune lecture en base)", async () => {
    addSubscribers(1);
    expect((await call(valid, null)).status).toBe(401);
    expect((await call(valid, "Bearer autre")).status).toBe(401);
    vi.stubEnv("NEWSLETTER_SEND_SECRET", "");
    expect((await call(valid, "Bearer ")).status).toBe(401);
    vi.stubEnv("NEWSLETTER_SEND_SECRET", "court");
    expect((await call(valid, "Bearer court")).status).toBe(401);
    expect(batches).toHaveLength(0);
    expect(db.newsletter_campaigns).toHaveLength(0);
  });

  it("refuse une requête invalide, un article inconnu, en double ou non relu", async () => {
    expect((await call({ ...valid, posts: [] })).status).toBe(400);
    expect((await call({ ...valid, campaignId: "A B" })).status).toBe(400);
    expect((await call({ ...valid, posts: ["inconnu"] })).status).toBe(400);
    expect((await call({ ...valid, posts: [slug, slug] })).status).toBe(400);
    delete BLOG_POSTS[0]!.reviewedOn;
    const res = await call(valid);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("non relu");
    expect(batches).toHaveLength(0);
  });
});

describe("aperçu et test", () => {
  it("aperçu : compteurs et rendu, aucun envoi, aucune écriture", async () => {
    addSubscribers(3);
    addSubscribers(2, "pending", "p");
    addSubscribers(1, "unsubscribed", "u");
    const res = await call({ ...valid, mode: "preview" });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toMatchObject({ confirmedSubscribers: 3, alreadyDelivered: 0, remaining: 3, campaignExists: false });
    expect(data.html).toContain(BLOG_POSTS[0]!.title);
    expect(batches).toHaveLength(0);
    expect(db.newsletter_campaigns).toHaveLength(0);
    expect(db.newsletter_deliveries).toHaveLength(0);
  });

  it("test : un seul message préfixé [TEST] à l'adresse donnée, sans écriture en base", async () => {
    addSubscribers(3);
    expect((await call({ ...valid, mode: "test" })).status).toBe(400);
    const res = await call({ ...valid, mode: "test", to: "moi@exemple.fr" });
    expect(res.status).toBe(200);
    expect(batches).toHaveLength(1);
    expect(batches[0]).toHaveLength(1);
    expect(batches[0]![0]).toMatchObject({ to: "moi@exemple.fr", subject: "[TEST] Nos derniers articles" });
    expect(db.newsletter_campaigns).toHaveLength(0);
    expect(db.newsletter_deliveries).toHaveLength(0);
  });

  it("envoi et test refusés (503) sans e-mail configuré, l'aperçu reste possible", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    expect((await call(valid)).status).toBe(503);
    expect((await call({ ...valid, mode: "test", to: "a@b.fr" })).status).toBe(503);
    expect((await call({ ...valid, mode: "preview" })).status).toBe(200);
  });
});

describe("envoi par lots", () => {
  it("n'écrit qu'aux abonnés confirmés, par lots, chacun une seule fois, avec son lien de désinscription", async () => {
    addSubscribers(120);
    addSubscribers(5, "pending", "p");
    addSubscribers(5, "unsubscribed", "u");

    const first = await (await call(valid)).json();
    expect(first).toMatchObject({ sent: SEND_BATCH_SIZE, remaining: 70, done: false });
    const second = await (await call(valid)).json();
    expect(second).toMatchObject({ sent: SEND_BATCH_SIZE, remaining: 20 });
    const third = await (await call(valid)).json();
    expect(third).toMatchObject({ sent: 20, remaining: 0, done: true });
    expect(await (await call(valid)).json()).toMatchObject({ sent: 0, remaining: 0, done: true });

    const to = recipients();
    expect(to).toHaveLength(120);
    expect(new Set(to).size).toBe(120);
    expect(to.every((a) => a.startsWith("s"))).toBe(true);
    expect(deliveredIds()).toHaveLength(120);

    const sample = batches[0]![0]!;
    expect(sample.unsubscribeUrl).toMatch(/\/api\/newsletter\/unsubscribe\?s=[\w-]{36}&t=[a-f0-9]{64}/);
    expect(sample.html).toContain("Se désinscrire");
    expect(sample.text).toContain(sample.unsubscribeUrl!);
    // Chaque message a un lien de désinscription différent.
    expect(new Set(batches.flat().map((m) => m.unsubscribeUrl)).size).toBe(120);
  });

  it("une désinscription entre deux lots exclut la personne du lot suivant", async () => {
    addSubscribers(60);
    await call(valid);
    const next = db.newsletter_subscribers!.find((s) => !deliveredIds().includes(s.id as string))!;
    next.status = "unsubscribed";
    await call(valid);
    expect(recipients()).not.toContain(next.email);
    expect(recipients()).toHaveLength(59);
  });

  it("échec d'envoi : 502, réservations supprimées, la reprise renvoie tout le lot", async () => {
    addSubscribers(10);
    batchOk = false;
    const res = await call(valid);
    expect(res.status).toBe(502);
    expect(deliveredIds()).toHaveLength(0);
    batchOk = true;
    batches.length = 0;
    expect(await (await call(valid)).json()).toMatchObject({ sent: 10, remaining: 0, done: true });
    expect(deliveredIds()).toHaveLength(10);
  });

  it("destinataires déjà réservés par un autre appel : ignorés (pas de doublon)", async () => {
    addSubscribers(4);
    await call(valid); // crée la campagne et envoie aux 4
    addSubscribers(2, "confirmed", "n");
    db.newsletter_deliveries!.push({ campaign_id: valid.campaignId, subscriber_id: db.newsletter_subscribers!.at(-1)!.id });
    const res = await (await call(valid)).json();
    expect(res).toMatchObject({ sent: 1, remaining: 0 });
    expect(recipients().filter((a) => a === "n0@exemple.fr")).toHaveLength(1);
    expect(recipients().filter((a) => a === "n1@exemple.fr")).toHaveLength(0);
  });

  it("contenu figé : même identifiant avec un autre objet ou d'autres articles = 409", async () => {
    addSubscribers(2);
    expect((await call(valid)).status).toBe(200);
    expect((await call({ ...valid, subject: "Autre objet" })).status).toBe(409);
    expect((await call({ ...valid, intro: "Nouvelle introduction" })).status).toBe(409);
    expect(batches).toHaveLength(1);
  });
});
