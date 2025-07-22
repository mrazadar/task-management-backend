import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { HttpError } from '../utils/customErrors.js';

// Custom error interface for structured error responses
export interface AppError {
  message: string;
  statusCode: StatusCodes;
  details?: unknown;
}

/**
 * Error handling middleware for Express.
 * Handles Zod validation errors and custom HttpErrors, returning standardized JSON responses.
 * @param err - The error object (ZodError, HttpError, or generic Error)
 * @param req - Express request object
 * @param res - Express response object
 * @param _next - Express next function (unused)
 * @returns A JSON response with error details. The function is expected to terminate the request-response cycle.
 * @reference https://expressjs.com/en/guide/error-handling.html
 * @reference https://zod.dev/?id=error-handling
 * @linting ESLint with Airbnb TypeScript rules ensures code consistency.
 */
export const errorHandler = (
  err: Error | ZodError | HttpError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Log the error for debugging purposes.
  // In a production environment, consider using a dedicated logging library like Winston.
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  let errorResponse: AppError;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    errorResponse = {
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'Validation failed',
      details: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }
  // Handle custom HTTP errors
  else if (err instanceof HttpError) {
    errorResponse = {
      statusCode: err.statusCode,
      message: err.message,
    };
  }
  // Handle generic errors
  else {
    errorResponse = {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'An unexpected internal server error occurred.',
    };
  }

  // Send the unified error response
  res.status(errorResponse.statusCode).json({
    success: false,
    error: errorResponse,
  });
};
