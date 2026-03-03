// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Clinician, Patient, Visit } from "../types/api";
import { CreateVisitForm } from "./CreateVisitForm";

const clinicians: Clinician[] = [
  {
    id: 1,
    name: "Dr. Stone",
    createdAt: "2026-03-03T08:00:00.000Z",
  },
];

const patients: Patient[] = [
  {
    id: 2,
    name: "Pat Doe",
    dateOfBirth: null,
    createdAt: "2026-03-03T08:00:00.000Z",
  },
];

function renderForm(visits: Visit[] = [], onSubmit = vi.fn().mockResolvedValue(undefined)) {
  render(
    <CreateVisitForm
      clinicians={clinicians}
      patients={patients}
      visits={visits}
      isSubmitting={false}
      onSubmit={onSubmit}
    />,
  );

  return { onSubmit };
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("CreateVisitForm", () => {
  it("shows booked slots as disabled pills for the selected clinician and date", () => {
    const bookedVisit: Visit = {
      id: 1,
      clinicianId: 1,
      patientId: 2,
      visitedAt: new Date("2026-03-03T09:00:00").toISOString(),
      notes: null,
      createdAt: "2026-03-03T08:00:00.000Z",
      clinician: { id: 1, name: "Dr. Stone" },
      patient: { id: 2, name: "Pat Doe" },
    };

    renderForm([bookedVisit]);

    const bookedSlot = screen.getByRole("button", { name: "9:00 AM" });

    expect((bookedSlot as HTMLButtonElement).disabled).toBe(true);
  });

  it("disables past dates and earlier slots on the current day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-03T08:00:00"));

    renderForm();

    const visitDateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/) as HTMLInputElement;
    const earlierSlot = screen.getByRole("button", { name: "7:45 AM" });
    const currentSlot = screen.getByRole("button", { name: "8:00 AM" });

    expect(visitDateInput.min).toBe("2026-03-03");
    expect((earlierSlot as HTMLButtonElement).disabled).toBe(true);
    expect((currentSlot as HTMLButtonElement).disabled).toBe(false);

    vi.useRealTimers();
  });

  it("submits the selected clinician, patient, date, and slot", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderForm([], onSubmit);

    const [clinicianSelect, patientSelect] = screen.getAllByRole("combobox");
    const visitDateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/) as HTMLInputElement;

    await user.selectOptions(clinicianSelect, "1");
    await user.selectOptions(patientSelect, "2");
    await user.clear(visitDateInput);
    await user.type(visitDateInput, "2099-03-05");
    await user.click(screen.getByRole("button", { name: "9:15 AM" }));
    await user.type(screen.getByRole("textbox"), "Routine follow-up");
    await user.click(screen.getByRole("button", { name: "Record Visit" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith({
      clinicianId: 1,
      patientId: 2,
      visitedAt: new Date("2099-03-05T09:15:00").toISOString(),
      notes: "Routine follow-up",
    });
  });

  it("does not submit a past visit date", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yesterdayValue = [
      yesterday.getFullYear(),
      String(yesterday.getMonth() + 1).padStart(2, "0"),
      String(yesterday.getDate()).padStart(2, "0"),
    ].join("-");

    renderForm([], onSubmit);

    const visitDateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/) as HTMLInputElement;

    await user.clear(visitDateInput);
    await user.type(visitDateInput, yesterdayValue);
    await user.click(screen.getByRole("button", { name: "9:15 AM" }));
    await user.click(screen.getByRole("button", { name: "Record Visit" }));

    expect(visitDateInput.validity.valid).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows an empty-state message and disables submission when required resources are missing", () => {
    render(
      <CreateVisitForm
        clinicians={[]}
        patients={[]}
        visits={[]}
        isSubmitting={false}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByText("Add at least one clinician and one patient before recording a visit.")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Record Visit" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("shows submission errors from the handler", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("Unable to save visit"));

    renderForm([], onSubmit);

    const [clinicianSelect, patientSelect] = screen.getAllByRole("combobox");
    const visitDateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/) as HTMLInputElement;

    await user.selectOptions(clinicianSelect, "1");
    await user.selectOptions(patientSelect, "2");
    await user.clear(visitDateInput);
    await user.type(visitDateInput, "2099-03-05");
    await user.click(screen.getByRole("button", { name: "9:15 AM" }));
    await user.click(screen.getByRole("button", { name: "Record Visit" }));

    expect(await screen.findByText("Unable to save visit")).toBeTruthy();
  });
});
