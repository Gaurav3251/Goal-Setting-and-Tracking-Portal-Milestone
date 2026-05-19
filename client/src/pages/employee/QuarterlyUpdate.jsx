import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';
import CheckInForm from '../../components/CheckInForm';
import { computeScore } from '../../utils/scoreCalculator';
import { useCycle } from '../../hooks/useCycle';
import toast from 'react-hot-toast';

export default function QuarterlyUpdate() {
  const { id } = useParams();
  const [goal, setGoal] = useState(null);
  const [form, setForm] = useState({ progress_status: 'not_started' });
  const { phase } = useCycle();
  useEffect(() => { api.get('/api/goals').then((res) => setGoal(res.data.find((g) => g.id === id))); }, [id]);
  const score = useMemo(() => goal ? computeScore(goal.uom_type, Number(goal.target || 0), Number(form.actual_achievement || 0), goal.target_date, form.actual_date) : 0, [goal, form]);
  const disabled = !['Q1','Q2','Q3','Q4'].includes(phase);
  const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async () => {
    try { await api.post('/api/checkins', { ...form, goal_id: id, quarter: phase }); toast.success('Check-in saved'); } catch { toast.error('Save failed'); }
  };
  return <div className="space-y-3"><h1 className="font-display text-2xl">Quarterly Update</h1>{goal && <div className="rounded border bg-white p-3 text-sm">Goal: {goal.title}</div>}<CheckInForm value={form} onChange={onChange} onSubmit={submit} disabled={disabled} score={score} /></div>;
}
