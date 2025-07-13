import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// middlewares
// app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Get Version
app.get('/api/version', (req: express.Request, res: express.Response) => {
  res.status(200).json({ version: process.env.npm_package_version });
});

// Start server
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
/**
 * @description Entry point for the Node.js/Express server.
 * @reference https://expressjs.com/en/starter/hello-world.html
 * @reference https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-oop.html
 * @linting ESLint with Airbnb TypeScript rules ensures code consistency.
 */
