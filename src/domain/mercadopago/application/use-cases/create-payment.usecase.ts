import type { PrismaPaymentRepository } from "@/infra/database/prisma/repositories/prisma-payment.repository";
import type { MercadoPagoGateway } from "@/infra/http/mercadopago/mercado-pago.gateway";

export class CreatePaymentUseCase {
  constructor(
    private repo: PrismaPaymentRepository,
    private mpGateway: MercadoPagoGateway
  ) {}

  async execute({ amount }: any) {
    const response = await this.mpGateway.createPixPayment(
      amount,
    );

    if (!response.id) throw new Error("Error creating payment");
    
    const payment = await this.repo.create({
      mercadoPagoPaymentId: response.id.toString(),
      status: response.status as string,
      qrCode: response.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: response.point_of_interaction?.transaction_data?.qr_code_base64,
    } as any);
    return payment;
  }
}
