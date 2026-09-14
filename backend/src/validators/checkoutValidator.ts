import { z } from 'zod';

export const cartItemSchema = z.object({
  productId: z
    .string({
      required_error: 'productId is required',
      invalid_type_error: 'productId must be a string',
    })
    .min(1, 'productId cannot be empty'),
  quantity: z
    .number({
      required_error: 'quantity is required',
      invalid_type_error: 'quantity must be a number',
    })
    .int('quantity must be an integer')
    .positive('quantity must be greater than 0')
    .max(999, 'quantity cannot exceed 999 items per line item'),
});

export const validateCartSchema = z.object({
  body: z.object({
    items: z
      .array(cartItemSchema, {
        required_error: 'items array is required',
        invalid_type_error: 'items must be an array',
      })
      .min(1, 'Cart must contain at least 1 item')
      .max(100, 'Cart cannot contain more than 100 distinct items'),
    appliedDiscountCode: z.string().optional(),
  }),
});

export const createPaymentOrderSchema = z.object({
  body: z
    .object({
      orderId: z.string().optional(),
      items: z.array(cartItemSchema).optional(),
    })
    .refine((data) => !!data.orderId || (!!data.items && data.items.length > 0), {
      message: 'Either orderId or a non-empty items array must be provided',
    }),
});

export type ValidateCartInput = z.infer<typeof validateCartSchema>['body'];
export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>['body'];
