import { useEffect, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';

export default function CycleManagement() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});

  const load = async () => {
    try {
      const r = await api.get('/api/cycles/active');
      setRows(r.data?.cycle ? [r.data.cycle] : []);
    } catch {
      setRows([]);
      toast.error('Failed to load cycles');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    try {
      await api.post('/api/cycles', form);
      toast.success('Cycle created');
      load();
    } catch {
      toast.error('Create failed');
    }
  };

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl">Cycle Management</h1>

      <div className="grid gap-3 md:grid-cols-3">
        {/* name */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Cycle name</label>
          <input
            type="text"
            placeholder="e.g. Cycle 1"
            className="rounded border p-2"
            value={form.name || ''}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        {/* goal_setting_opens */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Goal setting opens</label>
          <input
            type="date"
            className="rounded border p-2"
            value={form.goal_setting_opens || ''}
            onChange={(e) => setForm((f) => ({ ...f, goal_setting_opens: e.target.value }))}
          />
          <p className="text-xs text-slate-500">When employees can start creating goals.</p>
        </div>

        {/* q1_opens */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Q1 opens</label>
          <input
            type="date"
            className="rounded border p-2"
            value={form.q1_opens || ''}
            onChange={(e) => setForm((f) => ({ ...f, q1_opens: e.target.value }))}
          />
          <p className="text-xs text-slate-500">When the portal enters Q1.</p>
        </div>

        {/* q2_opens */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Q2 opens</label>
          <input
            type="date"
            className="rounded border p-2"
            value={form.q2_opens || ''}
            onChange={(e) => setForm((f) => ({ ...f, q2_opens: e.target.value }))}
          />
          <p className="text-xs text-slate-500">When the portal enters Q2.</p>
        </div>

        {/* q3_opens */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Q3 opens</label>
          <input
            type="date"
            className="rounded border p-2"
            value={form.q3_opens || ''}
            onChange={(e) => setForm((f) => ({ ...f, q3_opens: e.target.value }))}
          />
          <p className="text-xs text-slate-500">When the portal enters Q3.</p>
        </div>

        {/* q4_opens */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Q4 opens</label>
          <input
            type="date"
            className="rounded border p-2"
            value={form.q4_opens || ''}
            onChange={(e) => setForm((f) => ({ ...f, q4_opens: e.target.value }))}
          />
          <p className="text-xs text-slate-500">When the portal enters Q4.</p>
        </div>
      </div>

      <button onClick={create} className="rounded bg-brand-600 px-3 py-2 text-white">
        Create Cycle
      </button>

      {/* Optional: show only whether an active cycle exists, not raw JSON */}
      <div className="text-sm text-slate-600">
        {rows?.length ? 'Active cycle loaded for this admin view.' : 'No active cycle configured.'}
      </div>
    </div>
  );
}
