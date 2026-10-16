import { describe, expect, it } from "vitest";
import { testimonialSchema } from "@/lib/testimonial";

const valid = { firstName: "Claire", city: "Lyon", body: "Mon annonce était prête en quelques minutes, c'est clair.", consent: true as const };

describe("testimonialSchema", () => {
  it("accepte un témoignage complet avec consentement", () => {
    expect(testimonialSchema.safeParse(valid).success).toBe(true);
  });
  it("la ville est facultative", () => {
    expect(testimonialSchema.safeParse({ ...valid, city: undefined }).success).toBe(true);
  });
  it("refuse sans consentement ou avec un consentement faux", () => {
    expect(testimonialSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(testimonialSchema.safeParse({ firstName: valid.firstName, body: valid.body }).success).toBe(false);
  });
  it("refuse un prénom vide, un texte trop court ou trop long", () => {
    expect(testimonialSchema.safeParse({ ...valid, firstName: "  " }).success).toBe(false);
    expect(testimonialSchema.safeParse({ ...valid, body: "Super" }).success).toBe(false);
    expect(testimonialSchema.safeParse({ ...valid, body: "x".repeat(501) }).success).toBe(false);
  });
});
