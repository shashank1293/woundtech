import { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { visitsServiceMock } = vi.hoisted(() => ({
  visitsServiceMock: {
    listVisits: vi.fn(),
    createVisit: vi.fn(),
  },
}));

vi.mock("../services/visitsService", () => ({
  visitsService: visitsServiceMock,
}));

import { createVisit, listVisits } from "./visitsController";

function createResponse() {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };

  return response as unknown as Response;
}

describe("visitsController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses filters and returns visits with a 200 response", async () => {
    const request = {
      query: { clinicianId: "1", patientId: "2" },
    } as unknown as Request;
    const response = createResponse();
    const next = vi.fn();
    const visits = [{ id: 10 }];

    visitsServiceMock.listVisits.mockResolvedValue(visits);

    await listVisits(request, response, next);

    expect(visitsServiceMock.listVisits).toHaveBeenCalledWith({
      clinicianId: 1,
      patientId: 2,
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(visits);
    expect(next).not.toHaveBeenCalled();
  });

  it("creates a visit with a 201 response", async () => {
    const request = {
      body: {
        clinicianId: 1,
        patientId: 2,
        visitedAt: "2026-03-03T09:15:00.000Z",
        notes: "Follow-up",
      },
    } as Request;
    const response = createResponse();
    const next = vi.fn();
    const visit = { id: 10 };

    visitsServiceMock.createVisit.mockResolvedValue(visit);

    await createVisit(request, response, next);

    expect(visitsServiceMock.createVisit).toHaveBeenCalledWith({
      clinicianId: 1,
      patientId: 2,
      visitedAt: new Date("2026-03-03T09:15:00.000Z"),
      notes: "Follow-up",
    });
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(visit);
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards validation errors to next", async () => {
    const request = {
      body: {
        clinicianId: 1,
        patientId: 2,
        visitedAt: "2026-03-03T09:07:00.000Z",
      },
    } as Request;
    const response = createResponse();
    const next = vi.fn();

    await createVisit(request, response, next);

    expect(visitsServiceMock.createVisit).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });
});
