import { z } from 'zod';

export const TaskSchema = z.object({
  // id: z.string(),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'], {
    error: 'Invalid status',
  }),
});

export type Task = z.infer<typeof TaskSchema>;

/**
 * @description Task zod schema to validate csv task data.
 */
