import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createVisitSchema, listVisitsQuerySchema } from "./visitsSchemas";

describe("createVisitSchema", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-03T08:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts a valid 15-minute slot", () => {
    const result = createVisitSchema.parse({
      clinicianId: "1",
      patientId: "2",
      visitedAt: "2026-03-03T09:15:00.000Z",
      notes: "Follow-up",
    });

    expect(result.clinicianId).toBe(1);
    expect(result.patientId).toBe(2);
    expect(result.notes).toBe("Follow-up");
  });

  it("rejects past timestamps", () => {
    expect(() =>
      createVisitSchema.parse({
        clinicianId: 1,
        patientId: 2,
        visitedAt: "2026-03-02T09:15:00.000Z",
      }),
    ).toThrow(/must not be in the past/);
  });

  it("rejects times outside 15-minute increments", () => {
    expect(() =>
      createVisitSchema.parse({
        clinicianId: 1,
        patientId: 2,
        visitedAt: "2026-03-03T09:07:00.000Z",
      }),
    ).toThrow(/15-minute increments/);
  });

  it("rejects timestamps with seconds", () => {
    expect(() =>
      createVisitSchema.parse({
        clinicianId: 1,
        patientId: 2,
        visitedAt: "2026-03-03T09:15:12.000Z",
      }),
    ).toThrow(/must not include seconds/);
  });
});

describe("listVisitsQuerySchema", () => {
  it("coerces valid ids from the query string", () => {
    const result = listVisitsQuerySchema.parse({
      clinicianId: "4",
      patientId: "6",
    });

    expect(result).toEqual({
      clinicianId: 4,
      patientId: 6,
    });
  });

  it("rejects non-positive ids", () => {
    expect(() => listVisitsQuerySchema.parse({ clinicianId: "0" })).toThrow(/greater than 0/);
  });
});
