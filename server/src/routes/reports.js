import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();

router.get('/achievement', requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('id,title,target,uom_type,weightage,users:employee_id(full_name,department),checkins(actual_achievement,quarter,score)');
    if (error) throw error;
    res.json(data || []);
  } catch (e) {
    next(e);
  }
});

router.get('/analytics', requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    const { data: users, error: usersErr } = await supabase
      .from('users')
      .select('id,full_name,role,manager_id');
    if (usersErr) throw usersErr;

    const { data: goals, error: goalsErr } = await supabase
      .from('goals')
      .select('id,employee_id,thrust_area,status');
    if (goalsErr) throw goalsErr;

    const { data: checkins, error: checkinsErr } = await supabase
      .from('checkins')
      .select('goal_id,quarter,score,checked_in_at');
    if (checkinsErr) throw checkinsErr;

    const goalById = new Map((goals || []).map((g) => [g.id, g]));

    const qMap = new Map([
      ['Q1', { quarter: 'Q1', scoreSum: 0, count: 0 }],
      ['Q2', { quarter: 'Q2', scoreSum: 0, count: 0 }],
      ['Q3', { quarter: 'Q3', scoreSum: 0, count: 0 }],
      ['Q4', { quarter: 'Q4', scoreSum: 0, count: 0 }]
    ]);

    for (const c of checkins || []) {
      const slot = qMap.get(c.quarter);
      if (!slot) continue;
      slot.scoreSum += Number(c.score || 0);
      slot.count += 1;
    }

    const trend = [...qMap.values()].map((x) => ({
      quarter: x.quarter,
      averageScore: x.count ? Math.round(x.scoreSum / x.count) : 0,
      checkinCount: x.count
    }));

    const thrustMap = new Map();
    for (const g of goals || []) {
      const key = g.thrust_area || 'Unknown';
      thrustMap.set(key, (thrustMap.get(key) || 0) + 1);
    }
    const distribution = [...thrustMap.entries()].map(([name, value]) => ({ name, value }));

    const managerEffectiveness = [];
    const managers = (users || []).filter((u) => u.role === 'manager');
    const employees = (users || []).filter((u) => u.role === 'employee');

    for (const m of managers) {
      const teamIds = employees.filter((e) => e.manager_id === m.id).map((e) => e.id);
      const teamGoalIds = (goals || []).filter((g) => teamIds.includes(g.employee_id)).map((g) => g.id);
      const teamCheckins = (checkins || []).filter((c) => teamGoalIds.includes(c.goal_id));
      const completed = teamCheckins.filter((c) => Boolean(c.checked_in_at)).length;
      const total = teamCheckins.length;
      managerEffectiveness.push({
        manager: m.full_name,
        completionRate: total ? Math.round((completed / total) * 100) : 0,
        totalCheckins: total
      });
    }

    res.json({
      trend,
      distribution,
      managerEffectiveness
    });
  } catch (e) {
    next(e);
  }
});

export default router;
