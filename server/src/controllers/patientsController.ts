import { NextFunction, Request, Response } from "express";

import { patientsService } from "../services/patientsService";
import { createPatientSchema } from "../validation/patientsSchemas";

export async function listPatients(_request: Request, response: Response, next: NextFunction) {
  try {
    const patients = await patientsService.listPatients();

    response.status(200).json(patients);
  } catch (error) {
    next(error);
  }
}

export async function createPatient(request: Request, response: Response, next: NextFunction) {
  try {
    const payload = createPatientSchema.parse(request.body);
    const patient = await patientsService.createPatient(payload);

    response.status(201).json(patient);
  } catch (error) {
    next(error);
  }
}

