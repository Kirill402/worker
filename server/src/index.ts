import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRouter } from './routes/auth.js';
import { settingsRouter } from './routes/settings.js';
import { processesRouter } from './routes/processes.js';
import { shiftsRouter } from './routes/shifts.js';
import { ApiResponse } from 'shared';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/processes', processesRouter);
app.use('/api/shifts', shiftsRouter);

// Serve static React production bundle
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

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

// Fallback all other routes to React router index.html
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Server] Worker Shift Tracker running on http://localhost:${PORT}`);
});
