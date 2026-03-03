import { NextFunction, Request, Response } from "express";

import { visitsService } from "../services/visitsService";
import { createVisitSchema, listVisitsQuerySchema } from "../validation/visitsSchemas";

// Returns visits in reverse chronological order with optional clinician and patient filters.
export async function listVisits(request: Request, response: Response, next: NextFunction) {
  try {
    const filters = listVisitsQuerySchema.parse(request.query);
    const visits = await visitsService.listVisits(filters);

    response.status(200).json(visits);
  } catch (error) {
    next(error);
  }
}

// Validates and creates a new visit record.
export async function createVisit(request: Request, response: Response, next: NextFunction) {
  try {
    const payload = createVisitSchema.parse(request.body);
    const visit = await visitsService.createVisit(payload);

    response.status(201).json(visit);
  } catch (error) {
    next(error);
  }
}
