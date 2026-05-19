import { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { SkeletonTable } from '../../components/Skeletons';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState({ role: 'employee' });
  const [tempPassword, setTempPassword] = useState('');

  const managers = useMemo(() => users.filter((u) => u.role === 'manager'), [users]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/users');
      setUsers(r.data || []);
    } catch {
      setUsers([]);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const inviteUser = async () => {
    try {
      const res = await api.post('/api/users/invite', invite);
      setTempPassword(res.data?.tempPassword || '');
      toast.success('User invited and provisioned');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Invite failed');
    }
  };

  const syncClerkDeletions = async () => {
    try {
      const res = await api.post('/api/users/sync-clerk');
      toast.success(`Synced. Removed ${res.data?.removedCount || 0} stale users.`);
      load();
    } catch {
      toast.error('Sync failed');
    }
  };

  // Admin profile deletions removed. Use Clerk sync deletions instead.

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">User Management</h1>
        <button className="rounded border px-3 py-2" onClick={syncClerkDeletions}>Sync Clerk Deletions</button>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold">Invite User (Clerk + Portal Sync)</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <input className="rounded border p-2" placeholder="Full Name" onChange={(e) => setInvite((f) => ({ ...f, full_name: e.target.value }))} />
          <input className="rounded border p-2" placeholder="Email" onChange={(e) => setInvite((f) => ({ ...f, email: e.target.value }))} />
          <input className="rounded border p-2" placeholder="Department" onChange={(e) => setInvite((f) => ({ ...f, department: e.target.value }))} />
          <select className="rounded border p-2" onChange={(e) => setInvite((f) => ({ ...f, role: e.target.value }))}>
            <option value="employee">employee</option>
            <option value="manager">manager</option>
            <option value="admin">admin</option>
          </select>
          <select className="rounded border p-2" onChange={(e) => setInvite((f) => ({ ...f, manager_id: e.target.value || null }))}>
            <option value="">Manager (for employee)</option>
            {managers.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
          </select>
          <button className="rounded bg-brand-600 px-3 py-2 text-white" onClick={inviteUser}>Invite & Provision</button>
        </div>
        {tempPassword ? <p className="mt-3 rounded bg-amber-50 p-2 text-sm text-amber-700">Temporary password (share securely): <strong>{tempPassword}</strong></p> : null}
      </div>

      {loading ? <SkeletonTable rows={6} cols={5} /> : (
        <div className="overflow-x-auto rounded border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr><th className="p-2 text-left">Name</th><th>Email</th><th>Role</th><th>Department</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr className="border-t" key={u.id}>
                  <td className="p-2">{u.full_name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
