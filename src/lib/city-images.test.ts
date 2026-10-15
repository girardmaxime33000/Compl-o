import { describe, expect, it } from "vitest";
import { CITIES } from "@/lib/cities";
import { cityPhoto, unsplashSrc, UNSPLASH_URL, withUtm } from "@/lib/city-images";

describe("photos de villes (Unsplash)", () => {
  it("construit une URL hotlink du CDN Unsplash avec taille et format", () => {
    const src = unsplashSrc({ raw: "https://images.unsplash.com/photo-123?ixid=abc" }, 800);
    expect(src.startsWith("https://images.unsplash.com/photo-123?ixid=abc&w=800&q=70")).toBe(true);
    expect(unsplashSrc({ raw: "https://images.unsplash.com/photo-123" }, 400)).toContain("photo-123?w=400");
  });

  it("ajoute les paramètres UTM exigés sur les liens de crédit", () => {
    expect(withUtm("https://unsplash.com/@x")).toBe("https://unsplash.com/@x?utm_source=compleo&utm_medium=referral");
    expect(withUtm("https://unsplash.com/?a=1")).toContain("&utm_source=compleo");
    expect(UNSPLASH_URL).toContain("utm_medium=referral");
  });

  it("chaque photo déclarée a un auteur et une URL Unsplash", () => {
    for (const city of CITIES) {
      const photo = cityPhoto(city);
      if (!photo) continue;
      expect(photo.author.length).toBeGreaterThan(0);
      expect(photo.raw.startsWith("https://images.unsplash.com/")).toBe(true);
      expect(photo.authorUrl.startsWith("https://unsplash.com/")).toBe(true);
    }
  });
});
