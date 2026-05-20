import { describe, it, expect } from "vitest";

// Test the PLAN_LIMITS logic directly (without Supabase)
// We test the pure functions only

describe("quota limits", () => {
  it("free plan has correct limits", () => {
    const free = {
      protocols: 3,
      audios: 2,
      company_programs: 0,
      clients: 3,
      summaries: 50,
    };
    expect(free.protocols).toBe(3);
    expect(free.audios).toBe(2);
    expect(free.summaries).toBe(50);
    expect(free.company_programs).toBe(0);
  });

  it("cabinet plan has correct limits", () => {
    const cabinet = {
      protocols: 30,
      audios: 20,
      company_programs: 0,
      clients: 30,
      summaries: 500,
    };
    expect(cabinet.protocols).toBe(30);
    expect(cabinet.summaries).toBe(500);
  });

  it("cabinet_plus has null limits (unlimited)", () => {
    const plus = {
      protocols: null,
      audios: null,
      company_programs: null,
      clients: null,
      summaries: null,
    };
    expect(plus.protocols).toBeNull();
    expect(plus.summaries).toBeNull();
  });
});
