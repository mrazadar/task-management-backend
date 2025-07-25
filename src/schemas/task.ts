import { z } from 'zod';

// Base Task schema for validation
export const TaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'], {
    error: 'Invalid status',
  }),
});

export const PaginationSchema = z.object({
  page: z.number().int().positive('Page must be a positive integer'),
  limit: z.number().int().positive('Limit must be a positive integer'),
});

export type PaginationSchema = z.infer<typeof PaginationSchema>;

// Schema for creating tasks (client-side, excludes userId)
export const CreateTaskSchema = TaskSchema;

// Schema for updating tasks (includes id, partial fields)
export const UpdateTaskSchema = TaskSchema.partial().extend({
  id: z.number().int().positive('ID must be a positive integer'),
});

// Schema for testing or admin APIs (includes userId)
export const CreateTaskInputSchema = TaskSchema.extend({
  userId: z.number().int().positive('User ID must be a positive integer'),
});

// TypeScript types inferred from Zod schemas
export type Task = z.infer<typeof TaskSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;

export type UserTask = Task & { userId: number };

/**
 * @description Zod schemas for validating task data in API requests and CSV uploads.
 * @reference https://zod.dev/
 * @note CreateTaskSchema excludes userId as it's injected by auth middleware.
 * CreateTaskInputSchema includes userId for testing or admin routes.
 */
