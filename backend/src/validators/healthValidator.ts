import { z } from 'zod';

export const healthCheckSchema = z.object({
  query: z.object({}).optional(),
});
