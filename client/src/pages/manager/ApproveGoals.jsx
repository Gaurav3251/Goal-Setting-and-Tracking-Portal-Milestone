import { useMemo, useState } from 'react';
import { useGoals } from '../../hooks/useGoals';
import api from '../../api';
import toast from 'react-hot-toast';

export default function ApproveGoals() {
  const { data, refetch } = useGoals('/goals/team');
  const pending = useMemo(() => (data || []).filter((g) => g.status === 'submitted'), [data]);
  const [edits, setEdits] = useState({});
  const [comments, setComments] = useState({});
  const [lastError, setLastError] = useState('');

  const getApiErrorText = (e) =>
    e?.response?.data?.detail ||
    e?.response?.data?.message ||
    e?.message ||
    'Request failed';

  const setField = (id, key, value) => {
    setEdits((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [key]: value
      }
    }));
  };

  const setComment = (id, value) => {
    setComments((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const saveInline = async (goal) => {
    const patch = edits[goal.id];
    if (!patch) return;

    try {
      const body = {};
      if (patch.target !== undefined) body.target = Number(patch.target);
      if (patch.weightage !== undefined) body.weightage = Number(patch.weightage);

      await api.put(`/api/goals/${goal.id}`, body);
      toast.success('Inline update saved');
    } catch (e) {
      console.error('INLINE_UPDATE_FAILED', e);
      const msg = getApiErrorText(e);
      setLastError(msg);
      toast.error(msg);
      throw new Error('save failed');
    }
  };

  const approve = async (goal) => {
    try {
      setLastError('');
      await saveInline(goal);

      await api.post(`/api/goals/${goal.id}/approve`, {
        manager_comment: comments[goal.id] || ''
      });

      toast.success('Approved');
      refetch();
    } catch (e) {
      console.error('APPROVE_FAILED', e);
      const msg = getApiErrorText(e);
      setLastError(msg);
      toast.error(msg);
    }
  };

  const ret = async (goal) => {
    try {
      setLastError('');
      await saveInline(goal);

      await api.post(`/api/goals/${goal.id}/return`, {
        manager_comment: comments[goal.id] || ''
      });

      toast.success('Returned');
      refetch();
    } catch (e) {
      console.error('RETURN_FAILED', e);
      const msg = getApiErrorText(e);
      setLastError(msg);
      toast.error(msg);
    }
  };

  const bulkApprove = async () => {
    try {
      setLastError('');
      for (const goal of pending) {
        await saveInline(goal);
        await api.post(`/api/goals/${goal.id}/approve`, {
          manager_comment: comments[goal.id] || ''
        });
      }
      toast.success('Bulk approve complete');
      refetch();
    } catch (e) {
      console.error('BULK_APPROVE_FAILED', e);
      const msg = getApiErrorText(e);
      setLastError(msg);
      toast.error(msg || 'Bulk approve failed');
    }
  };

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl">Approve Goals</h1>

      {lastError ? (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Error: {lastError}
        </div>
      ) : null}

      <button onClick={bulkApprove} className="rounded bg-brand-600 px-3 py-2 text-white">
        Bulk Approve
      </button>

      <div className="overflow-x-auto rounded border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Goal</th>
              <th className="p-2 text-left">Employee</th>
              <th>Target</th>
              <th>Weightage</th>
              <th>Comment</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {pending.map((g) => (
              <tr className="border-t" key={g.id}>
                <td className="p-2">{g.title}</td>
                <td className="p-2">{g.users?.full_name || '-'}</td>

                <td>
                  <input
                    defaultValue={g.target || ''}
                    className="w-24 rounded border p-1"
                    onChange={(e) => setField(g.id, 'target', e.target.value)}
                  />
                </td>

                <td>
                  <input
                    defaultValue={g.weightage || ''}
                    className="w-16 rounded border p-1"
                    onChange={(e) => setField(g.id, 'weightage', e.target.value)}
                  />
                </td>

                <td className="p-2">
                  <input
                    className="w-64 max-w-full rounded border p-1"
                    placeholder="Manager comment..."
                    onChange={(e) => setComment(g.id, e.target.value)}
                    defaultValue={comments[g.id] || ''}
                  />
                </td>

                <td className="space-x-2 p-2">
                  <button className="rounded border px-2 py-1" onClick={() => saveInline(g)}>
                    Save
                  </button>

                  <button
                    className="rounded bg-emerald-600 px-2 py-1 text-white"
                    onClick={() => approve(g)}
                  >
                    Approve
                  </button>

                  <button
                    className="rounded bg-red-600 px-2 py-1 text-white"
                    onClick={() => ret(g)}
                  >
                    Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
