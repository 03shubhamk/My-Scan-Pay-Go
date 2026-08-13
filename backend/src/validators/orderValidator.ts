import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string({
          required_error: 'productId is required',
        }).min(1, 'productId cannot be empty'),
        quantity: z
          .number({
            required_error: 'quantity is required',
            invalid_type_error: 'quantity must be a number',
          })
          .int('quantity must be an integer')
          .positive('quantity must be greater than 0'),
      })
    )
    .min(1, 'Order must contain at least 1 item'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
