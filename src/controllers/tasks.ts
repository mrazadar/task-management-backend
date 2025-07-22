import { z } from 'zod';
import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';
import { parse } from 'csv-parse';
import { StatusCodes } from 'http-status-codes';
import {
  CreateTaskSchema,
  TaskSchema,
  UpdateTaskSchema,
} from '../schemas/task.js';
import prisma from '../prisma/client.js';
import { BadRequestError, NotFoundError } from '../utils/customErrors.js';

const storage = multer.memoryStorage();
export const multerUpload = multer({ storage });

export const uploadHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { file, user } = req;

    if (!file) {
      throw new BadRequestError('No file uploaded.');
    }

    const parser = parse({ columns: true, skip_empty_lines: true });
    const tasks: z.infer<typeof TaskSchema>[] = [];

    parser.on('data', (row) => {
      try {
        const validatedTask = TaskSchema.parse(row);
        tasks.push({ ...validatedTask, userId: user!.id });
      } catch (error) {
        parser.emit('error', error);
      }
    });

    parser.on('error', (err) => next(err));

    parser.on('end', async () => {
      try {
        if (tasks.length === 0) {
          throw new BadRequestError(
            'CSV file is empty or contains no valid tasks.'
          );
        }

        await prisma.task.createMany({
          data: tasks,
          skipDuplicates: true,
        });

        res.status(StatusCodes.CREATED).json({
          success: true,
          message: 'Tasks uploaded successfully',
          data: { count: tasks.length },
        });
      } catch (error) {
        next(error);
      }
    });

    parser.end(file.buffer);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedTask = CreateTaskSchema.parse(req.body);
    const task = await prisma.task.create({
      data: { ...validatedTask, userId: req.user!.id },
    });
    res.status(StatusCodes.CREATED).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const getAllTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user!.id },
    });
    res.status(StatusCodes.OK).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { id: Number(id), userId: req.user!.id },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    res.status(StatusCodes.OK).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedTask = UpdateTaskSchema.parse({
      id: parseInt(id, 10),
      ...req.body,
    });

    const task = await prisma.task.update({
      where: { id: Number(id), userId: req.user!.id },
      data: validatedTask,
    });

    res.status(StatusCodes.OK).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({
      where: { id: Number(id), userId: req.user!.id },
    });
    res.status(StatusCodes.OK).json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};
