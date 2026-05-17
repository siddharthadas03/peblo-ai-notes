import { Link, NavLink, Outlet } from 'react-router-dom';
import { BarChart3, LogOut, Moon, NotebookPen, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const navLink = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
  }`;

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <Link to="/dashboard" className="flex items-center gap-3 px-2 py-3">
          <div className="rounded-lg bg-emerald-500 p-2 text-white"><NotebookPen size={20} /></div>
          <div>
            <div className="font-semibold">AI Notes</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Workspace</div>
          </div>
        </Link>
        <nav className="mt-8 space-y-2">
          <NavLink className={navLink} to="/dashboard"><BarChart3 size={18} /> Dashboard</NavLink>
          <NavLink className={navLink} to="/notes"><NotebookPen size={18} /> Notes</NavLink>
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <Link to="/dashboard" className="flex items-center gap-2 font-semibold lg:hidden">
              <NotebookPen size={20} /> AI Notes
            </Link>
            <div className="hidden text-sm text-slate-500 dark:text-slate-400 lg:block">Welcome back, {user?.name}</div>
            <div className="flex items-center gap-2">
              <NavLink className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden" to="/dashboard">Dashboard</NavLink>
              <NavLink className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden" to="/notes">Notes</NavLink>
              <button className="btn-secondary px-3" onClick={() => setDark((value) => !value)} aria-label="Toggle dark mode">
                {dark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <button className="btn-secondary px-3" onClick={logout} aria-label="Logout"><LogOut size={17} /></button>
            </div>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
