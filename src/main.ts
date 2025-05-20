import { WaitForPaymentOrCancelUseCase } from "@/domain/mercadopago/application/use-cases/wait-for-payment-or-cancel.usecase"
import { PrismaPaymentRepository } from "@/infra/database/prisma/repositories/prisma-payment.repository"
import { CreatePaymentUseCase } from "@/domain/mercadopago/application/use-cases/create-payment.usecase"
import { HandleWebhookUseCase } from "@/domain/mercadopago/application/use-cases/handle-webhook.usecase"
import { MercadoPagoGateway } from "@/infra/http/mercadopago/mercado-pago.gateway"
import { PaymentController } from "@/infra/http/controllers/payment.controller"
import { WebhookController } from "@/infra/http/controllers/webhook.controller"
import { createServer } from "@/infra/http/server"
import { MercadoPagoConfig } from "mercadopago"
import { prisma } from "@/infra/database/prisma"
import { env } from "@/infra/env"
import Logger from "@/shared/utils/logger"
import process from "node:process"

async function bootstrap() {
  try {
    Logger.info(`Starting server in ${env.NODE_ENV} mode`)

    // Use the singleton prisma instance
    const repo = new PrismaPaymentRepository(prisma)

    const mpClient = new MercadoPagoConfig({
      accessToken: env.MERCADO_PAGO_ACCESS_TOKEN,
      options: { timeout: 5000 },
    })
    const mpGateway = new MercadoPagoGateway(mpClient)

    const createPaymentUseCase = new CreatePaymentUseCase(repo, mpGateway)
    const webhookUseCase = new HandleWebhookUseCase(repo, mpGateway)

    const waitForPaymentOrCancelUseCase = new WaitForPaymentOrCancelUseCase(prisma, mpGateway)

    const paymentController = new PaymentController(createPaymentUseCase, waitForPaymentOrCancelUseCase)
    const webhookController = new WebhookController(webhookUseCase)

    const app = createServer(paymentController, webhookController)

    const PORT = env.PORT || 3000

    const server = app.listen(PORT, () => {
      Logger.info(`Server running on port ${PORT}`)
    })

    // Handle graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      Logger.info(`${signal} received. Shutting down gracefully...`)

      server.close(async () => {
        Logger.info("HTTP server closed")

        try {
          await prisma.$disconnect()
          Logger.info("Database connection closed")
          process.exit(0)
        } catch (error) {
          Logger.error("Error during shutdown:", error as Error)
          process.exit(1)
        }
      })

      // Force close after 10s
      setTimeout(() => {
        Logger.error("Forcing shutdown after timeout", new Error("Shutdown timeout"))
        process.exit(1)
      }, 10000)
    }

    // Listen for termination signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
    process.on("SIGINT", () => gracefulShutdown("SIGINT"))

    // Handle uncaught exceptions and rejections
    process.on("uncaughtException", (error) => {
      Logger.error("Uncaught exception:", error)
      gracefulShutdown("Uncaught exception")
    })

    process.on("unhandledRejection", (reason) => {
      Logger.error("Unhandled rejection:", reason as Error)
      gracefulShutdown("Unhandled rejection")
    })
  } catch (error) {
    Logger.error("Error starting server:", error as Error)
    process.exit(1)
  }
}

bootstrap()
