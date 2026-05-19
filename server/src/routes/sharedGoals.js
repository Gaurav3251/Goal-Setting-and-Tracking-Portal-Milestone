import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();

router.post('/', requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    const { source_goal_id, employee_ids } = req.body;
    const { data: source, error: sourceErr } = await supabase.from('goals').select('*').eq('id', source_goal_id).single();
    if (sourceErr) throw sourceErr;
    const records = (employee_ids || []).map((employee_id) => ({
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
