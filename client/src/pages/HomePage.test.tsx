// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  cliniciansApiMocks,
  patientsApiMocks,
  visitsApiMocks,
} = vi.hoisted(() => ({
  cliniciansApiMocks: {
    getClinicians: vi.fn(),
    createClinician: vi.fn(),
  },
  patientsApiMocks: {
    getPatients: vi.fn(),
    createPatient: vi.fn(),
  },
  visitsApiMocks: {
    getVisits: vi.fn(),
    createVisit: vi.fn(),
  },
}));

vi.mock("../api/clinicians", () => cliniciansApiMocks);
vi.mock("../api/patients", () => patientsApiMocks);
vi.mock("../api/visits", () => visitsApiMocks);

import { HomePage } from "./HomePage";

function renderHomePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <HomePage />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("HomePage", () => {
  it("renders clinicians, patients, and visits from the query layer", async () => {
    cliniciansApiMocks.getClinicians.mockResolvedValue([
      { id: 1, name: "Dr. Stone", createdAt: "2026-03-03T08:00:00.000Z" },
    ]);
    patientsApiMocks.getPatients.mockResolvedValue([
      { id: 2, name: "Pat Doe", dateOfBirth: null, createdAt: "2026-03-03T08:00:00.000Z" },
    ]);
    visitsApiMocks.getVisits.mockResolvedValue([
      {
        id: 9,
        clinicianId: 1,
        patientId: 2,
        visitedAt: "2026-03-03T09:00:00.000Z",
        notes: "Initial consult",
        createdAt: "2026-03-03T08:30:00.000Z",
        clinician: { id: 1, name: "Dr. Stone" },
        patient: { id: 2, name: "Pat Doe" },
      },
    ]);

    renderHomePage();

    expect(await screen.findByText("Initial consult")).toBeTruthy();
    expect(screen.getAllByText("Dr. Stone").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pat Doe").length).toBeGreaterThan(0);

    expect(visitsApiMocks.getVisits).toHaveBeenCalledWith({
      clinicianId: undefined,
      patientId: undefined,
    });
    expect(visitsApiMocks.getVisits).toHaveBeenCalledWith({});
  });

  it("creates a visit and refetches the visit queries", async () => {
    const user = userEvent.setup();
    let visits = [] as Array<{
      id: number;
      clinicianId: number;
      patientId: number;
      visitedAt: string;
      notes: string | null;
      createdAt: string;
      clinician: { id: number; name: string };
      patient: { id: number; name: string };
    }>;

    cliniciansApiMocks.getClinicians.mockResolvedValue([
      { id: 1, name: "Dr. Stone", createdAt: "2026-03-03T08:00:00.000Z" },
    ]);
    patientsApiMocks.getPatients.mockResolvedValue([
      { id: 2, name: "Pat Doe", dateOfBirth: null, createdAt: "2026-03-03T08:00:00.000Z" },
    ]);
    visitsApiMocks.getVisits.mockImplementation(async () => visits);
    visitsApiMocks.createVisit.mockImplementation(async (payload) => {
      const createdVisit = {
        id: 10,
        clinicianId: payload.clinicianId,
        patientId: payload.patientId,
        visitedAt: payload.visitedAt,
        notes: payload.notes ?? null,
        createdAt: "2026-03-03T08:45:00.000Z",
        clinician: { id: 1, name: "Dr. Stone" },
        patient: { id: 2, name: "Pat Doe" },
      };

      visits = [createdVisit];
      return createdVisit;
    });

    renderHomePage();

    await waitFor(() => {
      expect(screen.getAllByText("Dr. Stone").length).toBeGreaterThan(0);
    });

    const createVisitSection = screen.getByText("Create Visit").closest("section");

    if (!createVisitSection) {
      throw new Error("Create Visit section not found");
    }

    const createVisitScope = within(createVisitSection);
    const [clinicianSelect, patientSelect] = createVisitScope.getAllByRole("combobox");
    const visitDateInput = createVisitScope.getByDisplayValue(/\d{4}-\d{2}-\d{2}/) as HTMLInputElement;

    await user.selectOptions(clinicianSelect, "1");
    await user.selectOptions(patientSelect, "2");
    await user.clear(visitDateInput);
    await user.type(visitDateInput, "2026-03-05");
    await user.click(createVisitScope.getByRole("button", { name: "9:15 AM" }));
    await user.type(createVisitScope.getByRole("textbox"), "Routine follow-up");
    await user.click(createVisitScope.getByRole("button", { name: "Record Visit" }));

    await waitFor(() => {
      expect(visitsApiMocks.createVisit).toHaveBeenCalledOnce();
    });

    expect(visitsApiMocks.createVisit.mock.calls[0]?.[0]).toEqual({
      clinicianId: 1,
      patientId: 2,
      visitedAt: new Date("2026-03-05T09:15:00").toISOString(),
      notes: "Routine follow-up",
    });

    await waitFor(() => {
      expect(visitsApiMocks.getVisits.mock.calls.length).toBeGreaterThanOrEqual(4);
    });
  });

  it("shows a resource error banner when a required query fails", async () => {
    cliniciansApiMocks.getClinicians.mockRejectedValue(new Error("Unable to load clinicians"));
    patientsApiMocks.getPatients.mockResolvedValue([]);
    visitsApiMocks.getVisits.mockResolvedValue([]);

    renderHomePage();

    expect(await screen.findByText("Unable to load clinicians")).toBeTruthy();
  });
});
