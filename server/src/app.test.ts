import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  cliniciansServiceMock,
  patientsServiceMock,
  visitsServiceMock,
} = vi.hoisted(() => ({
  cliniciansServiceMock: {
    listClinicians: vi.fn(),
    createClinician: vi.fn(),
  },
  patientsServiceMock: {
    listPatients: vi.fn(),
    createPatient: vi.fn(),
  },
  visitsServiceMock: {
    listVisits: vi.fn(),
    createVisit: vi.fn(),
  },
}));

vi.mock("./services/cliniciansService", () => ({
  cliniciansService: cliniciansServiceMock,
}));

vi.mock("./services/patientsService", () => ({
  patientsService: patientsServiceMock,
}));

vi.mock("./services/visitsService", () => ({
  visitsService: visitsServiceMock,
}));

import { createApp } from "./app";

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe("createApp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers the expected top-level middleware and routes", () => {
    const app = createApp();
    const stack = app._router.stack;

    expect(stack.map((layer: any) => layer.name)).toEqual([
      "query",
      "expressInit",
      "corsMiddleware",
      "jsonParser",
      "bound dispatch",
      "router",
      "notFoundHandler",
      "errorHandler",
    ]);

    expect(stack[4]?.route?.path).toBe("/health");
  });

  it("mounts clinicians, patients, and visits routers under /api", () => {
    const app = createApp();
    const apiLayer = app._router.stack.find((layer: any) => layer.name === "router");
    const apiStack = apiLayer?.handle.stack ?? [];

    expect(apiStack).toHaveLength(3);
    expect(apiStack.map((layer: { regexp: RegExp }) => String(layer.regexp))).toEqual([
      "/^\\/clinicians\\/?(?=\\/|$)/i",
      "/^\\/patients\\/?(?=\\/|$)/i",
      "/^\\/visits\\/?(?=\\/|$)/i",
    ]);
  });

  it("invokes the health route handler", () => {
    const app = createApp();
    const response = createResponse();
    const healthLayer = app._router.stack.find((layer: any) => layer.route?.path === "/health");

    healthLayer?.route?.stack[0]?.handle({}, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ status: "ok" });
  });

  it("exposes not-found and error middleware behavior", () => {
    const app = createApp();
    const response = createResponse();
    const next = vi.fn();
    const notFoundLayer = app._router.stack.find((layer: any) => layer.name === "notFoundHandler");
    const errorLayer = app._router.stack.find((layer: any) => layer.name === "errorHandler");

    notFoundLayer?.handle({}, response, next);

    expect(next).toHaveBeenCalledOnce();

    const forwardedError = next.mock.calls[0]?.[0] as Error;

    errorLayer?.handle(forwardedError, {}, response, vi.fn());

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ message: "Route not found" });
  });
});
