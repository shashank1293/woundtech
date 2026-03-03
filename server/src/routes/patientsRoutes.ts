import { Router } from "express";

import { createPatient, listPatients } from "../controllers/patientsController";

export const patientsRouter = Router();

patientsRouter.get("/", listPatients);
patientsRouter.post("/", createPatient);

