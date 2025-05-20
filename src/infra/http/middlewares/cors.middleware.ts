import cors from "cors"
import { env } from "@/infra/env"

const allowedOrigins = env.ALLOWED_ORIGINS.split(",")

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes("*")) {
      // If wildcard is allowed
      return callback(null, true)
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true)
    }

    return callback(new Error("CORS not allowed"), false)
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  credentials: true,
  maxAge: 86400, // 24 hours
})
