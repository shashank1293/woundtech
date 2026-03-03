import { beforeEach, describe, expect, it, vi } from "vitest";

import { createClinician, getClinicians } from "./clinicians";
import { request } from "./http";
import { createPatient, getPatients } from "./patients";
import { createVisit, getVisits } from "./visits";

describe("api request layer", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("requests clinicians with the default API base URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, name: "Dr. Stone" }],
    });

    vi.stubGlobal("fetch", fetchMock);

    await getClinicians();

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3001/api/clinicians", {
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("posts payloads for create endpoints", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1 }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await createClinician({ name: "Dr. Stone" });
    await createPatient({ name: "Pat Doe", dateOfBirth: "1990-05-10" });
    await createVisit({
      clinicianId: 1,
      patientId: 2,
      visitedAt: "2026-03-03T09:15:00.000Z",
      notes: "Follow-up",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "http://localhost:3001/api/clinicians", {
      method: "POST",
      body: JSON.stringify({ name: "Dr. Stone" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(fetchMock).toHaveBeenNthCalledWith(2, "http://localhost:3001/api/patients", {
      method: "POST",
      body: JSON.stringify({ name: "Pat Doe", dateOfBirth: "1990-05-10" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(fetchMock).toHaveBeenNthCalledWith(3, "http://localhost:3001/api/visits", {
      method: "POST",
      body: JSON.stringify({
        clinicianId: 1,
        patientId: 2,
        visitedAt: "2026-03-03T09:15:00.000Z",
        notes: "Follow-up",
      }),
      headers: { "Content-Type": "application/json" },
    });
  });

  it("builds visit filter query strings", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    vi.stubGlobal("fetch", fetchMock);

    await getVisits({ clinicianId: 1, patientId: 2 });
    await getPatients();

    expect(fetchMock).toHaveBeenNthCalledWith(1, "http://localhost:3001/api/visits?clinicianId=1&patientId=2", {
      headers: { "Content-Type": "application/json" },
    });
    expect(fetchMock).toHaveBeenNthCalledWith(2, "http://localhost:3001/api/patients", {
      headers: { "Content-Type": "application/json" },
    });
  });

  it("surfaces API error messages and falls back when needed", async () => {
    const errorResponse = {
      ok: false,
      json: async () => ({ message: "Duplicate slot" }),
    };
    const fallbackErrorResponse = {
      ok: false,
      json: async () => {
        throw new Error("bad json");
      },
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errorResponse)
      .mockResolvedValueOnce(fallbackErrorResponse);

    vi.stubGlobal("fetch", fetchMock);

    await expect(request("/visits")).rejects.toThrow("Duplicate slot");
    await expect(request("/visits")).rejects.toThrow("Request failed");
  });
});
