export default function AuditLogTable({ rows = [] }) {
  return (
    <div className="overflow-x-auto rounded border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100"><tr><th className="p-2 text-left">Timestamp</th><th className="p-2 text-left">User</th><th className="p-2">Action</th><th className="p-2">Old Value</th><th className="p-2">New Value</th></tr></thead>
        <tbody>
          {rows.length === 0 ? <tr><td className="p-3" colSpan="5">No audit records yet.</td></tr> : rows.map((r) => (
            <tr key={r.id} className="border-t"><td className="p-2">{r.changed_at}</td><td className="p-2">{r.changed_by}</td><td className="p-2">{r.action}</td><td className="p-2"><pre className="max-w-72 overflow-x-auto">{JSON.stringify(r.old_value, null, 2)}</pre></td><td className="p-2"><pre className="max-w-72 overflow-x-auto">{JSON.stringify(r.new_value, null, 2)}</pre></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
