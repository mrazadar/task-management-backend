import { type NextFunction, type Request, type Response } from 'express';

import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/customErrors.js';
import { de } from 'zod/locales';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const withAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decodedToken = jwt.verify(token, JWT_SECRET) as { userId: number };

    req.user = {
      id: decodedToken.userId,
    };

    next();
  } catch (error) {
    next(error);
  }
};
// extend the Request global module and it should be globally available

declare module 'express' {
  interface Request {
    user?: {
      id: number;
    };
  }
}
