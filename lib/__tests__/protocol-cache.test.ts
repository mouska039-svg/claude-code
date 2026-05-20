import { describe, it, expect } from "vitest";
import { buildCacheKey } from "@/lib/protocol-cache";

describe("buildCacheKey", () => {
  it("returns consistent MD5 for same inputs", () => {
    const key1 = buildCacheKey("naturopathe", "fatigue chronique", 8);
    const key2 = buildCacheKey("naturopathe", "fatigue chronique", 8);
    expect(key1).toBe(key2);
  });

  it("returns different keys for different specialties", () => {
    const key1 = buildCacheKey("naturopathe", "fatigue chronique", 8);
    const key2 = buildCacheKey("sophrologue", "fatigue chronique", 8);
    expect(key1).not.toBe(key2);
  });

  it("normalizes whitespace in context", () => {
    const key1 = buildCacheKey("naturopathe", "fatigue  chronique", 8);
    const key2 = buildCacheKey("naturopathe", "fatigue chronique", 8);
    expect(key1).toBe(key2);
  });

  it("is case-insensitive", () => {
    const key1 = buildCacheKey("Naturopathe", "Fatigue Chronique", 8);
    const key2 = buildCacheKey("naturopathe", "fatigue chronique", 8);
    expect(key1).toBe(key2);
  });

  it("returns a 32-char hex string", () => {
    const key = buildCacheKey("naturopathe", "test", 4);
    expect(key).toMatch(/^[a-f0-9]{32}$/);
  });
});
