import { useMemo } from 'react';
import { THRUST_AREAS, UOM_TYPES } from '../constants';

export default function GoalForm({
  value,
  onChange,
  totalWeightage = 0,
  onSubmitDraft,
  onSubmitApproval,
  onDeleteDraft,
  readOnlyShared = false
}) {
  const remaining = useMemo(() => 100 - totalWeightage, [totalWeightage]);
  const canDeleteDraft = value?.status === 'draft' && !readOnlyShared && typeof onDeleteDraft === 'function';
  return (
    <div className="space-y-3 rounded-xl border bg-white p-4">
      <select className="w-full rounded border p-2" value={value.thrust_area || ''} onChange={(e) => onChange('thrust_area', e.target.value)}>
        <option value="">Select Thrust Area</option>
        {THRUST_AREAS.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <input disabled={readOnlyShared} className="w-full rounded border p-2" placeholder="Goal Title" value={value.title || ''} onChange={(e) => onChange('title', e.target.value)} />
      <textarea className="w-full rounded border p-2" placeholder="Description" value={value.description || ''} onChange={(e) => onChange('description', e.target.value)} />
      <select className="w-full rounded border p-2" value={value.uom_type || ''} onChange={(e) => onChange('uom_type', e.target.value)}>
        <option value="">Select UoM</option>
        {UOM_TYPES.map((u) => <option key={u} value={u}>{u}</option>)}
      </select>
      <input disabled={readOnlyShared} type={value.uom_type === 'timeline' ? 'date' : 'number'} className="w-full rounded border p-2" value={value.uom_type === 'timeline' ? value.target_date || '' : value.target || ''} onChange={(e) => onChange(value.uom_type === 'timeline' ? 'target_date' : 'target', e.target.value)} />
      <input type="number" className="w-full rounded border p-2" placeholder="Weightage" value={value.weightage || ''} onChange={(e) => onChange('weightage', Number(e.target.value))} />
      <p className={`text-sm ${remaining < 0 ? 'text-red-600' : 'text-muted'}`}>Remaining weightage: {remaining}%</p>
      <div className="flex gap-2">
        <button onClick={onSubmitDraft} className="rounded border px-3 py-2">Save Draft</button>

        {canDeleteDraft ? (
          <button
            onClick={onDeleteDraft}
            className="rounded border border-red-300 px-3 py-2 text-red-700"
            type="button"
          >
            Delete Draft
          </button>
        ) : null}

        <button onClick={onSubmitApproval} className="rounded bg-brand-600 px-3 py-2 text-white">Submit for Approval</button>
      </div>
    </div>
  );
}
