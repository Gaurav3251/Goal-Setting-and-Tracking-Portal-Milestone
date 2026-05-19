import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();

function getActivePhase(cycle) {
  const today = new Date();
  if (today >= new Date(cycle.q4_opens)) return 'Q4';
  if (today >= new Date(cycle.q3_opens)) return 'Q3';
  if (today >= new Date(cycle.q2_opens)) return 'Q2';
  if (today >= new Date(cycle.q1_opens)) return 'Q1';
  if (today >= new Date(cycle.goal_setting_opens)) return 'GOAL_SETTING';
  return 'NOT_STARTED';
}

router.post('/', requireRole('admin'), async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('cycles').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { next(e); }
});

router.get('/active', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('cycles').select('*').eq('is_active', true).single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return res.json({ cycle: null, phase: 'NOT_STARTED' });
    res.json({ cycle: data, phase: getActivePhase(data) });
  } catch (e) { next(e); }
});

router.put('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('cycles').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});

export default router;
