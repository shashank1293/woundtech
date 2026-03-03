import { Router } from "express";

import { createVisit, listVisits } from "../controllers/visitsController";

export const visitsRouter = Router();

visitsRouter.get("/", listVisits);
visitsRouter.post("/", createVisit);

