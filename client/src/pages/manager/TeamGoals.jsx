import { useState } from 'react';
import { useGoals } from '../../hooks/useGoals';
import StatusBadge from '../../components/StatusBadge';
import { SkeletonTable } from '../../components/Skeletons';

export default function TeamGoals() {
  const { data, loading } = useGoals('/goals/team');
  const [status, setStatus] = useState('all');
  const filtered = status === 'all' ? data : data.filter((g) => g.status === status);
  return <div className="space-y-3"><h1 className="font-display text-2xl">Team Goals</h1><select className="rounded border p-2" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All</option><option value="submitted">Submitted</option><option value="locked">Locked</option></select>{loading ? <SkeletonTable rows={6} cols={3} /> : <div className="overflow-x-auto rounded border bg-white"><table className="min-w-full text-sm"><thead className="bg-slate-100"><tr><th className="p-2 text-left">Goal</th><th>Weightage</th><th>Status</th></tr></thead><tbody>{filtered.map((g) => <tr className="border-t" key={g.id}><td className="p-2">{g.title}</td><td className="text-center">{g.weightage}%</td><td className="text-center"><StatusBadge status={g.status} /></td></tr>)}</tbody></table></div>}</div>;
}
