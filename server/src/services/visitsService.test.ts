import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../middleware/errorHandler";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    clinician: {
      findUnique: vi.fn(),
    },
    patient: {
      findUnique: vi.fn(),
    },
    visit: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("../db/prisma", () => ({
  prisma: mockPrisma,
}));

import { visitsService } from "./visitsService";

describe("visitsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists visits in reverse chronological order with relations", async () => {
    mockPrisma.visit.findMany.mockResolvedValue([{ id: 1 }]);

    const result = await visitsService.listVisits({
      clinicianId: 1,
      patientId: 2,
    });

    expect(mockPrisma.visit.findMany).toHaveBeenCalledWith({
      where: {
        clinicianId: 1,
        patientId: 2,
      },
      orderBy: {
        visitedAt: "desc",
      },
      include: {
        clinician: {
          select: {
            id: true,
            name: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    expect(result).toEqual([{ id: 1 }]);
  });

  it("throws when the clinician does not exist", async () => {
    mockPrisma.clinician.findUnique.mockResolvedValue(null);
    mockPrisma.patient.findUnique.mockResolvedValue({ id: 4, name: "Pat Doe" });

    await expect(
      visitsService.createVisit({
        clinicianId: 1,
        patientId: 4,
        visitedAt: new Date("2026-03-03T09:00:00.000Z"),
      }),
    ).rejects.toMatchObject({
      message: "Clinician not found",
      statusCode: 404,
    });
  });

  it("throws when the patient does not exist", async () => {
    mockPrisma.clinician.findUnique.mockResolvedValue({ id: 1, name: "Dr. Stone" });
    mockPrisma.patient.findUnique.mockResolvedValue(null);

    await expect(
      visitsService.createVisit({
        clinicianId: 1,
        patientId: 4,
        visitedAt: new Date("2026-03-03T09:00:00.000Z"),
      }),
    ).rejects.toMatchObject({
      message: "Patient not found",
      statusCode: 404,
    });
  });

  it("throws a conflict when Prisma reports a duplicate clinician/time slot", async () => {
    mockPrisma.clinician.findUnique.mockResolvedValue({ id: 1, name: "Dr. Stone" });
    mockPrisma.patient.findUnique.mockResolvedValue({ id: 4, name: "Pat Doe" });
    mockPrisma.visit.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "6.19.2",
      }),
    );

    await expect(
      visitsService.createVisit({
        clinicianId: 1,
        patientId: 4,
        visitedAt: new Date("2026-03-03T09:00:00.000Z"),
        notes: "Follow-up",
      }),
    ).rejects.toMatchObject({
      message: "This clinician already has a visit booked for that slot",
      statusCode: 409,
    });
  });

  it("creates the visit when clinician, patient, and slot are valid", async () => {
    mockPrisma.clinician.findUnique.mockResolvedValue({ id: 1, name: "Dr. Stone" });
    mockPrisma.patient.findUnique.mockResolvedValue({ id: 4, name: "Pat Doe" });
    mockPrisma.visit.create.mockResolvedValue({ id: 9 });

    const result = await visitsService.createVisit({
      clinicianId: 1,
      patientId: 4,
      visitedAt: new Date("2026-03-03T09:15:00.000Z"),
      notes: "Follow-up",
    });

    expect(mockPrisma.visit.create).toHaveBeenCalledOnce();
    expect(result).toEqual({ id: 9 });
  });

  it("rethrows unexpected Prisma errors", async () => {
    const unexpectedError = new Error("Database unavailable");

    mockPrisma.clinician.findUnique.mockResolvedValue({ id: 1, name: "Dr. Stone" });
    mockPrisma.patient.findUnique.mockResolvedValue({ id: 4, name: "Pat Doe" });
    mockPrisma.visit.create.mockRejectedValue(unexpectedError);

    await expect(
      visitsService.createVisit({
        clinicianId: 1,
        patientId: 4,
        visitedAt: new Date("2026-03-03T09:15:00.000Z"),
      }),
    ).rejects.toBe(unexpectedError);
  });
});
