import { z } from "zod"
import { config } from "dotenv"

config()

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  MERCADO_PAGO_WEBHOOK_URL: z.string(),
  MERCADO_PAGO_ACCESS_TOKEN: z.string(),
  MERCADO_PAGO_PUBLIC_KEY: z.string(),
  PORT: z.coerce.number().default(3000),
  DISCORD_TOKEN: z.string(),
  GUILD_ID: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  API_KEY: z.string(),
  ALLOWED_ORIGINS: z.string().default("*"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  TRUST_PROXY: z.coerce.number().default(1),
  DATABASE_SSL: z.boolean().default(true),
})

export type Env = z.infer<typeof envSchema>

export const env = envSchema.parse(process.env)
