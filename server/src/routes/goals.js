import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireRole } from '../middleware/requireRole.js';
import { ensureGoalEditable, logAudit } from '../services/goalService.js';

const router = express.Router();

async function resolveUser(clerkUserId) {
  const { data } = await supabase.from('users').select('*').eq('clerk_user_id', clerkUserId).single();
  return data;
}

async function getTeamIds(managerId) {
  const { data } = await supabase.from('users').select('id').eq('manager_id', managerId);
  return (data || []).map((u) => u.id);
}

function sanitizeGoalPatch(goal, patch, role) {
  const next = { ...patch };
  if (goal.is_shared && goal.shared_from) {
    delete next.title;
    delete next.target;
    delete next.target_date;
  }
  if (role === 'manager') {
    const allowed = ['target', 'target_date', 'weightage', 'description', 'thrust_area'];
    Object.keys(next).forEach((k) => {
      if (!allowed.includes(k)) delete next[k];
    });
  }
  return next;
}

router.post('/', requireRole('employee', 'admin'), async (req, res, next) => {
  try {
    const actor = await resolveUser(req.auth.userId);
    const payload = req.body;
    if ((payload.weightage || 0) < 10) return res.status(400).json({ message: 'Weightage must be >= 10' });
    if (!payload.cycle_id) return res.status(400).json({ message: 'cycle_id is required' });

    const { data: existingAll } = await supabase
      .from('goals')
      .select('id')
      .eq('employee_id', actor.id)
      .eq('cycle_id', payload.cycle_id);
    if ((existingAll || []).length >= 8) return res.status(400).json({ message: 'Maximum 8 goals allowed' });

    const { data, error } = await supabase.from('goals').insert({ ...payload, employee_id: actor.id }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const actor = await resolveUser(req.auth.userId);
    let query = supabase.from('goals').select('*');

    // Let RLS determine manager visibility; only narrow for employees.
    if (req.auth.role === 'employee') {
      query = query.eq('employee_id', actor.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (e) {
    next(e);
  }
});

router.get('/team', requireRole('manager'), async (req, res, next) => {
  try {
    // Let RLS determine which employees belong to this manager.
    const { data, error } = await supabase
      .from('goals')
      .select('*, users:employee_id(id,full_name,email,department)');
    if (error) throw error;
    res.json(data || []);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', requireRole('employee', 'manager', 'admin'), async (req, res, next) => {
  try {
    const actor = await resolveUser(req.auth.userId);
    const { data: goal, error: goalErr } = await supabase.from('goals').select('*').eq('id', req.params.id).single();
    if (goalErr || !goal) return res.status(404).json({ message: 'Goal not found' });

    if (req.auth.role === 'employee' && goal.employee_id !== actor.id) {
      return res.status(403).json({ message: 'Not your goal' });
    }
    if (req.auth.role === 'manager') {
      const teamIds = await getTeamIds(actor.id);
      if (!teamIds.includes(goal.employee_id)) {
        return res.status(403).json({ message: 'Goal is not in your team' });
      }
    }

    await ensureGoalEditable(goal, req.auth.role);

    const safePatch = sanitizeGoalPatch(goal, req.body, req.auth.role);
    if (safePatch.weightage !== undefined && Number(safePatch.weightage) < 10) {
      return res.status(400).json({ message: 'Weightage must be >= 10' });
    }

    if (goal.status === 'locked') {
      await logAudit({
        table_name: 'goals',
        record_id: goal.id,
        changed_by: actor.id,
        action: 'UPDATE',
        old_value: goal,
        new_value: safePatch
      });
    }

    const { data, error } = await supabase
      .from('goals')
      .update({ ...safePatch, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.post('/:id/submit', requireRole('employee'), async (req, res, next) => {
  try {
    const actor = await resolveUser(req.auth.userId);
    const { data: goal, error: goalErr } = await supabase.from('goals').select('*').eq('id', req.params.id).single();
    if (goalErr || !goal) return res.status(404).json({ message: 'Goal not found' });
    if (goal.employee_id !== actor.id) return res.status(403).json({ message: 'Not your goal' });

    const { data: goals } = await supabase
      .from('goals')
      .select('id,weightage,status')
      .eq('employee_id', goal.employee_id)
      .eq('cycle_id', goal.cycle_id);

    const total = (goals || []).reduce((s, g) => s + Number(g.weightage || 0), 0);
    if (total !== 100) return res.status(400).json({ message: 'Total weightage must be exactly 100 for submission' });

    const { error } = await supabase
      .from('goals')
      .update({ status: 'submitted', updated_at: new Date().toISOString() })
      .eq('employee_id', goal.employee_id)
      .eq('cycle_id', goal.cycle_id)
      .in('status', ['draft', 'returned']);

    if (error) throw error;
    res.json({ message: 'Goal sheet submitted' });
  } catch (e) {
    next(e);
  }
});

/**
 * Delete draft (employee only)
 * - Only draft goals can be deleted
 * - Only the owning employee can delete
 */
router.delete('/:id', requireRole('employee'), async (req, res, next) => {
  try {
    const actor = await resolveUser(req.auth.userId);
    const { data: goal, error: goalErr } = await supabase.from('goals').select('*').eq('id', req.params.id).single();
    if (goalErr || !goal) return res.status(404).json({ message: 'Goal not found' });

    if (goal.employee_id !== actor.id) return res.status(403).json({ message: 'Not your goal' });
    if (goal.status !== 'draft') return res.status(400).json({ message: 'Only draft goals can be deleted' });

    const { error } = await supabase.from('goals').delete().eq('id', req.params.id);
    if (error) throw error;

    res.json({ message: 'Draft deleted' });
  } catch (e) {
    next(e);
  }
});

router.post('/:id/approve', requireRole('manager'), async (req, res, next) => {
  try {
    // Rely on Supabase RLS to enforce manager <-> team visibility.
    const { data: goal, error: goalErr } = await supabase.from('goals').select('*').eq('id', req.params.id).single();
    if (goalErr || !goal) return res.status(404).json({ message: 'Goal not found' });

    const manager_comment = req.body?.manager_comment ?? req.body?.reason ?? null;

    const { data, error } = await supabase
      .from('goals')
      .update({
        status: 'locked',
        manager_comment,
        manager_decided_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      console.error('APPROVE_GOAL_FAILED', {
        goalId: req.params.id,
        manager_comment,
        supabaseError: error
      });
      return res.status(400).json({ message: 'Approve failed', detail: error.message });
    }

    res.json(data);
  } catch (e) {
    console.error('APPROVE_GOAL_EXCEPTION', { goalId: req.params.id, err: e });
    next(e);
  }
});

router.post('/:id/return', requireRole('manager'), async (req, res, next) => {
  try {
    // Rely on Supabase RLS to enforce manager <-> team visibility.
    const { data: goal, error: goalErr } = await supabase.from('goals').select('*').eq('id', req.params.id).single();
    if (goalErr || !goal) return res.status(404).json({ message: 'Goal not found' });

    const manager_comment = req.body?.manager_comment ?? req.body?.reason ?? null;

    const { data, error } = await supabase
      .from('goals')
      .update({
        status: 'returned',
        manager_comment,
        manager_decided_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      console.error('RETURN_GOAL_FAILED', {
        goalId: req.params.id,
        manager_comment,
        supabaseError: error
      });
      return res.status(400).json({ message: 'Return failed', detail: error.message });
    }

    res.json(data);
  } catch (e) {
    console.error('RETURN_GOAL_EXCEPTION', { goalId: req.params.id, err: e });
    next(e);
  }
});

router.post('/:id/unlock', requireRole('admin'), async (req, res, next) => {
  try {
    const actor = await resolveUser(req.auth.userId);
    const { data: goal, error: goalErr } = await supabase.from('goals').select('*').eq('id', req.params.id).single();
    if (goalErr || !goal) return res.status(404).json({ message: 'Goal not found' });

    await logAudit({
      table_name: 'goals',
      record_id: goal.id,
      changed_by: actor.id,
      action: 'UNLOCK',
      old_value: goal,
      new_value: { status: 'draft' }
    });

    const { data, error } = await supabase
      .from('goals')
      .update({ status: 'draft', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.post('/shared', requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    const actor = await resolveUser(req.auth.userId);
    const { source_goal_id, employee_ids } = req.body;
    if (!source_goal_id || !Array.isArray(employee_ids) || employee_ids.length === 0) {
      return res.status(400).json({ message: 'source_goal_id and employee_ids are required' });
    }

    const { data: source, error: sourceErr } = await supabase.from('goals').select('*').eq('id', source_goal_id).single();
    if (sourceErr || !source) return res.status(404).json({ message: 'Source goal not found' });

    if (req.auth.role === 'manager') {
      const teamIds = await getTeamIds(actor.id);
      if (!teamIds.includes(source.employee_id)) {
        return res.status(403).json({ message: 'Source goal not in your team' });
      }
      if (employee_ids.some((id) => !teamIds.includes(id))) {
        return res.status(403).json({ message: 'Recipients must belong to your team' });
      }
    }

    const records = employee_ids.map((employee_id) => ({
      cycle_id: source.cycle_id,
      employee_id,
      thrust_area: source.thrust_area,
      title: source.title,
      description: source.description,
      uom_type: source.uom_type,
      target: source.target,
      target_date: source.target_date,
      weightage: source.weightage,
      status: 'draft',
      is_shared: true,
      shared_from: source.id
    }));

    const { data, error } = await supabase.from('goals').insert(records).select();
    if (error) throw error;
    res.status(201).json(data || []);
  } catch (e) {
    next(e);
  }
});

export default router;
