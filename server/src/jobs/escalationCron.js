import cron from 'node-cron';
import { runEscalations } from '../services/escalationService.js';

export function startEscalationCron() {
  cron.schedule('0 8 * * *', async () => {
    await runEscalations();
  });
}
