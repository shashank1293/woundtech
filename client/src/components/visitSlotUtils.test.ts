import { describe, expect, it } from "vitest";

import {
  formatTimeLabel,
  getBookedSlotsForClinicianDate,
  getDefaultVisitTime,
  TIME_OPTIONS,
} from "./visitSlotUtils";

describe("visitSlotUtils", () => {
  it("builds a full day of 15-minute slots", () => {
    expect(TIME_OPTIONS).toHaveLength(96);
    expect(TIME_OPTIONS[0]).toBe("00:00");
    expect(TIME_OPTIONS[1]).toBe("00:15");
    expect(TIME_OPTIONS[95]).toBe("23:45");
  });

  it("rounds the default time up to the next 15-minute slot", () => {
    expect(getDefaultVisitTime(new Date("2026-03-03T09:07:00"))).toBe("09:15");
    expect(getDefaultVisitTime(new Date("2026-03-03T09:45:00"))).toBe("09:45");
  });

  it("formats slot labels for display", () => {
    expect(formatTimeLabel("00:00")).toBe("12:00 AM");
    expect(formatTimeLabel("12:15")).toBe("12:15 PM");
    expect(formatTimeLabel("15:30")).toBe("3:30 PM");
  });

  it("returns booked slots only for the selected clinician and date", () => {
    const nineAmLocal = new Date("2026-03-03T09:00:00");
    const nextDayNineFifteenLocal = new Date("2026-03-04T09:15:00");
    const otherClinicianLocal = new Date("2026-03-03T09:30:00");

    const bookedSlots = getBookedSlotsForClinicianDate(
      [
        {
          id: 1,
          clinicianId: 7,
          patientId: 2,
          visitedAt: nineAmLocal.toISOString(),
          notes: null,
          createdAt: "2026-03-03T08:00:00.000Z",
          clinician: { id: 7, name: "Dr. Shaw" },
          patient: { id: 2, name: "Mia" },
        },
        {
          id: 2,
          clinicianId: 7,
          patientId: 3,
          visitedAt: nextDayNineFifteenLocal.toISOString(),
          notes: null,
          createdAt: "2026-03-03T08:05:00.000Z",
          clinician: { id: 7, name: "Dr. Shaw" },
          patient: { id: 3, name: "Jules" },
        },
        {
          id: 3,
          clinicianId: 8,
          patientId: 4,
          visitedAt: otherClinicianLocal.toISOString(),
          notes: null,
          createdAt: "2026-03-03T08:10:00.000Z",
          clinician: { id: 8, name: "Dr. Kim" },
          patient: { id: 4, name: "Noa" },
        },
      ],
      "7",
      "2026-03-03",
    );

    expect(Array.from(bookedSlots)).toEqual(["09:00"]);
  });
});
