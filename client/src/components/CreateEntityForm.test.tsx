// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CreateEntityForm } from "./CreateEntityForm";

afterEach(() => {
  cleanup();
});

describe("CreateEntityForm", () => {
  it("shows a validation error when name is blank", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <CreateEntityForm
        label="Clinician Name"
        submitLabel="Add Clinician"
        isSubmitting={false}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add Clinician" }));

    expect(screen.getByText("Name is required.")).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the optional date of birth when provided", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    const { container } = render(
      <CreateEntityForm
        label="Patient Name"
        dateLabel="Date of Birth"
        submitLabel="Add Patient"
        isSubmitting={false}
        onSubmit={onSubmit}
      />,
    );

    const nameInput = screen.getByPlaceholderText("Enter a name");
    const dateInput = container.querySelector('input[type="date"]');

    if (!dateInput) {
      throw new Error("Date input not found");
    }

    await user.type(nameInput, "Pat Doe");
    await user.type(dateInput, "1990-05-10");
    await user.click(screen.getByRole("button", { name: "Add Patient" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Pat Doe",
      dateOfBirth: "1990-05-10",
    });
  });

  it("shows submission errors from the handler", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("Unable to save clinician"));

    render(
      <CreateEntityForm
        label="Clinician Name"
        submitLabel="Add Clinician"
        isSubmitting={false}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByPlaceholderText("Enter a name"), "Dr. Stone");
    await user.click(screen.getByRole("button", { name: "Add Clinician" }));

    expect(await screen.findByText("Unable to save clinician")).toBeTruthy();
  });
});
