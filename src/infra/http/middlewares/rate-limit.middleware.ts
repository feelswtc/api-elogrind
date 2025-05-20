import rateLimit from "express-rate-limit"
import { env } from "@/infra/env"
import Logger from "@/shared/utils/logger"

export const rateLimitMiddleware = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  handler: (req, res, next, options) => {
    Logger.warn(`Rate limit exceeded for IP: ${req.ip}`)
    res.status(429).json(options.message)
  },
})
