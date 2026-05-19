export default function CheckInForm({ value, onChange, onSubmit, disabled, score }) {
  return (
    <div className="space-y-3 rounded-xl border bg-white p-4">
      {disabled && <div className="rounded bg-amber-50 p-2 text-sm text-amber-700">Check-in is only available in active quarter windows.</div>}
      <input disabled={disabled} type="number" className="w-full rounded border p-2" placeholder="Actual Achievement" value={value.actual_achievement || ''} onChange={(e) => onChange('actual_achievement', Number(e.target.value))} />
      <input disabled={disabled} type="date" className="w-full rounded border p-2" value={value.actual_date || ''} onChange={(e) => onChange('actual_date', e.target.value)} />
      <select disabled={disabled} className="w-full rounded border p-2" value={value.progress_status || 'not_started'} onChange={(e) => onChange('progress_status', e.target.value)}>
        <option value="not_started">Not Started</option>
        <option value="on_track">On Track</option>
        <option value="completed">Completed</option>
      </select>
      <p className="text-sm">Progress Score: {Math.round(score)}%</p>
      <button disabled={disabled} onClick={onSubmit} className="rounded bg-brand-600 px-3 py-2 text-white disabled:opacity-40">Save Check-in</button>
    </div>
  );
}
