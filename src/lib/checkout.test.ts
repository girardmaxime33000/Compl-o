import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isCheckoutActivated } from "@/lib/checkout";

const grants = (count: number) =>
  ({ from: () => ({ select: () => ({ gte: async () => ({ count }) }) }) }) as unknown as SupabaseClient;
const none = {} as SupabaseClient;

describe("isCheckoutActivated", () => {
  it("abonnement : actif seulement quand le plan du profil correspond à l'offre", async () => {
    expect(await isCheckoutActivated(none, { subscription_status: "active", subscription_plan: "annual" }, "annual")).toBe(true);
    expect(await isCheckoutActivated(none, { subscription_status: "active", subscription_plan: "annual" }, "monthly")).toBe(false);
    expect(await isCheckoutActivated(none, { subscription_status: "free", subscription_plan: null }, "monthly")).toBe(false);
  });

  it("pack : actif seulement si un lot de crédits a été accordé dans l'heure", async () => {
    const free = { subscription_status: "free", subscription_plan: null } as const;
    expect(await isCheckoutActivated(grants(1), free, "pack")).toBe(true);
    expect(await isCheckoutActivated(grants(0), free, "pack")).toBe(false);
  });
});
