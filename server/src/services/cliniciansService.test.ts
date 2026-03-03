import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    clinician: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("../db/prisma", () => ({
  prisma: mockPrisma,
}));

import { cliniciansService } from "./cliniciansService";

describe("cliniciansService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists clinicians ordered by name", async () => {
    mockPrisma.clinician.findMany.mockResolvedValue([{ id: 1, name: "Dr. Stone" }]);

    const result = await cliniciansService.listClinicians();

    expect(mockPrisma.clinician.findMany).toHaveBeenCalledWith({
      orderBy: {
        name: "asc",
      },
    });
    expect(result).toEqual([{ id: 1, name: "Dr. Stone" }]);
  });

  it("creates a clinician", async () => {
    mockPrisma.clinician.create.mockResolvedValue({ id: 1, name: "Dr. Stone" });

    const result = await cliniciansService.createClinician({ name: "Dr. Stone" });

    expect(mockPrisma.clinician.create).toHaveBeenCalledWith({
      data: { name: "Dr. Stone" },
    });
    expect(result).toEqual({ id: 1, name: "Dr. Stone" });
  });
});
