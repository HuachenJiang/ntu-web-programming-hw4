import cors from 'cors';
import express from 'express';
import { corsOrigins } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { authRoutes } from './routes/authRoutes';
import { eventRoutes } from './routes/eventRoutes';
import { healthRoutes } from './routes/healthRoutes';
import { locationRoutes } from './routes/locationRoutes';
import { postRoutes } from './routes/postRoutes';

const app = express();

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/posts', postRoutes);

app.use(notFound);
app.use(errorHandler);

export { app };
