import { type NextFunction, type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { UserSchema } from '../schemas/user.js';
import prisma from '../prisma/client.js';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/customErrors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = UserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError('User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'User created successfully.',
      data: { id: newUser.id, email: newUser.email },
    });
  } catch (error) {
    next(error);
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = UserSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundError('Invalid email or password.');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login successful.',
      data: { id: user.id },
    });
  } catch (error) {
    next(error);
  }
};
