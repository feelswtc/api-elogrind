import helmet from "helmet"
import type { Express } from "express"
import hpp from "hpp"
import { env } from "@/infra/env"

export function setupSecurityMiddleware(app: Express) {
  // Set security HTTP headers
  app.use(helmet())

  // Prevent parameter pollution
  app.use(hpp())

  // Trust proxy for Cloudflare or other reverse proxies
  if (env.NODE_ENV === "production") {
    app.set("trust proxy", env.TRUST_PROXY)
  }

  // Disable X-Powered-By header
  app.disable("x-powered-by")
}
