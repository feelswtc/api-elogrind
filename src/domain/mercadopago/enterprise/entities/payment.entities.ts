import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Entity } from "@/core/entities/entity";

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  CANCELLED = "cancelled",
}

export interface PaymentProps {
  paymentId?: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
}

export class Payment extends Entity<PaymentProps> {

  constructor(props: PaymentProps, id?: UniqueEntityID) {
    super(props, id);
  }
  
  static create(props: Omit<PaymentProps, 'status' | 'createdAt'>, id?: UniqueEntityID) {
    return new Payment(
      {
        ...props,
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
      },
      id
    );
  }

  isExpired(now: Date): boolean {
    return (
      this.props.status === PaymentStatus.PENDING &&
      now.getTime() - this.props.createdAt.getTime() > 5 * 60 * 1000
    );
  }

  markAsPaid() {
    this.props.status = PaymentStatus.PAID;
  }

  cancel() {
    this.props.status = PaymentStatus.CANCELLED;
  }

  setPaymentId(paymentId: string) {
    this.props.paymentId = paymentId;
  }

  get status() {
    return this.props.status;
  }

  get paymentId() {
    return this.props.paymentId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get amount() {
    return this.props.amount;
  }
}
