import StatusBadge from './StatusBadge';

export default function GoalCard({ goal, onEdit }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg">{goal.title}</h3>
        <StatusBadge status={goal.status} />
      </div>
      <p className="text-sm text-muted">{goal.thrust_area}</p>
      <p className="mt-2 text-sm">UoM: {goal.uom_type} | Target: {goal.target || goal.target_date}</p>
      <p className="text-sm">Weightage: {goal.weightage}%</p>

      {goal.manager_comment ? (
        <div className="mt-3 rounded border bg-slate-50 p-3 text-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Manager Comment</div>
          <div className="mt-1 whitespace-pre-wrap">{goal.manager_comment}</div>
        </div>
      ) : null}

      <button disabled={goal.status === 'locked'} onClick={onEdit} className="mt-3 rounded border px-3 py-1 disabled:opacity-40">Edit</button>
    </div>
  );
}
