import { describe, expect, test } from "bun:test";

import {
  formatGoogleRating,
  getDisplayableGoogleReviews,
} from "../src/data/googleReviews";

const valid = {
  checkedAt: "2026-10-14",
  profileUrl: "https://www.google.com/maps?cid=1",
  rating: 5,
  reviewCount: 2,
};

describe("getDisplayableGoogleReviews", () => {
  test("désactivé sans relevé", () => {
    expect(getDisplayableGoogleReviews(null)).toBeNull();
  });
  test("masqué sous le seuil d'avis", () => {
    expect(getDisplayableGoogleReviews(valid, 3)).toBeNull();
  });
  test("refuse une note hors plage", () => {
    expect(getDisplayableGoogleReviews({ ...valid, rating: 6 })).toBeNull();
    expect(getDisplayableGoogleReviews({ ...valid, rating: 0 })).toBeNull();
  });
  test("refuse un relevé sans lien ou sans date", () => {
    expect(
      getDisplayableGoogleReviews({ ...valid, profileUrl: "" })
    ).toBeNull();
    expect(getDisplayableGoogleReviews({ ...valid, checkedAt: "" })).toBeNull();
  });
  test("accepte un relevé valide", () => {
    expect(getDisplayableGoogleReviews(valid, 1)).toEqual(valid);
  });
});

describe("formatGoogleRating", () => {
  test("une décimale comme sur Google", () => {
    expect(formatGoogleRating(5)).toBe("5,0");
    expect(formatGoogleRating(4.8)).toBe("4,8");
  });
});
