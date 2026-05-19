import { useEffect, useState } from 'react';
import { useGoals } from '../../hooks/useGoals';
import api from '../../api';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['Sales', 'Marketing', 'Operations', 'Finance', 'HR', 'Quality', 'Engineering', 'Leadership'];

export default function ManagerDashboard() {
  const { data } = useGoals('/goals/team');
  const [profile, setProfile] = useState({ role: 'manager', department: 'Sales' });

  useEffect(() => {
    api.get('/api/users/me').then((res) => {
      if (res.data) {
        setProfile({ role: res.data.role || 'manager', department: res.data.department || 'Sales' });
      }
    }).catch(() => {});
  }, []);

  const saveProfile = async () => {
    try {
      await api.post('/api/users/self-sync', profile);
      toast.success('Profile updated');
    } catch {
      toast.error('Profile update failed');
    }
  };

  const pending = data.filter((g) => g.status === 'submitted').length;

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl">Manager Dashboard</h1>

      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold">My Profile</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <input className="rounded border bg-slate-100 p-2" value="manager" disabled />
          <select className="rounded border p-2" value={profile.department} onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))}>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <button className="rounded bg-brand-600 px-3 py-2 text-white" onClick={saveProfile}>Save Profile</button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">{[['Team Goals', data.length], ['Pending Approval', pending], ['Check-ins Outstanding', data.length - pending]].map(([k,v]) => <div key={k} className="rounded border bg-white p-4"><div className="text-sm text-muted">{k}</div><div className="text-2xl font-bold">{v}</div></div>)}</div>
    </div>
  );
}
