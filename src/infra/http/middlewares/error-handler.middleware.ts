import type { Request, Response, NextFunction } from "express"
import Logger from "@/shared/utils/logger"
import { ZodError } from "zod"
import { env } from "@/infra/env"

export class AppError extends Error {
  public readonly statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
    this.name = "AppError"
  }
}

export function errorHandlerMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  Logger.error(`Error: ${err.message}`, err)

  // Handle ZodError (validation errors)
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "error",
      message: "Validation error",
      errors: err.errors,
    })
  }

  // Handle custom application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    })
  }

  // Handle unexpected errors
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500

  // Don't expose error details in production
  const message = env.NODE_ENV === "production" ? "Internal server error" : err.message

  return res.status(statusCode).json({
    status: "error",
    message,
  })
}
