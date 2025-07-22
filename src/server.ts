import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';

import { errorHandler } from './middlewares/errorHandler.js';

import authRouter from './routes/auth.js';
import tasksRouter from './routes/tasks.js';
import { withAuth } from './middlewares/authMiddleware.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

async function server() {
  // middlewares
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  // app routes
  app.use('/api/auth', authRouter);
  app.use('/api/tasks', withAuth, tasksRouter);

  // Health check endpoint
  app.get('/api/health', (req: express.Request, res: express.Response) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
  });

  // Get Version
  app.get('/api/version', (req: express.Request, res: express.Response) => {
    res.status(200).json({ version: process.env.npm_package_version });
  });

  app.use(errorHandler);
  // Start server
  const PORT = process.env.PORT || 3002;

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

/**
 * @description Entry point for the Node.js/Express server.
 * @reference https://expressjs.com/en/starter/hello-world.html
 * @reference https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-oop.html
 * @linting ESLint with Airbnb TypeScript rules ensures code consistency.
 */
server();
