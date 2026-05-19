export default function StatusBadge({ status = 'draft' }) {
  const map = {
    draft: 'bg-slate-200 text-slate-700',
    submitted: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    locked: 'bg-emerald-100 text-emerald-700',
    returned: 'bg-red-100 text-red-700'
  };
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${map[status] || map.draft}`}>{status}</span>;
}
