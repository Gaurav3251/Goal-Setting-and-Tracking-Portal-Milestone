import { useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { useGoals } from '../../hooks/useGoals';

export default function CheckIn() {
  const { data } = useGoals('/goals/team');
  const [comments, setComments] = useState({});
  const saveComment = async (id) => { try { await api.put(`/api/checkins/${id}/comment`, { manager_comment: comments[id] || '' }); toast.success('Comment saved'); } catch { toast.error('Save failed'); } };
  return <div className="space-y-3"><h1 className="font-display text-2xl">Manager Check-in</h1><div className="overflow-x-auto rounded border bg-white"><table className="min-w-full text-sm"><thead className="bg-slate-100"><tr><th className="p-2 text-left">Goal</th><th>Planned</th><th>Actual</th><th>Status</th><th>Comment</th></tr></thead><tbody>{data.map((g) => <tr className="border-t" key={g.id}><td className="p-2">{g.title}</td><td>{g.target}</td><td>{g.actual_achievement || '-'}</td><td>{g.status}</td><td className="p-2"><input className="rounded border p-1" onChange={(e) => setComments((c) => ({ ...c, [g.id]: e.target.value }))} /><button className="ml-2 rounded border px-2 py-1" onClick={() => saveComment(g.id)}>Save</button></td></tr>)}</tbody></table></div></div>;
}
