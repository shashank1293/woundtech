import { z } from "zod";

export const createVisitSchema = z.object({
  clinicianId: z.coerce.number().int().positive(),
  patientId: z.coerce.number().int().positive(),
  visitedAt: z.coerce
    .date()
    .refine((value) => value.getTime() >= Date.now(), {
      message: "visitedAt must not be in the past",
    })
    .refine((value) => value.getUTCMinutes() % 15 === 0, {
      message: "visitedAt must be in 15-minute increments",
    })
    .refine((value) => value.getUTCSeconds() === 0 && value.getUTCMilliseconds() === 0, {
      message: "visitedAt must not include seconds",
    }),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes are too long")
    .optional()
    .transform((value) => value || undefined),
});

export const listVisitsQuerySchema = z.object({
  clinicianId: z.coerce.number().int().positive().optional(),
  patientId: z.coerce.number().int().positive().optional(),
});
