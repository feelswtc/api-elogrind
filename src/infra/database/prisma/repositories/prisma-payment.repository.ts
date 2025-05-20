import type { PrismaClient } from "@prisma/client";

export class PrismaPaymentRepository {
  constructor(private prisma: PrismaClient) {}

  async create(props: {
    mercadoPagoPaymentId: string;
    status: string;
    qrCode?: string;
  }) {
    return this.prisma.payment.create({ data: props });
  }

  async findById(paymentId: string) {
    return this.prisma.payment.findUnique({ where: { mercadoPagoPaymentId: paymentId } });
  }

  async updateStatus(mercadoPagoPaymentId: string, newStatus: string) {
    return this.prisma.payment.update({
      where: { mercadoPagoPaymentId },
      data: { status: newStatus },
    });
  }
}
