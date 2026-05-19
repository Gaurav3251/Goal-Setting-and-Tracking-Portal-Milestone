import { useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';

export default function SharedGoals() {
  const [sourceGoalId, setSourceGoalId] = useState('');
  const [employeeIds, setEmployeeIds] = useState('');
  const push = async () => {
    try {
      await api.post('/api/goals/shared', { source_goal_id: sourceGoalId, employee_ids: employeeIds.split(',').map((x) => x.trim()).filter(Boolean) });
      toast.success('Shared goals pushed');
    } catch { toast.error('Push failed'); }
  };
  return <div className="space-y-3"><h1 className="font-display text-2xl">Shared Goals</h1><input className="w-full rounded border p-2" placeholder="Source Goal ID" value={sourceGoalId} onChange={(e) => setSourceGoalId(e.target.value)} /><textarea className="w-full rounded border p-2" placeholder="Employee IDs (comma separated)" value={employeeIds} onChange={(e) => setEmployeeIds(e.target.value)} /><button onClick={push} className="rounded bg-brand-600 px-3 py-2 text-white">Push Shared Goal</button></div>;
}
