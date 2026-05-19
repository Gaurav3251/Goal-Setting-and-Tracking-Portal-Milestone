import { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { SkeletonBlock } from '../../components/Skeletons';

const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6', '#14b8a6'];

function EmptyState({ title, subtitle }) {
  return (
    <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
      <p className="font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({ trend: [], distribution: [], managerEffectiveness: [] });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/api/reports/analytics');
        setAnalytics(res.data || { trend: [], distribution: [], managerEffectiveness: [] });
      } catch {
        setAnalytics({ trend: [], distribution: [], managerEffectiveness: [] });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const hasTrendData = useMemo(() => (analytics.trend || []).some((x) => Number(x.checkinCount || 0) > 0), [analytics.trend]);
  const hasDistribution = useMemo(() => (analytics.distribution || []).length > 0, [analytics.distribution]);
  const hasManagerData = useMemo(() => (analytics.managerEffectiveness || []).length > 0, [analytics.managerEffectiveness]);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">Analytics Dashboard</h1>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonBlock className="h-72" />
          <SkeletonBlock className="h-72" />
          <SkeletonBlock className="h-72 md:col-span-2" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-72 rounded border bg-white p-3">
            <h3 className="mb-2 font-semibold">QoQ Achievement Trend</h3>
            {hasTrendData ? (
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={analytics.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="averageScore" stroke="#4f46e5" name="Avg Progress Score" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No check-in trend yet" subtitle="Trend will appear after quarterly check-ins are submitted." />
            )}
          </div>

          <div className="h-72 rounded border bg-white p-3">
            <h3 className="mb-2 font-semibold">Goal Distribution by Thrust Area</h3>
            {hasDistribution ? (
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie data={analytics.distribution} dataKey="value" nameKey="name" outerRadius={80}>
                    {(analytics.distribution || []).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No goals yet" subtitle="Distribution appears once goals are created." />
            )}
          </div>

          <div className="h-72 rounded border bg-white p-3 md:col-span-2">
            <h3 className="mb-2 font-semibold">Manager Effectiveness</h3>
            {hasManagerData ? (
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={analytics.managerEffectiveness}>
                  <XAxis dataKey="manager" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completionRate" fill="#4f46e5" name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No manager analytics yet" subtitle="This chart appears when managers and team check-ins exist." />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
