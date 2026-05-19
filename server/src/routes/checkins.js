import express from 'express';
import { supabase } from '../config/supabase.js';
import { computeScore } from '../services/scoreService.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();

async function resolveUser(clerkUserId) {
  const { data } = await supabase.from('users').select('*').eq('clerk_user_id', clerkUserId).single();
  return data;
}

async function getTeamIds(managerId) {
  const { data } = await supabase.from('users').select('id').eq('manager_id', managerId);
  return (data || []).map((u) => u.id);
}

async function activePhase() {
  const { data: cycle } = await supabase.from('cycles').select('*').eq('is_active', true).single();
  if (!cycle) return { cycle: null, phase: 'NOT_STARTED' };
  const today = new Date();
  const phase =
    today >= new Date(cycle.q4_opens) ? 'Q4' :
    today >= new Date(cycle.q3_opens) ? 'Q3' :
    today >= new Date(cycle.q2_opens) ? 'Q2' :
    today >= new Date(cycle.q1_opens) ? 'Q1' :
    today >= new Date(cycle.goal_setting_opens) ? 'GOAL_SETTING' : 'NOT_STARTED';
  return { cycle, phase };
}

router.post('/', requireRole('employee'), async (req, res, next) => {
  try {
    const actor = await resolveUser(req.auth.userId);
    const { phase } = await activePhase();
    if (!['Q1', 'Q2', 'Q3', 'Q4'].includes(phase)) {
      return res.status(400).json({ message: 'Check-in window is closed' });
    }

    const { goal_id, actual_achievement, actual_date, progress_status } = req.body;
    const { data: goal, error: goalErr } = await supabase.from('goals').select('*').eq('id', goal_id).single();
    if (goalErr || !goal) return res.status(404).json({ message: 'Goal not found' });
    if (goal.employee_id !== actor.id) return res.status(403).json({ message: 'Not your goal' });

    const quarter = phase;
    const score = computeScore(
      goal.uom_type,
      Number(goal.target || 0),
      Number(actual_achievement || 0),
      goal.target_date,
      actual_date
    );

    const payload = {
      goal_id,
      quarter,
      actual_achievement,
      actual_date,
      progress_status,
      checked_in_at: new Date().toISOString(),
      score
    };

    const { data, error } = await supabase.from('checkins').upsert(payload, { onConflict: 'goal_id,quarter' }).select().single();
    if (error) throw error;

    if (goal.shared_from === null) {
      const { data: linked } = await supabase.from('goals').select('id').eq('shared_from', goal.id);
      for (const lg of linked || []) {
        await supabase.from('checkins').upsert(
          { ...payload, goal_id: lg.id },
          { onConflict: 'goal_id,quarter' }
        );
      }
    }

    res.status(201).json({ ...data, progressScore: score });
  } catch (e) {
    next(e);
  }
});

router.get('/', requireRole('employee', 'manager', 'admin'), async (req, res, next) => {
  try {
    // Rely on Supabase RLS policies for filtering (prevents brittle manager_id-based team logic).
    let query = supabase.from('checkins').select('*');

    if (req.query.goal_id) query = query.eq('goal_id', req.query.goal_id);
    if (req.query.quarter) query = query.eq('quarter', req.query.quarter);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (e) {
    next(e);
  }
});

router.put('/:id/comment', requireRole('manager', 'admin'), async (req, res, next) => {
  try {
    const { data: checkin, error: cErr } = await supabase.from('checkins').select('*, goals(*)').eq('id', req.params.id).single();
    if (cErr || !checkin) return res.status(404).json({ message: 'Check-in not found' });

    const { data, error } = await supabase
      .from('checkins')
      .update({ manager_comment: req.body.manager_comment, manager_checked_in_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ message: 'Save failed', detail: error.message });
    res.json(data);
  } catch (e) {
    return res.status(500).json({ message: 'Save failed', detail: e?.message || String(e) });
  }
});

router.get('/team', requireRole('manager'), async (req, res, next) => {
  try {
    // Rely on Supabase RLS policies for filtering.
    const { data, error } = await supabase
      .from('checkins')
      .select('*, goals(*), users:goals!inner(employee_id)(id,full_name,email,department)');

    if (error) throw error;
    res.json(data || []);
  } catch (e) {
    next(e);
  }
});

router.get('/completion', requireRole('admin'), async (req, res, next) => {
  try {
    const { phase } = await activePhase();
    const { data: users } = await supabase.from('users').select('id,full_name,role,department,manager_id');
    const { data: checkins } = await supabase.from('checkins').select('id,goal_id,quarter,checked_in_at,manager_checked_in_at');
    res.json({ phase, users: users || [], checkins: checkins || [] });
  } catch (e) {
    next(e);
  }
});

export default router;

