import type { HandleWebhookUseCase } from "@/domain/mercadopago/application/use-cases/handle-webhook.usecase"
import Logger from "@/shared/utils/logger"
import type { Request, Response } from "express"
import { AppError } from "../middlewares/error-handler.middleware"

export class WebhookController {
  constructor(private webhookUseCase: HandleWebhookUseCase) {
    this.handle = this.handle.bind(this)
  }

  async handle(req: Request, res: Response) {
    try {
      const { action, data } = req.body

      if (!action || !data) {
        throw new AppError("Invalid webhook payload", 400)
      }

      Logger.info(`Received webhook: ${action}`)

      if ((action === "payment.created" || action === "payment.updated") && data && data.id) {
        const status = await this.webhookUseCase.execute(data.id.toString())
        return res.status(200).json({ success: true, status })
      } else {
        Logger.info(`Ignored webhook action: ${action}`)
        return res.status(200).json({ success: true, message: "ignored" })
      }
    } catch (error: any) {
      Logger.error("Error processing webhook:", error)

      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
        })
      }

      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
      })
    }
  }
}
