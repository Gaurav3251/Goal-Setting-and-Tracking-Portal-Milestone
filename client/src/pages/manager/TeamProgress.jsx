import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useGoals } from '../../hooks/useGoals';

export default function TeamProgress() {
  const { data } = useGoals('/goals/team');
  const chartData = data.map((g) => ({ name: g.title?.slice(0, 10), planned: Number(g.target || 0), actual: Number(g.actual_achievement || 0) }));
  return <div className="space-y-3"><h1 className="font-display text-2xl">Team Progress</h1><div className="h-80 rounded border bg-white p-3"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="planned" fill="#4f46e5" /><Bar dataKey="actual" fill="#10b981" /></BarChart></ResponsiveContainer></div></div>;
}
