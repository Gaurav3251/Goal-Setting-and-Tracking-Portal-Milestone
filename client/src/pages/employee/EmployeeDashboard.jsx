import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGoals } from '../../hooks/useGoals';
import { useCycle } from '../../hooks/useCycle';
import api from '../../api';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';

const DEPARTMENTS = ['Sales', 'Marketing', 'Operations', 'Finance', 'HR', 'Quality', 'Engineering', 'Leadership'];

export default function EmployeeDashboard() {
  const { data: goals, loading } = useGoals('/goals');
  const { phase } = useCycle();
  const [profile, setProfile] = useState({ department: 'Sales' });

  const approved = goals.filter((g) => g.status === 'locked').length;
  const submitted = goals.filter((g) => g.status === 'submitted').length;

  useEffect(() => {
    api.get('/api/users/me').then((res) => {
      if (res.data) {
        setProfile({ department: res.data.department || 'Sales' });
      }
    }).catch(() => {});
  }, []);

  const saveProfile = async () => {
    try {
      await api.post('/api/users/self-sync', { department: profile.department });
      toast.success('Department updated');
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">Employee Dashboard</h1>
      <div className="rounded bg-brand-50 p-3 text-sm">Active cycle phase: <strong>{phase}</strong></div>

      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold">My Profile</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <select className="rounded border p-2" value={profile.department} onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))}>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="rounded border bg-slate-50 px-3 py-2 text-sm text-slate-600">Role is managed by Admin</div>
          <button className="rounded bg-brand-600 px-3 py-2 text-white" onClick={saveProfile}>Save Profile</button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">{[
        ['Total Goals', goals.length],
        ['Approved Goals', approved],
        ['Pending Approval', submitted],
        ['Current Quarter Score', `${Math.round((approved / Math.max(goals.length,1))*100)}%`]
      ].map(([k,v]) => <div key={k} className="rounded border bg-white p-3"><div className="text-sm text-muted">{k}</div><div className="text-xl font-bold">{v}</div></div>)}</div>
      <div className="flex gap-2"><Link to="/employee/goals/create" className="rounded bg-brand-600 px-3 py-2 text-white">Create Goal</Link><Link to="/employee/goals" className="rounded border px-3 py-2">Update Achievement</Link></div>
      <div className="overflow-x-auto rounded border bg-white">
        <table className="min-w-full text-sm"><thead className="bg-slate-100"><tr><th className="p-2 text-left">Goal</th><th>Status</th></tr></thead><tbody>{loading ? <tr><td className="p-2" colSpan="2"><div className="h-6 animate-pulse rounded bg-slate-200"/></td></tr> : goals.map((g) => <tr className="border-t" key={g.id}><td className="p-2">{g.title}</td><td><StatusBadge status={g.status} /></td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
