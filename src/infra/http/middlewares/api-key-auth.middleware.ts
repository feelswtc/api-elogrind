import { env } from "@/infra/env"
import type { Request, Response, NextFunction } from "express"
import Logger from "@/shared/utils/logger"

export function apiKeyAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"]

  if (!apiKey || apiKey !== env.API_KEY) {
    Logger.warn(`Unauthorized API access attempt from IP: ${req.ip}`)
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or missing API key",
    })
  }

  next()
}
