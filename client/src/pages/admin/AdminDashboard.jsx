import { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    goals: 0,
    locked: 0,
    escalations: 0
  });

  useEffect(() => {
    Promise.all([api.get('/api/users'), api.get('/api/goals'), api.get('/api/audit')]).then(([u, g, a]) => {
      const users = u.data || [];
      const goals = g.data || [];
      const employees = users.filter((user) => user.role === 'employee').length;

      setStats({
        employees,
        goals: goals.length,
        locked: goals.filter((x) => x.status === 'locked').length,
        escalations: (a.data || []).filter((x) => x.action === 'UNLOCK').length
      });
    });
  }, []);

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl">Admin Dashboard</h1>
      <div className="grid gap-3 md:grid-cols-4">
        {[
          ['Total Employees', stats.employees],
          ['Total Goals', stats.goals],
          ['Approval Rate', `${Math.round((stats.locked / Math.max(stats.goals, 1)) * 100)}%`],
          ['Escalated Items', stats.escalations]
        ].map(([k, v]) => (
          <div key={k} className="rounded border bg-white p-4">
            <div className="text-sm text-muted">{k}</div>
            <div className="text-2xl font-bold">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
