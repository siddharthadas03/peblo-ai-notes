import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Archive, Brain, FileText, Tags } from 'lucide-react';
import api from '../services/api';
import Spinner from '../components/Spinner.jsx';

const statIcons = { total: FileText, archived: Archive, ai: Brain, tags: Tags };

function StatCard({ label, value, type }) {
  const Icon = statIcons[type];
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className="rounded-lg bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notes/dashboard')
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex min-h-[70vh] items-center justify-center"><Spinner label="Loading dashboard" /></div>;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">A quick pulse check on your writing, organizing, and AI usage.</p>
        </div>
        <Link className="btn-primary" to="/notes">Open notes</Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total notes" value={stats.totalNotes} type="total" />
        <StatCard label="Archived notes" value={stats.archivedNotes} type="archived" />
        <StatCard label="AI summaries" value={stats.aiUsageCount} type="ai" />
        <StatCard label="Active tags" value={stats.mostUsedTags.length} type="tags" />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="panel p-5">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Weekly activity</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.weeklyActivity}>
                <defs>
                  <linearGradient id="activity" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="notes" stroke="#059669" fill="url(#activity)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Most-used tags</h2>
          <div className="mt-5 space-y-3">
            {stats.mostUsedTags.length ? stats.mostUsedTags.map((item) => (
              <div key={item.tag} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">#{item.tag}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{item.count}</span>
              </div>
            )) : <p className="text-sm text-slate-500 dark:text-slate-400">Tags will appear after you add them to notes.</p>}
          </div>
        </div>
      </section>

      <section className="panel mt-8 p-5">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Recently edited</h2>
        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {stats.recentNotes.map((note) => (
            <Link to="/notes" key={note._id} className="flex items-center justify-between py-3 text-sm">
              <span className="font-medium text-slate-800 dark:text-slate-100">{note.title}</span>
              <span className="text-slate-500 dark:text-slate-400">{new Date(note.updatedAt).toLocaleDateString()}</span>
            </Link>
          ))}
          {!stats.recentNotes.length ? <p className="py-4 text-sm text-slate-500 dark:text-slate-400">No notes yet.</p> : null}
        </div>
      </section>
    </main>
  );
}
