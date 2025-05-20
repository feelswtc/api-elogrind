import { type MercadoPagoConfig, Payment as MPPayment } from "mercadopago";
import { env } from "@/infra/env";

export class MercadoPagoGateway {
  private payment: MPPayment;

  constructor(mpClient: MercadoPagoConfig) {
    this.payment = new MPPayment(mpClient);
  }

  async createPixPayment(amount: number) {
    
    const body = {
      transaction_amount: amount,
      description: "EloGrind",
      payment_method_id: "pix",
      payer: { email: "vitorbtrem@gmail.com" },
      notification_url: env.MERCADO_PAGO_WEBHOOK_URL,
    };
    const response = await this.payment.create({ body });

    return response;
  }

  async getPayment(paymentId: string) {
    return await this.payment.get({ id: paymentId });
  }

  async cancelPayment(paymentId: string) {
    return await this.payment.cancel({ id: paymentId });
  }
}
