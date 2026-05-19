import { useEffect, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import AuditLogTable from '../../components/AuditLogTable';
import ExportButton from '../../components/ExportButton';
import { SkeletonTable } from '../../components/Skeletons';

export default function AuditLogs() {
  const [rows, setRows] = useState([]);
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/audit', { params: action ? { action } : {} });
      setRows(r.data || []);
    } catch {
      setRows([]);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [action]);

  return <div className="space-y-3"><h1 className="font-display text-2xl">Audit Logs</h1><div className="flex gap-2"><select className="rounded border p-2" value={action} onChange={(e) => setAction(e.target.value)}><option value="">All Actions</option><option value="APPROVE">APPROVE</option><option value="RETURN">RETURN</option><option value="UNLOCK">UNLOCK</option><option value="UPDATE">UPDATE</option></select><ExportButton data={rows} /></div>{loading ? <SkeletonTable rows={6} cols={5} /> : <AuditLogTable rows={rows} />}</div>;
}
