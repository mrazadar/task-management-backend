import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';

import { errorHandler } from './middlewares/errorHandler.js';

import authRouter from './routes/auth.js';
import tasksRouter from './routes/tasks.js';
import { withAuth } from './middlewares/authMiddleware.js';

const allowedOrigins = ['http://localhost:3000'];

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

async function server() {
  // middlewares
  // allow cross-origin requests from localhost:3000

  app.use(express.json());
  app.use(cookieParser());

  // Custom middleware to validate API key for no-origin requests in production
  // app.use((req, res, next) => {
  //   // Only check for no-origin requests in production
  //   if (process.env.NODE_ENV === 'production' && !req.get('Origin')) {
  //     const apiKey = req.get('X-API-Key');
  //     if (!apiKey || apiKey !== process.env.API_KEY) {
  //       return res
  //         .status(403)
  //         .json({ error: 'No origin or invalid API key in production' });
  //     }
  //   }
  //   next();
  // });

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Handle no-origin requests
        if (!origin) {
          if (process.env.NODE_ENV === 'production') {
            // In production, require an API key for no-origin requests
            // Allow requests with no origin in development (e.g., curl, Postman)
            // mobile and curl and other origin less tools can
            // send a unique task-management-header to bypass the API key check
            // browsers will always send origin headers
            // uncomment above middleware to enable this
            if (!origin && process.env.NODE_ENV !== 'production') {
              return callback(null, true);
            }
            return callback(
              new Error('No origin or invalid API key in production')
            );
          }
          // Allow no-origin requests in development
          return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true, // Allow credentials (cookies, authorization headers)
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
    })
  );

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
