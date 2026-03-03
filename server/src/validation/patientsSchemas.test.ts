import { describe, expect, it } from "vitest";

import { createPatientSchema } from "./patientsSchemas";

describe("createPatientSchema", () => {
  it("accepts a valid patient payload", () => {
    const result = createPatientSchema.parse({
      name: "Pat Doe",
      dateOfBirth: "1990-05-10",
    });

    expect(result).toEqual({
      name: "Pat Doe",
      dateOfBirth: new Date("1990-05-10"),
    });
  });

  it("rejects an invalid patient date of birth", () => {
    expect(() =>
      createPatientSchema.parse({
        name: "Pat Doe",
        dateOfBirth: "not-a-date",
      }),
    ).toThrow(/valid date/);
  });
});
