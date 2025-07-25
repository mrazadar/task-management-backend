import { z, type ZodError } from 'zod';
import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';
import { parse } from 'csv-parse';
import { StatusCodes } from 'http-status-codes';
import {
  CreateTaskSchema,
  TaskSchema,
  UpdateTaskSchema,
  type UserTask,
} from '../schemas/task.js';
import prisma from '../prisma/client.js';

import { NotFoundError } from '../utils/customErrors.js';
import { EventEmitter } from 'events';
const taskEvents = new EventEmitter();

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
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const parsedTasks: Array<z.infer<typeof TaskSchema>> = [];

    const errors: ZodError[] = [];
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
            data: { ...validatedTask, userId: req.user!.id },
          });
        } catch (error) {
          // parser.emit('error', error); // Handled by error middleware
          parser.emit('error', error);
          // throw error;
        }
      })
      .on('error', (error: ZodError) => {
        errors.push(error);
      })
      .on('end', () => {
        if (errors.length > 0) {
          next(errors);
        } else {
          res.status(201).json({
            message: 'Tasks uploaded successfully',
            tasks: parsedTasks,
          });
        }
      });
  } catch (error) {
    next(error);
  }
};

export const streamTaskEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (data: { event: string; task: UserTask }) => {
      res.write(`event: ${data.event}:\n Task: ${JSON.stringify(data.task)}\n`);
    };

    const listener = (event: string, task: UserTask) => {
      if (task.userId === req.user?.id) {
        sendEvent({ event, task });
      }
    };

    taskEvents.on('taskCreated', listener);
    taskEvents.on('taskUpdated', listener);
    taskEvents.on('taskDeleted', listener);

    req.on('close', () => {
      taskEvents.off('taskCreated', listener);
      taskEvents.off('taskUpdated', listener);
      taskEvents.off('taskDeleted', listener);
      res.end();
    });

    // Send initial heartbeat
    sendEvent({
      event: 'heartbeat',
      task: {
        userId: 9999,
        title: 'Heartbeat',
        description: 'Keeping the connection alive',
        status: 'TODO',
      },
    });
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
    taskEvents.emit('taskCreated', 'taskCreated', task);
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

    // using prisma transactions
    const task = await prisma.$transaction(async (tx) => {
      const existingTask = await tx.task.findUnique({
        where: { id: Number(id), userId: req.user!.id },
      });

      if (!existingTask) {
        throw new NotFoundError('Task not found');
      }

      return await tx.task.update({
        where: { id: Number(id), userId: req.user!.id },
        data: validatedTask,
      });
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
