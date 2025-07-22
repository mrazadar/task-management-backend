import { type NextFunction, type Request, type Response } from 'express';
import { type User, UserSchema } from '../schemas/user.js';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import prisma from '../prisma/client.js';
import { NotFoundError, UnauthorizedError } from '../utils/customErrors.js';
import { StatusCodes } from 'http-status-codes';

// JWT_SECRET is a secret string that should be kept private
// It is used to sign and verify the JWT tokens
// You can generate a secret using the following command:
// openssl rand -base64 32
// Remember to keep this secret private and keep it safe!
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

/**
 * @description Authenticate a user with email and password.
 * @param req - Express request object
 * @param res - Express response object
 * @returns JSON response with user details
 * @reference https://nextjs.org/docs/app/building-your-application/data-fetching/get-server-side-props
 * @reference https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-data-with-get-server-side-props
 * @linting ESLint with Airbnb TypeScript rules ensures code consistency.
 */
export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = UserSchema.parse(req.body);
    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
      expiresIn: '1h',
    });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(StatusCodes.CREATED).json({
      message: 'User created',
      id: newUser.id,
      email: newUser.email,
    });
  } catch (error) {
    next(error);
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Error | void> => {
  try {
    const validatedUserData = UserSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: {
        email: validatedUserData.email,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isPasswordCorrect = await bcrypt.compare(
      validatedUserData.password,
      user.password
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(StatusCodes.OK).json({
      message: 'Login successful',
      id: user.id,
    });
  } catch (error) {
    next(error);
  }
};
