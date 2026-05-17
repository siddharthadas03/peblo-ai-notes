import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <main className="grid min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white lg:grid-cols-[1fr_0.85fr]">
      <section className="flex items-center justify-center px-5 py-10">
        <Outlet />
      </section>
      <aside className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">AI Notes Workspace</div>
          <h1 className="mt-8 max-w-xl text-5xl font-semibold leading-tight">A calmer home for notes that turn into work.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            Capture ideas, search them fast, share polished read-only pages, and turn long notes into summaries and action items with Gemini.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm text-slate-300">
          <div className="rounded-lg border border-white/10 p-4">Autosave</div>
          <div className="rounded-lg border border-white/10 p-4">Public links</div>
          <div className="rounded-lg border border-white/10 p-4">AI insights</div>
        </div>
      </aside>
    </main>
  );
}
