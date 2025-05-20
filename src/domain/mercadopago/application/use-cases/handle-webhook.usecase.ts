import type { PrismaPaymentRepository } from "@/infra/database/prisma/repositories/prisma-payment.repository";
import type { MercadoPagoGateway } from "@/infra/http/mercadopago/mercado-pago.gateway";

export class HandleWebhookUseCase {
  constructor(
    private repo: PrismaPaymentRepository,
    private mpGateway: MercadoPagoGateway
  ) {}

  async execute(mpPaymentId: string) {
    const mpPayment = await this.mpGateway.getPayment(mpPaymentId);
    await this.repo.updateStatus(mpPaymentId, mpPayment.status as string);
    return mpPayment.status;
  }
}
