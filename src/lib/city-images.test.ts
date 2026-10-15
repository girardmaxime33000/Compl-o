import { describe, expect, it } from "vitest";
import { CITIES } from "@/lib/cities";
import {
  bannerSrcSet, BANNER_RATIO, BANNER_WIDTHS, cityPhoto, cityPhotoEntries, photoSrcSet, PHOTO_RATIOS, unsplashSrc, UNSPLASH_URL, withUtm,
} from "@/lib/city-images";

describe("photos de villes (Unsplash)", () => {
  it("construit une URL hotlink du CDN Unsplash avec taille et format", () => {
    const src = unsplashSrc({ raw: "https://images.unsplash.com/photo-123?ixid=abc" }, 800);
    expect(src.startsWith("https://images.unsplash.com/photo-123?ixid=abc&w=800&q=65")).toBe(true);
    expect(unsplashSrc({ raw: "https://images.unsplash.com/photo-123" }, 400)).toContain("photo-123?w=400");
  });

  it("srcSet du bandeau : quatre largeurs recadrées au format du bandeau", () => {
    const set = bannerSrcSet({ raw: "https://images.unsplash.com/photo-123?ixid=abc" });
    expect(set.split(", ")).toHaveLength(4);
    expect(set).toContain("w=480&h=192");
    expect(set).toContain("w=1280&h=512");
    expect(set).toContain("fit=crop");
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

describe("photoSrcSet / ratios", () => {
  const raw = { raw: "https://images.unsplash.com/photo-123?ixid=abc" };

  it("recadre chaque largeur au ratio demandé", () => {
    const set = photoSrcSet(raw, PHOTO_RATIOS.tile);
    expect(set.split(", ")).toHaveLength(5);
    expect(set).toContain("w=320&h=320");
    expect(set).toContain("w=1280&h=1280");
    expect(photoSrcSet(raw, PHOTO_RATIOS.card, [720])).toContain("w=720&h=480");
  });

  it("le srcSet du bandeau reste celui de photoSrcSet au ratio bandeau", () => {
    expect(bannerSrcSet(raw)).toBe(photoSrcSet(raw, BANNER_RATIO, BANNER_WIDTHS));
  });

  it("cityPhotoEntries expose les photos déclarées", () => {
    for (const [slug, photo] of cityPhotoEntries()) {
      expect(slug.length).toBeGreaterThan(0);
      expect(photo.raw.startsWith("https://images.unsplash.com/")).toBe(true);
    }
  });
});
