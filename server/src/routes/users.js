import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireRole } from '../middleware/requireRole.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

function generateTempPassword() {
  const seed = Math.random().toString(36).slice(-6);
  return `Ms@${Date.now().toString().slice(-6)}${seed}A!`;
}

function splitName(fullName = '') {
  const parts = fullName.trim().split(/\s+/);
  const first_name = parts.shift() || 'User';
  const last_name = parts.join(' ') || 'Account';
  return { first_name, last_name };
}

async function clerkCreateUser({ email, full_name, role }) {
  const { first_name, last_name } = splitName(full_name);
  const tempPassword = generateTempPassword();

  const response = await fetch('https://api.clerk.com/v1/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
    },
    body: JSON.stringify({
      email_address: [email],
      first_name,
      last_name,
      password: tempPassword,
      skip_password_checks: true,
      public_metadata: { role, force_password_reset: true }
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    const msg = payload?.errors?.[0]?.message || payload?.message || 'Failed to create Clerk user';
    throw new Error(msg);
  }

  return { clerkUserId: payload.id, tempPassword };
}

async function clerkUpdateRole(clerkUserId, role) {
  const response = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}/metadata`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
    },
    body: JSON.stringify({ public_metadata: { role, force_password_reset: true } })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const msg = payload?.errors?.[0]?.message || payload?.message || 'Failed to update Clerk metadata';
    throw new Error(msg);
  }
}

async function clerkDeleteUser(clerkUserId) {
  const response = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` }
  });
  return response.ok;
}

async function clerkUserExists(clerkUserId) {
  const response = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` }
  });
  if (response.status === 404) return false;
  return response.ok;
}

async function sendWelcomeCredentialsEmail({ email, fullName, tempPassword }) {
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
      <h2 style="margin:0 0 12px;color:#1e293b;">Welcome to Milestone</h2>
      <p style="color:#334155;">Hi ${fullName}, your account has been created.</p>
      <p style="color:#334155;"><strong>Email:</strong> ${email}</p>
      <p style="color:#334155;"><strong>Temporary Password:</strong> ${tempPassword}</p>
      <p style="color:#334155;">Please sign in and change your password immediately.</p>
      <a href="${loginUrl}" style="display:inline-block;background:#1d4ed8;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;">Sign In to Milestone</a>
    </div>
  `;

  await sendEmail({ to: email, subject: 'Welcome to Milestone - Your Account Details', html });
}

router.get('/', requireRole('admin'), async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (e) {
    next(e);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('clerk_user_id', req.auth.userId).maybeSingle();
    if (error) throw error;
    res.json(data || null);
  } catch (e) {
    next(e);
  }
});

router.post('/self-sync', async (req, res, next) => {
  try {
    const { full_name, email, role, department } = req.body;
    const safeRole = role && ['employee', 'manager', 'admin'].includes(role) ? role : (req.auth.role || 'employee');

    const { data: existing } = await supabase.from('users').select('*').eq('clerk_user_id', req.auth.userId).maybeSingle();

    if (!existing) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          clerk_user_id: req.auth.userId,
          full_name: full_name || 'New User',
          email: email || `${req.auth.userId}@unknown.local`,
          role: safeRole,
          department: department || null
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    const patch = {
      full_name: full_name || existing.full_name,
      email: email || existing.email,
      department: department !== undefined ? department : existing.department
    };

    if (!existing.role && safeRole) {
      patch.role = safeRole;
    }

    const { data, error } = await supabase.from('users').update(patch).eq('id', existing.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.post('/sync-clerk', requireRole('admin'), async (req, res, next) => {
  try {
    const { data: users, error } = await supabase.from('users').select('*');
    if (error) throw error;

    const removed = [];
    for (const user of users || []) {
      if (!user.clerk_user_id) continue;
      const exists = await clerkUserExists(user.clerk_user_id);
      if (!exists) {
        await supabase.from('users').delete().eq('id', user.id);
        removed.push({ id: user.id, email: user.email, clerk_user_id: user.clerk_user_id });
      }
    }

    res.json({ removedCount: removed.length, removed });
  } catch (e) {
    next(e);
  }
});

router.post('/invite', requireRole('admin'), async (req, res, next) => {
  try {
    const { full_name, email, role, manager_id, department } = req.body;
    if (!full_name || !email || !role) {
      return res.status(400).json({ message: 'full_name, email, role are required' });
    }
    if (!['employee', 'manager', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (existing) return res.status(409).json({ message: 'User already exists in portal' });

    let clerkUserId;
    let tempPassword;

    try {
      const created = await clerkCreateUser({ email, full_name, role });
      clerkUserId = created.clerkUserId;
      tempPassword = created.tempPassword;
    } catch (e) {
      return res.status(400).json({ message: `Clerk provisioning failed: ${e.message}` });
    }

    const { data, error } = await supabase
      .from('users')
      .insert({ clerk_user_id: clerkUserId, full_name, email, role, manager_id: manager_id || null, department: department || null })
      .select()
      .single();

    if (error) {
      await clerkDeleteUser(clerkUserId);
      throw error;
    }

    await sendWelcomeCredentialsEmail({ email, fullName: full_name, tempPassword }).catch(() => {});

    res.status(201).json({ user: data, tempPassword });
  } catch (e) {
    next(e);
  }
});

router.post('/', requireRole('admin'), async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('users').insert(req.body).select().single();
    if (error) throw error;
    if (data?.clerk_user_id && data?.role) {
      await clerkUpdateRole(data.clerk_user_id, data.role).catch(() => {});
    }
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const { data: before } = await supabase.from('users').select('*').eq('id', req.params.id).single();
    const { data, error } = await supabase.from('users').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;

    if (data?.clerk_user_id && req.body.role && req.body.role !== before?.role) {
      await clerkUpdateRole(data.clerk_user_id, req.body.role).catch(() => {});
    }

    res.json(data);
  } catch (e) {
    next(e);
  }
});

/**
 * NOTE:
 * Admin-initiated profile deletions have been removed.
 * User records can only be removed via Clerk sync deletions (/sync-clerk),
 * where stale users (missing in Clerk) are deleted automatically.
 */

export default router;
