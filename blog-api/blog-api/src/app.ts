
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { authRouter } from './routes/auth.routes';
import { commentsRouter } from './routes/comments.routes';
import { postsRouter } from './routes/posts.routes';
import { taxonomyRouter } from './routes/taxonomy.routes';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());

  const configuredOrigins =
    env.CORS_ORIGIN === '*'
      ? ['*']
      : env.CORS_ORIGIN.split(',').map((origin) => origin.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          configuredOrigins.includes('*') ||
          configuredOrigins.includes(origin)
        ) {
          return callback(null, true);
        }

        return callback(
          new Error(`Origin not allowed by CORS: ${origin}`),
        );
      },
      methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      optionsSuccessStatus: 204,
    }),
  );

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok' } });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/posts', postsRouter);
  app.use('/api/posts', commentsRouter);
  app.use('/api', taxonomyRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

const app = createApp();

export default app;
