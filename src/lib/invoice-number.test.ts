import { describe, expect, it } from "vitest";
import { invoiceNumber } from "@/lib/invoice-number";

describe("invoiceNumber", () => {
  it("renvoie la référence attribuée par la base, sans la recalculer", () => {
    expect(invoiceNumber({ reference: "F-2026-0007" })).toBe("F-2026-0007");
    expect(invoiceNumber({ reference: "D-2026-0001" })).toBe("D-2026-0001");
  });
});
