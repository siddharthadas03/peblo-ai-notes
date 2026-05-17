import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import api from '../services/api';
import EmptyState from '../components/EmptyState.jsx';
import Spinner from '../components/Spinner.jsx';

export default function SharedNote() {
  const { shareId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/shared/${shareId}`)
      .then(({ data }) => setNote(data))
      .catch((err) => setError(err.response?.data?.message || 'Shared note not found'))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950"><Spinner label="Opening shared note" /></div>;
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <EmptyState title="Note unavailable" message={error} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white">
      <article className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span>{note.category}</span>
          <span>/</span>
          <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
          {note.createdBy?.name ? <><span>/</span><span>By {note.createdBy.name}</span></> : null}
        </div>
        <h1 className="mt-4 text-4xl font-semibold leading-tight">{note.title}</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {(note.tags || []).map((tag) => (
            <span key={tag} className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">#{tag}</span>
          ))}
        </div>
        {note.summary ? (
          <section className="mt-8 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-950 dark:bg-emerald-500/10 dark:text-emerald-100">
            <h2 className="font-semibold">AI summary</h2>
            <p className="mt-2 leading-6">{note.summary}</p>
          </section>
        ) : null}
        <section className="prose mt-8 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(note.content || '')) }} />
      </article>
    </main>
  );
}
