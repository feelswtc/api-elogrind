import type { WaitForPaymentOrCancelUseCase } from "@/domain/mercadopago/application/use-cases/wait-for-payment-or-cancel.usecase"
import type { CreatePaymentUseCase } from "@/domain/mercadopago/application/use-cases/create-payment.usecase"
import type { Request, Response } from "express"
import Logger from "@/shared/utils/logger"
import { CreatePaymentInputSchema } from "@/shared/validation/payment.schema"
import { AppError } from "../middlewares/error-handler.middleware"

export class PaymentController {
  constructor(
    private createPaymentUseCase: CreatePaymentUseCase,
    private waitForPaymentOrCancelUseCase: WaitForPaymentOrCancelUseCase,
  ) {
    this.create = this.create.bind(this)
  }

  async create(req: Request, res: Response) {
    try {
      // Validate input
      const validatedData = CreatePaymentInputSchema.safeParse(req.body)

      if (!validatedData.success) {
        throw new AppError("Invalid payment data", 400)
      }

      const payment = await this.createPaymentUseCase.execute(validatedData.data)

      // Send initial response
      res.status(201).json({
        success: true,
        data: {
          id: payment.id,
          mercadoPagoPaymentId: payment.mercadoPagoPaymentId,
          status: payment.status,
          qrCode: payment.qrCode,
          qrCodeBase64: payment.qrCodeBase64,
          createdAt: payment.createdAt,
        },
      })

      // Start polling in background
      this.waitForPaymentOrCancelUseCase
        .execute(payment.mercadoPagoPaymentId)
        .then((status) => {
          Logger.info(`[Polling] Payment ${payment.id} finished: ${status}`)
        })
        .catch((err) => {
          Logger.error(`[Polling] Error checking payment ${payment.id}:`, err)
        })
    } catch (error: any) {
      if (!res.headersSent) {
        if (error instanceof AppError) {
          return res.status(error.statusCode).json({
            success: false,
            error: error.message,
          })
        }

        Logger.error('Error creating payment:', error)
        res.status(500).json({
          success: false,
          error: "Internal server error",
        })
      }
    }
  }
}
