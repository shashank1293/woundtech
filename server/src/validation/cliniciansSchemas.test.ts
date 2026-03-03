import { describe, expect, it } from "vitest";

import { createClinicianSchema } from "./cliniciansSchemas";

describe("createClinicianSchema", () => {
  it("accepts a valid clinician payload", () => {
    expect(createClinicianSchema.parse({ name: "Dr. Stone" })).toEqual({
      name: "Dr. Stone",
    });
  });

  it("rejects an empty clinician name", () => {
    expect(() => createClinicianSchema.parse({ name: "" })).toThrow(/Name is required/);
  });
});
