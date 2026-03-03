import { Router } from "express";

import { cliniciansRouter } from "./cliniciansRoutes";
import { patientsRouter } from "./patientsRoutes";
import { visitsRouter } from "./visitsRoutes";

export const apiRouter = Router();

apiRouter.use("/clinicians", cliniciansRouter);
apiRouter.use("/patients", patientsRouter);
apiRouter.use("/visits", visitsRouter);

