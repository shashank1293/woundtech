import { z } from "zod";

export const createClinicianSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
});

