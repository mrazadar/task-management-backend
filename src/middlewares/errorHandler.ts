import type { Request, Response, NextFunction } from 'express';

import { ZodError } from 'zod';

import { StatusCodes } from 'http-status-codes';

// Custom error interface for structured error responses
export interface AppError {
  statusCode?: StatusCodes;
  message: string;
  details?: any;
}

/**
 * Error handling middleware for Express.
 * Handles Zod validation errors and generic server errors, returning standardized JSON responses.
 * @param err - The error object (ZodError or generic Error)
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns JSON response with error details
 * @reference https://expressjs.com/en/guide/error-handling.html
 * @reference https://zod.dev/?id=error-handling
 * @linting ESLint with Airbnb TypeScript rules ensures code consistency.
 */
export const errorHandler = (
  err: Error | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error for debugging (extendable to a logging service like Winston)
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const response: AppError = {
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'Validation failed',
      details: `${(err.stack, err.message)}`,
    };

    res.status(StatusCodes.BAD_REQUEST).json(response);
  }

  // Handle generic errors
  const response: AppError = {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || 'Internal server error',
  };

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);
};
