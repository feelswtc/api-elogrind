import type { Payment } from "@/domain/mercadopago/enterprise/entities/payment.entities";

export interface PaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(id: string): Promise<Payment | null>
  findPending(): Promise<Payment[]>
  update(payment: Payment): Promise<void>
}
