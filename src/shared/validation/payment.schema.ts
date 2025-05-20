import { z } from "zod";

export const CreatePaymentInputSchema = z.object({
  amount: z.number().positive(),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentInputSchema>;
