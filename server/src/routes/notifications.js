import express from 'express';
import { requireRole } from '../middleware/requireRole.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();
router.post('/test', requireRole('admin'), async (req, res, next) => {
  try {
    const result = await sendEmail({
      to: req.body.to || 'admin@demo.com',
      subject: 'Milestone test email',
      html: '<h2>Milestone Notification Test</h2><p>Email pipeline is working.</p>'
    });
    res.json({ ok: true, result });
  } catch (e) { next(e); }
});
export default router;
