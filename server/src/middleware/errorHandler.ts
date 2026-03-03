import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  statusCode: number;

  // Stores an explicit HTTP status code for expected application errors.
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Converts unmatched routes into a consistent 404 application error.
export function notFoundHandler(_request: Request, _response: Response, next: NextFunction) {
  next(new AppError("Route not found", 404));
}

// Normalizes validation, application, and unexpected errors into API responses.
export function errorHandler(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      message: "Validation failed",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      message: error.message,
    });
  }

  console.error(error);

  return response.status(500).json({
    message: "Internal server error",
  });
}
