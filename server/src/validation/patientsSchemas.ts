import { z } from "zod";

export const createPatientSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  dateOfBirth: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined))
    .refine((value) => value === undefined || !Number.isNaN(value.getTime()), {
      message: "dateOfBirth must be a valid date",
    }),
});

