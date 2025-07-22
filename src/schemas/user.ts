import { z } from 'zod';

export const UserSchema = z.object({
  // id: z.number(),
  email: z.string().email(),
  password: z.string(),
  // createdAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;

/**
 * @description TypeScript interface for user schema.
 * @reference Backend User model in prisma/schema.prisma
 * @validation Zod validation schema for user schema.
 */
