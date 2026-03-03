import { Request, Response, NextFunction } from "express";

import { createClinicianSchema } from "../validation/cliniciansSchemas";
import { cliniciansService } from "../services/cliniciansService";

// Returns the current clinician list for the frontend.
export async function listClinicians(_request: Request, response: Response, next: NextFunction) {
  try {
    const clinicians = await cliniciansService.listClinicians();

    response.status(200).json(clinicians);
  } catch (error) {
    next(error);
  }
}

// Validates and creates a new clinician record.
export async function createClinician(request: Request, response: Response, next: NextFunction) {
  try {
    const payload = createClinicianSchema.parse(request.body);
    const clinician = await cliniciansService.createClinician(payload);

    response.status(201).json(clinician);
  } catch (error) {
    next(error);
  }
}
