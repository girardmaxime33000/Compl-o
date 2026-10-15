import { describe, expect, it } from "vitest";
import { ALLOWED_PROPS, CLIENT_EVENTS, sanitizeProps } from "@/lib/analytics";

describe("mesure : événements et propriétés", () => {
  it("expose les événements d'entonnoir du parcours d'accueil", () => {
    expect(CLIENT_EVENTS).toContain("home_view");
    expect(CLIENT_EVENTS).toContain("cta_click");
  });

  it("conserve source, target et visual, et rejette tout le reste", () => {
    expect(sanitizeProps({ source: "hero", target: "diagnostic", visual: "photo", email: "a@b.fr", ip: "1.2.3.4" })).toEqual({
      source: "hero",
      target: "diagnostic",
      visual: "photo",
    });
    expect([...ALLOWED_PROPS]).not.toContain("email");
  });

  it("rejette les valeurs longues ou contenant des caractères inattendus", () => {
    expect(sanitizeProps({ source: "x".repeat(51) })).toEqual({});
    expect(sanitizeProps({ source: "a@b.fr" })).toEqual({});
    expect(sanitizeProps({ target: 3 })).toEqual({});
    expect(sanitizeProps(null)).toEqual({});
  });
});
