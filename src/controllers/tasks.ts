import { z } from 'zod';
import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';

import { TaskSchema, type Task } from '../schemas/task.js';

import { parse } from 'csv-parse';

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
      .on('data', (row) => {
        try {
          const parsedTask = TaskSchema.parse(row);
          parsedTasks.push(parsedTask);
        } catch (error) {
          // parser.emit('error', error); // Handled by error middleware
          parser.emit('error', error);
        }
      })
      .on('end', () => {
        res
          .status(201)
          .json({ message: 'Tasks uploaded successfully', tasks: parsedTasks });
      })
      .on('error', (error) => {
        throw error; // Handled by error middleware
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
export const createTask = (req: Request, res: Response, next: NextFunction) => {
  const task: Task = {
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
  };

  // Validate the task data using the TaskSchema
  const validatedTask = TaskSchema.parse(task);

  // // If the validation fails, return a 400 Bad Request response
  // if (!validatedTask.success) {
  //   return res.status(400).json({
  //     message: 'Validation failed',
  //     details: validatedTask.error.issues,
  //   });
  // }

  // // If the validation passes, save the task to the database
  // // and return a 201 Created response with the created task
  // res.status(201).json(validatedTask.data);

  return res.status(201).json(validatedTask);
};
