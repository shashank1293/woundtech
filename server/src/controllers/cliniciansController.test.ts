import { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { cliniciansServiceMock } = vi.hoisted(() => ({
  cliniciansServiceMock: {
    listClinicians: vi.fn(),
    createClinician: vi.fn(),
  },
}));

vi.mock("../services/cliniciansService", () => ({
  cliniciansService: cliniciansServiceMock,
}));

import { createClinician, listClinicians } from "./cliniciansController";

function createResponse() {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };

  return response as unknown as Response;
}

describe("cliniciansController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns clinicians with a 200 response", async () => {
    const response = createResponse();
    const next = vi.fn();
    const clinicians = [{ id: 1, name: "Dr. Stone" }];

    cliniciansServiceMock.listClinicians.mockResolvedValue(clinicians);

    await listClinicians({} as Request, response, next);

    expect(cliniciansServiceMock.listClinicians).toHaveBeenCalledOnce();
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(clinicians);
    expect(next).not.toHaveBeenCalled();
  });

  it("creates a clinician with a 201 response", async () => {
    const request = { body: { name: "Dr. Stone" } } as Request;
    const response = createResponse();
    const next = vi.fn();
    const clinician = { id: 1, name: "Dr. Stone" };

    cliniciansServiceMock.createClinician.mockResolvedValue(clinician);

    await createClinician(request, response, next);

    expect(cliniciansServiceMock.createClinician).toHaveBeenCalledWith({ name: "Dr. Stone" });
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(clinician);
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards validation errors to next", async () => {
    const request = { body: { name: "" } } as Request;
    const response = createResponse();
    const next = vi.fn();

    await createClinician(request, response, next);

    expect(cliniciansServiceMock.createClinician).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });
});
