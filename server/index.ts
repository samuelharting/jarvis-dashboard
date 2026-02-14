import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { overviewRouter } from './routes/overview.js';
import { sourcesRouter } from './routes/sources.js';
import botsRouter from './routes/bots.js';

const app = express();
const PORT = 3031;

// Middleware
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/overview', overviewRouter);
app.use('/api/sources', sourcesRouter);
app.use('/api/bots', botsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});