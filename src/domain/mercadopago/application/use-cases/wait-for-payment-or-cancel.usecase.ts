import type { PrismaClient } from "@prisma/client";
import type { MercadoPagoGateway } from "@/infra/http/mercadopago/mercado-pago.gateway";

export class WaitForPaymentOrCancelUseCase {
  constructor(
    private prisma: PrismaClient,
    private mpGateway: MercadoPagoGateway
  ) {}

  async execute(mercadoPagoPaymentId: string, maxMinutes = 5, intervalSeconds = 5) {
    const maxTries = Math.ceil((maxMinutes * 60) / intervalSeconds);
    let tries = 0;

    while (tries < maxTries) {
      const mpPayment = await this.mpGateway.getPayment(mercadoPagoPaymentId);

      // Atualiza status local no banco
      await this.prisma.payment.update({
        where: { mercadoPagoPaymentId },
        data: { status: mpPayment.status },
      });

      if (mpPayment.status === "approved") {
        return mpPayment.status;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalSeconds * 1000));
      tries++;
    }

    await this.mpGateway.cancelPayment(mercadoPagoPaymentId);

    await this.prisma.payment.update({
      where: { mercadoPagoPaymentId },
      data: { status: "cancelled" },
    });

    return "cancelled";
  }
}
