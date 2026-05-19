import { useEffect, useState } from 'react';
import api from '../../api';

export default function CompletionDashboard() {
  const [state, setState] = useState({ users: [], checkins: [], phase: 'NOT_STARTED' });
  useEffect(() => { api.get('/api/checkins/completion').then((r) => setState(r.data)); }, []);
  const completeIds = new Set((state.checkins || []).filter((c) => c.checked_in_at).map((c) => c.goal_id));
  return <div className="space-y-3"><h1 className="font-display text-2xl">Completion Dashboard</h1><p className="text-sm text-muted">Active phase: {state.phase}</p><div className="grid gap-3 md:grid-cols-3">{(state.users || []).map((u) => { const done = completeIds.has(u.id); const color = done ? 'bg-emerald-100' : 'bg-amber-100'; return <div key={u.id} className={`rounded border p-3 ${color}`}><div className="font-semibold">{u.full_name}</div><div className="text-sm">{done ? 'Complete' : 'Partial/Not started'}</div></div>; })}</div></div>;
}
