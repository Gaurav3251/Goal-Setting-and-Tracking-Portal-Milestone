import express from 'express';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors.js';
import { auth } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import goalsRoutes from './routes/goals.js';
import checkinsRoutes from './routes/checkins.js';
import usersRoutes from './routes/users.js';
import cyclesRoutes from './routes/cycles.js';
import reportsRoutes from './routes/reports.js';
import auditRoutes from './routes/audit.js';
import notificationsRoutes from './routes/notifications.js';
import sharedGoalsRoutes from './routes/sharedGoals.js';
import { startEscalationCron } from './jobs/escalationCron.js';

dotenv.config();

const app = express();
app.use(corsMiddleware);
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, app: 'milestone-api' }));

app.use('/api', auth);
app.use('/api/goals', goalsRoutes);
app.use('/api/checkins', checkinsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cycles', cyclesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/sharedGoals', sharedGoalsRoutes);

app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  startEscalationCron();
  console.log(`Milestone API running on ${port}`);
});

