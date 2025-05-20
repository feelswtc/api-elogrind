import type { PaymentController } from "./controllers/payment.controller"
import type { WebhookController } from "./controllers/webhook.controller"
import express from "express"
import { apiKeyAuthMiddleware } from "./middlewares/api-key-auth.middleware"
import { corsMiddleware } from "./middlewares/cors.middleware"
import { rateLimitMiddleware } from "./middlewares/rate-limit.middleware"
import { setupSecurityMiddleware } from "./middlewares/security.middleware"
import { errorHandlerMiddleware } from "./middlewares/error-handler.middleware"
import { requestLoggerMiddleware } from "./middlewares/request-logger.middleware"
import { env } from "@/infra/env"

export function createServer(paymentController: PaymentController, webhookController: WebhookController) {
  const app = express()

  // Apply security middleware
  setupSecurityMiddleware(app)

  // Apply CORS middleware
  app.use(corsMiddleware)

  // Apply rate limiting
  app.use(rateLimitMiddleware)

  // Request logging
  app.use(requestLoggerMiddleware)

  // Parse JSON bodies
  app.use(express.json({ limit: "10kb" }))

  // Health check endpoint (no auth required)
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", environment: env.NODE_ENV })
  })

  // Protected routes
  app.post("/payment", apiKeyAuthMiddleware, (req, res) => paymentController.create(req, res))

  // Webhook route (no API key required as it's called by MercadoPago)
  app.post("/webhook", (req, res) => webhookController.handle(req, res))

  // Handle 404 errors
  app.use((req, res) => {
    res.status(404).json({ error: "Not found" })
  })

  // Global error handler
  app.use(errorHandlerMiddleware)

  return app
}
