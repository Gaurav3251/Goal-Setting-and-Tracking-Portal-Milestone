import { supabase } from '../config/supabase.js';
import { sendEmail } from './emailService.js';

export async function runEscalations() {
  const now = new Date().toISOString();
  const { data: overdue } = await supabase.from('goals').select('id,employee_id,title,status,created_at').in('status', ['draft', 'submitted']);
  for (const g of overdue || []) {
    await supabase.from('escalation_logs').insert({ user_id: g.employee_id, type: g.status === 'draft' ? 'goal_not_submitted' : 'goal_not_approved', triggered_at: now });
  }
  await sendEmail({ to: 'admin@demo.com', subject: 'Escalation digest', html: '<p>Escalation cron completed.</p>' });
}
