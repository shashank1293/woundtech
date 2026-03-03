import { Router } from "express";

import { createClinician, listClinicians } from "../controllers/cliniciansController";

export const cliniciansRouter = Router();

cliniciansRouter.get("/", listClinicians);
cliniciansRouter.post("/", createClinician);

