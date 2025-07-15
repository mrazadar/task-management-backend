import { z } from 'zod';

// Define Task schema for API validation
export const TaskSchema = z.object({
  // id: z.string(),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'], {
    error: 'Invalid status',
  }),
  // createdAt: z.string(),
  // updatedAt: z.string(),
});

// Define schemas for creating and updating tasks
export const CreateTaskSchema = TaskSchema;
export const UpdateTaskSchema = TaskSchema.partial().extend({
  id: z.number().int().positive('ID must be a positive integer'),
});

// Define types for task data
export type Task = z.infer<typeof TaskSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;

/**
 * @description Zod schemas for validating task data in API requests and CSV uploads.
 * @reference https://zod.dev/
 */
