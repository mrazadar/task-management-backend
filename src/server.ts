import express from 'express';
import cors from 'cors';
import env from 'dotenv';

env.config();

const app = express();

const server = () => {
  app.use(cors());

  app.use(express.json());

  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
  });
};

server();
