import { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { patientsServiceMock } = vi.hoisted(() => ({
  patientsServiceMock: {
    listPatients: vi.fn(),
    createPatient: vi.fn(),
  },
}));

vi.mock("../services/patientsService", () => ({
  patientsService: patientsServiceMock,
}));

import { createPatient, listPatients } from "./patientsController";

function createResponse() {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };

  return response as unknown as Response;
}

describe("patientsController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns patients with a 200 response", async () => {
    const response = createResponse();
    const next = vi.fn();
    const patients = [{ id: 1, name: "Pat Doe" }];

    patientsServiceMock.listPatients.mockResolvedValue(patients);

    await listPatients({} as Request, response, next);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(patients);
    expect(next).not.toHaveBeenCalled();
  });

  it("creates a patient with a 201 response", async () => {
    const request = {
      body: { name: "Pat Doe", dateOfBirth: "1990-05-10" },
    } as Request;
    const response = createResponse();
    const next = vi.fn();
    const patient = { id: 1, name: "Pat Doe" };

    patientsServiceMock.createPatient.mockResolvedValue(patient);

    await createPatient(request, response, next);

    expect(patientsServiceMock.createPatient).toHaveBeenCalledWith({
      name: "Pat Doe",
      dateOfBirth: new Date("1990-05-10"),
    });
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(patient);
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards service errors to next", async () => {
    const response = createResponse();
    const next = vi.fn();
    const error = new Error("Database unavailable");

    patientsServiceMock.listPatients.mockRejectedValue(error);

    await listPatients({} as Request, response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
