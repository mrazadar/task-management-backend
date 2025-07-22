import { z, ZodError } from 'zod';
import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';

import {
  CreateTaskSchema,
  TaskSchema,
  UpdateTaskSchema,
  type Task,
} from '../schemas/task.js';

import { parse } from 'csv-parse';
import prisma from '../prisma/client.js';
import { NotFoundError } from '../utils/customErrors.js';
import { StatusCodes } from 'http-status-codes';

type TaskZodError = z.ZodError<Task>;
type TaskZodErrors = Array<ZodError<Task>>;

const storage = multer.memoryStorage();

export const multerUpload = multer({ storage });

export const uploadHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file;

    if (!file) {
      throw new NotFoundError('No file uploaded');
    }

    const parsedTasks: Array<z.infer<typeof TaskSchema>> = [];

    const errors: TaskZodErrors = [];
    // read file buffer using multer

    // open asyncFileStream to read csv file data in chunks

    // parse csv file data using csv-parse

    // validate csv data using zod schema

    // save it to temp array for now and return the temp array in json response.

    const parser = parse({ columns: true, skip_empty_lines: true });

    const stream = await import('stream');

    const readableStream = new stream.PassThrough();

    readableStream.end(file.buffer);

    readableStream
      .pipe(parser)
      .on('data', async (row) => {
        try {
          const validatedTask = TaskSchema.parse(row);
          parsedTasks.push(validatedTask);
          await prisma.task.create({
            data: {
              ...validatedTask,
              userId: req.user!.id,
            },
          });
        } catch (error) {
          // parser.emit('error', error); // Handled by error middleware
          parser.emit('error', error);
          // throw error;
        }
      })
      .on('end', () => {
        if (errors.length > 0) {
          next(errors);
        } else {
          res.status(StatusCodes.CREATED).json({
            message: 'Tasks uploaded successfully',
            tasks: parsedTasks,
          });
        }
      })
      .on('error', (error: TaskZodError) => {
        errors.push(error);
      });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns JSON response with the created task
 * @reference https://expressjs.com/en/guide/routing.html
 * @linting ESLint with Airbnb TypeScript rules ensures code consistency.
 */
export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the task data using the TaskSchema
    const validatedTask = CreateTaskSchema.parse(req.body);

    // Save the validated task to the database
    const task = await prisma.task.create({
      data: {
        ...validatedTask,
        userId: req.user!.id,
      },
    });

    return res.status(StatusCodes.CREATED).json(task);
  } catch (error) {
    next(error);
  }
};

/***
 * Get all tasks.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns JSON response with an array of tasks
 * @reference https://expressjs.com/en/guide/routing.html
 */
export const getAllTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user!.id,
      },
    });
    return res.status(StatusCodes.OK).json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single task by ID.
 * req.params.id is the task ID.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns JSON response with the task
 * @reference https://expressjs.com/en/guide/routing.html
 */
export const getTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: {
        id: Number(id),
        userId: req.user!.id,
      },
    });
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    return res.status(StatusCodes.OK).json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a task by ID.
 * @returns updated task
 */
export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Validate the task data using the UpdateTaskSchema
    const validatedTask = UpdateTaskSchema.parse({
      id: parseInt(id, 10),
      ...req.body,
    });

    // Update the task in the database
    const task = await prisma.task.update({
      where: {
        id: Number(id),
        userId: req.user!.id,
      },
      data: validatedTask,
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return res.status(StatusCodes.OK).json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task by ID.
 * @returns deleted task
 */
export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Delete the task from the database
    const task = await prisma.task.delete({
      where: {
        id: Number(id),
        userId: req.user!.id,
      },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return res.status(StatusCodes.OK).json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * @description Express router for task CRUD operations using Prisma.
 * @reference https://www.prisma.io/docs/concepts/components/prisma-client/crud
 * @reference https://expressjs.com/en/guide/routing.html
 * @reference https://zod.dev/
 */
