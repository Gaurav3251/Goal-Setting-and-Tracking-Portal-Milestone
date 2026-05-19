import { verifyToken } from '../config/clerk.js';
import { supabase } from '../config/supabase.js';

async function resolveRoleFromDb(clerkUserId) {
  if (!clerkUserId) return null;
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();
  return data?.role || null;
}

export async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing token' });

    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    const tokenRole = payload?.public_metadata?.role || payload?.role || payload?.metadata?.role || null;
    const dbRole = await resolveRoleFromDb(payload.sub);

    req.auth = {
      userId: payload.sub,
      role: dbRole || tokenRole || 'employee'
    };

    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}
