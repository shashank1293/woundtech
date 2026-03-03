import cors from "cors";
import express from "express";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { apiRouter } from "./routes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      // The app is local-only for this exercise, so the Vite dev server is the only allowed origin.
      origin: "http://localhost:5173",
    }),
  );
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
