import { describe, expect, it } from "vitest";
import { ACTIVITIES } from "@/lib/activities";
import { activityPhoto, sitePhotoEntries, urbanPhoto } from "@/lib/site-images";
import { URBAN_ACTIVITIES } from "@/lib/urban-activities";

describe("photos du site (hors villes)", () => {
  it("chaque clé déclarée désigne un emplacement existant", () => {
    const activityIds = new Set(ACTIVITIES.map((a) => a.id));
    const urbanSlugs = new Set(URBAN_ACTIVITIES.map((a) => a.slug));
    for (const [key] of sitePhotoEntries()) {
      const [kind, id = ""] = key.split(":");
      if (kind === "activity") expect(activityIds.has(id), key).toBe(true);
      else if (kind === "urban") expect(urbanSlugs.has(id), key).toBe(true);
      else expect(key).toBe("hero:home");
    }
  });

  it("chaque photo déclarée est hotlinkée et créditée", () => {
    for (const [key, photo] of sitePhotoEntries()) {
      expect(photo.raw.startsWith("https://images.unsplash.com/"), key).toBe(true);
      expect(photo.author.length, key).toBeGreaterThan(0);
      expect(photo.authorUrl.startsWith("https://unsplash.com/"), key).toBe(true);
    }
  });

  it("emplacement sans photo : undefined (le composant utilise son repli)", () => {
    expect(activityPhoto("inexistante")).toBeUndefined();
    expect(urbanPhoto("inexistante")).toBeUndefined();
  });
});
