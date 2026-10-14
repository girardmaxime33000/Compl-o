import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  claimed: new Set<string>(),
  rpc: vi.fn(),
  updates: [] as { table: string; patch: unknown; filter: [string, unknown] }[],
  deleted: [] as string[],
  event: null as unknown,
  signatureValid: true,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      insert: async (row: { id: string }) => {
        if (state.claimed.has(row.id)) return { error: { code: "23505" } };
        state.claimed.add(row.id);
        return { error: null };
      },
      delete: () => ({
        eq: async (_c: string, id: string) => {
          state.claimed.delete(id);
          state.deleted.push(id);
          return { error: null };
        },
      }),
      update: (patch: unknown) => ({
        eq: async (col: string, val: unknown) => {
          state.updates.push({ table, patch, filter: [col, val] });
          return { error: null };
        },
      }),
    }),
    rpc: state.rpc,
  }),
}));
vi.mock("@/lib/stripe/server", () => ({
  getStripe: () => ({
    webhooks: {
      constructEvent: () => {
        if (!state.signatureValid) throw new Error("bad signature");
        return state.event;
      },
    },
  }),
}));
vi.mock("@/lib/analytics-server", () => ({ recordEvent: vi.fn() }));

import { POST } from "@/app/api/webhooks/stripe/route";
import { PACK_LISTING_CREDITS } from "@/lib/platforms";

const request = (signature: string | null = "t=1,v1=x") =>
  new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: signature ? { "stripe-signature": signature } : {},
    body: "{}",
  });

const packEvent = (id: string, paymentStatus = "paid") => ({
  id,
  type: "checkout.session.completed",
  data: {
    object: {
      mode: "payment",
      payment_status: paymentStatus,
      customer: "cus_1",
      client_reference_id: "user-1",
      metadata: { offer: "pack" },
    },
  },
});

beforeEach(() => {
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  state.claimed.clear();
  state.updates = [];
  state.deleted = [];
  state.signatureValid = true;
  state.rpc.mockReset();
  state.rpc.mockResolvedValue({ data: 4, error: null });
});

describe("POST /api/webhooks/stripe", () => {
  it("refuse une requête sans signature", async () => {
    const res = await POST(request(null));
    expect(res.status).toBe(400);
  });

  it("refuse une signature invalide sans toucher à la base", async () => {
    state.signatureValid = false;
    const res = await POST(request());
    expect(res.status).toBe(400);
    expect(state.claimed.size).toBe(0);
    expect(state.rpc).not.toHaveBeenCalled();
  });

  it("crédite le pack ponctuel une seule fois pour un même event.id (idempotence)", async () => {
    state.event = packEvent("evt_1");
    expect((await POST(request())).status).toBe(200);
    const second = await POST(request());
    expect(second.status).toBe(200);
    expect(await second.json()).toMatchObject({ duplicate: true });
    expect(state.rpc).toHaveBeenCalledTimes(1);
    expect(state.rpc).toHaveBeenCalledWith("grant_listing_credits", { p_user: "user-1", p_amount: PACK_LISTING_CREDITS });
  });

  it("ne crédite pas un paiement non confirmé", async () => {
    state.event = packEvent("evt_2", "unpaid");
    expect((await POST(request())).status).toBe(200);
    expect(state.rpc).not.toHaveBeenCalled();
  });

  it("libère l'événement et répond 500 si le traitement échoue, pour permettre le rejeu", async () => {
    state.rpc.mockResolvedValue({ data: null, error: new Error("db") });
    state.event = packEvent("evt_3");
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await POST(request())).status).toBe(500);
    expect(state.deleted).toContain("evt_3");
    state.rpc.mockResolvedValue({ data: 4, error: null });
    expect((await POST(request())).status).toBe(200);
    expect(state.rpc).toHaveBeenCalledTimes(2);
  });

  it("active l'abonnement annuel d'après les métadonnées de la session", async () => {
    state.event = {
      id: "evt_4",
      type: "checkout.session.completed",
      data: { object: { mode: "subscription", payment_status: "paid", customer: "cus_1", client_reference_id: "user-1", metadata: { offer: "annual" } } },
    };
    expect((await POST(request())).status).toBe(200);
    expect(state.updates).toHaveLength(1);
    expect(state.updates[0]).toMatchObject({
      table: "profiles",
      patch: { subscription_status: "active", subscription_plan: "annual", stripe_customer_id: "cus_1" },
      filter: ["id", "user-1"],
    });
  });

  it("remet le plan à null à la résiliation", async () => {
    state.event = { id: "evt_5", type: "customer.subscription.deleted", data: { object: { customer: "cus_1", items: { data: [] } } } };
    expect((await POST(request())).status).toBe(200);
    expect(state.updates[0]).toMatchObject({ patch: { subscription_status: "canceled", subscription_plan: null } });
  });
});
