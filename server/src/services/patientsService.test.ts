import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    patient: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("../db/prisma", () => ({
  prisma: mockPrisma,
}));

import { patientsService } from "./patientsService";

describe("patientsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists patients ordered by name", async () => {
    mockPrisma.patient.findMany.mockResolvedValue([{ id: 2, name: "Pat Doe" }]);

    const result = await patientsService.listPatients();

    expect(mockPrisma.patient.findMany).toHaveBeenCalledWith({
      orderBy: {
        name: "asc",
      },
    });
    expect(result).toEqual([{ id: 2, name: "Pat Doe" }]);
  });

  it("creates a patient", async () => {
    const dateOfBirth = new Date("1990-05-10");
    mockPrisma.patient.create.mockResolvedValue({ id: 2, name: "Pat Doe" });

    const result = await patientsService.createPatient({ name: "Pat Doe", dateOfBirth });

    expect(mockPrisma.patient.create).toHaveBeenCalledWith({
      data: { name: "Pat Doe", dateOfBirth },
    });
    expect(result).toEqual({ id: 2, name: "Pat Doe" });
  });
});
