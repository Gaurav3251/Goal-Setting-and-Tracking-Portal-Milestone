import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoalForm from '../../components/GoalForm';
import { useGoals } from '../../hooks/useGoals';
import { useCycle } from '../../hooks/useCycle';
import api from '../../api';
import toast from 'react-hot-toast';

export default function CreateGoal() {
  const navigate = useNavigate();
  const { data: goals } = useGoals('/goals');
  const { cycle, loading: cycleLoading } = useCycle();

  const [form, setForm] = useState({ status: 'draft' });
  const total = goals.reduce((s, g) => s + Number(g.weightage || 0), 0) + Number(form.weightage || 0);

  // backend requires cycle_id on create; inject active cycle id once loaded
  useEffect(() => {
    if (!cycleLoading && cycle?.id && !form.cycle_id) {
      setForm((f) => ({ ...f, cycle_id: cycle.id }));
    }
  }, [cycleLoading, cycle?.id]);

  const onChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (submit) => {
    try {
      if ((form.weightage || 0) < 10) return toast.error('Weightage must be >= 10');
      if (goals.length >= 8) return toast.error('Maximum 8 goals allowed');
      if (total > 100) return toast.error('Weightage exceeds 100%');

      if (submit && total !== 100) {
        const remaining = Math.max(0, 100 - total);
        return toast.error(
          `Total weightage must be exactly 100% for submission. Remaining: ${remaining}%`
        );
      }

      if (!form.cycle_id) {
        return toast.error('Active cycle not found. Please refresh and try again.');
      }

      const created = await api.post('/api/goals', form);
      if (submit) await api.post(`/api/goals/${created.data.id}/submit`);
      toast.success(submit ? 'Goal submitted' : 'Goal saved');
      navigate('/employee/goals');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to save goal');
    }
  };

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl">Create Goal</h1>
      <GoalForm
        value={form}
        onChange={onChange}
        totalWeightage={total}
        onSubmitDraft={() => save(false)}
        onSubmitApproval={() => save(true)}
      />
    </div>
  );
}
