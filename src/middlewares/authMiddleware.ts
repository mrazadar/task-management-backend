import { type NextFunction, type Request, type Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/customErrors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function isTokenExpired(decodedToken: { exp?: number }): boolean {
  if (typeof decodedToken.exp === 'undefined') {
    // If 'exp' claim is not present, the token might be considered valid indefinitely or handled differently based on your application's logic.
    // For this example, we'll assume it's not expired if no 'exp' is present.
    return false;
  }

  const currentTime = Date.now() / 1000; // Get current time in seconds since epoch
  return decodedToken.exp < currentTime;
}

export const withAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log('Cookies : ', JSON.stringify(req.cookies));

  const token = req.cookies?.token;
  try {
    if (!token) {
      throw new UnauthorizedError('Authentication token not provided.');
    }

    const decoded: JwtPayload = jwt.verify(token, JWT_SECRET) as {
      userId: number;
    };

    if (isTokenExpired(decoded)) {
      throw new UnauthorizedError('Token has expired.');
    }

    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    throw new UnauthorizedError(
      `Invalid or expired authentication token. ${error instanceof Error ? error.message : ''}`
    );
  }
};

declare module 'express' {
  interface Request {
    user?: {
      id: number;
    };
  }
}
