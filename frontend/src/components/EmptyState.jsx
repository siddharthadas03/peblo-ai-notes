import { FileText } from 'lucide-react';

export default function EmptyState({ title, message, action }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 rounded-lg bg-slate-100 p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <FileText size={24} />
      </div>
      <h3 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
