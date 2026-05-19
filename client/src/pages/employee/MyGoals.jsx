import { useNavigate } from 'react-router-dom';
import { useGoals } from '../../hooks/useGoals';
import GoalCard from '../../components/GoalCard';
import WeightageBar from '../../components/WeightageBar';
import { SkeletonCards } from '../../components/Skeletons';
import api from '../../api';
import toast from 'react-hot-toast';

export default function MyGoals() {
  const navigate = useNavigate();
  const { data: goals, loading, refetch } = useGoals('/goals');
  const total = goals.reduce((s, g) => s + Number(g.weightage || 0), 0);
  const submit = async () => {
    try {
      if (total !== 100) return toast.error('Total weightage must be 100%');
      await Promise.all(goals.map((g) => api.post(`/api/goals/${g.id}/submit`)));
      toast.success('Goal sheet submitted');
      refetch();
    } catch {
      toast.error('Failed to submit goals');
    }
  };
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">My Goals</h1>
      <WeightageBar total={total} />
      <button onClick={submit} disabled={total !== 100} className="rounded bg-brand-600 px-3 py-2 text-white disabled:opacity-50">Submit Goal Sheet</button>
      {loading ? <SkeletonCards count={4} /> : goals.length === 0 ? <div className="rounded border bg-white p-5">No goals yet. Create your first goal.</div> : <div className="grid gap-3 md:grid-cols-2">{goals.map((g) => <GoalCard key={g.id} goal={g} onEdit={() => navigate(`/employee/goals/${g.id}/edit`)} />)}</div>}
    </div>
  );
}
