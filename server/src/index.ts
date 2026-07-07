import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { settingsRouter } from './routes/settings.js';
import { processesRouter } from './routes/processes.js';
import { shiftsRouter } from './routes/shifts.js';
import { ApiResponse } from 'shared';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/processes', processesRouter);
app.use('/api/shifts', shiftsRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  const response: ApiResponse = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
    },
  };
  res.status(500).json(response);
});

app.listen(PORT, () => {
  console.log(`[Server] Worker Shift Tracker running on http://localhost:${PORT}`);
});
