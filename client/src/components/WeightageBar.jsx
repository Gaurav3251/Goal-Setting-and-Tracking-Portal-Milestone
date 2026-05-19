export default function WeightageBar({ total }) {
  const color = total === 100 ? 'bg-emerald-500' : total > 100 ? 'bg-red-500' : 'bg-slate-400';
  return (
    <div className="w-full">
      <div className="mb-1 text-sm text-muted">Total Weightage: {total}%</div>
      <div className="h-3 w-full rounded bg-slate-200">
        <div className={`h-3 rounded ${color}`} style={{ width: `${Math.min(total, 100)}%` }} />
      </div>
    </div>
  );
}
