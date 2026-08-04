import { Router } from 'express';
import { authRouter } from './auth.routes';
import { eventRouter } from './event.routes';
import { attendanceRouter } from './attendance.routes';
import { userRouter } from './user.routes';

export const apiRouter = Router();

// Health Check
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'AttendEase',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// API Sub-routes
apiRouter.use('/auth', authRouter);
apiRouter.use('/', eventRouter);
apiRouter.use('/attendance', attendanceRouter);
apiRouter.use('/users', userRouter);
