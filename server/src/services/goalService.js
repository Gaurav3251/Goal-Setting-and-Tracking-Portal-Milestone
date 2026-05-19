import { supabase } from '../config/supabase.js';

export async function logAudit({ table_name, record_id, changed_by, action, old_value, new_value }) {
  await supabase.from('audit_logs').insert({ table_name, record_id, changed_by, action, old_value, new_value });
}

export async function ensureGoalEditable(goal, role) {
  if (!goal) throw new Error('Goal not found');
  if (goal.status === 'locked' && role !== 'admin') throw new Error('Goal is locked');
}
