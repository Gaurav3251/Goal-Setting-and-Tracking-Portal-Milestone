import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();
router.get('/', requireRole('admin'), async (req, res, next) => {
  try {
    let query = supabase.from('audit_logs').select('*').order('changed_at', { ascending: false });
    if (req.query.user) query = query.eq('changed_by', req.query.user);
    if (req.query.action) query = query.eq('action', req.query.action);
    if (req.query.from) query = query.gte('changed_at', req.query.from);
    if (req.query.to) query = query.lte('changed_at', req.query.to);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (e) { next(e); }
});
export default router;
