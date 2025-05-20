import type { Request, Response, NextFunction } from "express"
import Logger from "@/shared/utils/logger"

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()

  res.on("finish", () => {
    const duration = Date.now() - start
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`

    if (res.statusCode >= 500) {
      Logger.error(message, new Error("Server error"))
    } else if (res.statusCode >= 400) {
      Logger.warn(message)
    } else {
      Logger.info(message)
    }
  })

  next()
}
