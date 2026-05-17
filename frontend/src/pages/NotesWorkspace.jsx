import { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import toast from 'react-hot-toast';
import { Archive, Brain, Eye, EyeOff, FilePlus2, Link as LinkIcon, Search, Trash2 } from 'lucide-react';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Spinner from '../components/Spinner.jsx';
import useDebounce from '../hooks/useDebounce.js';

const emptyDraft = {
  title: '',
  content: '',
  tags: [],
  category: 'General',
  archived: false,
  isPublic: false
};

export default function NotesWorkspace() {
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', tag: '', archived: 'false', sort: 'latest' });
  const debouncedFilters = useDebounce(filters, 350);
  const debouncedDraft = useDebounce(draft, 1000);

  const activeNote = useMemo(() => notes.find((note) => note._id === activeId), [notes, activeId]);
  const allTags = useMemo(() => [...new Set(notes.flatMap((note) => note.tags || []))].sort(), [notes]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(debouncedFilters).forEach(([key, value]) => value && params.set(key, value));
      try {
        const { data } = await api.get(`/notes?${params.toString()}`);
        setNotes(data);
        if (!activeId && data[0]) setActiveId(data[0]._id);
        if (activeId && !data.some((note) => note._id === activeId)) setActiveId(data[0]?._id || null);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load notes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [debouncedFilters]);

  useEffect(() => {
    if (activeNote) {
      setDraft(activeNote);
      setDirty(false);
    } else {
      setDraft(emptyDraft);
    }
  }, [activeNote?._id]);

  useEffect(() => {
    if (!dirty || !activeId) return;

    const save = async () => {
      setSaving(true);
      try {
        const payload = {
          title: debouncedDraft.title || 'Untitled note',
          content: debouncedDraft.content,
          tags: debouncedDraft.tags,
          category: debouncedDraft.category || 'General',
          archived: debouncedDraft.archived
        };
        const { data } = await api.put(`/notes/${activeId}`, payload);
        setNotes((current) => current.map((note) => (note._id === activeId ? data : note)));
        setDirty(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Autosave failed');
      } finally {
        setSaving(false);
      }
    };

    save();
  }, [debouncedDraft]);

  const updateDraft = (patch) => {
    setDraft((current) => ({ ...current, ...patch }));
    setDirty(true);
  };

  const createNote = async () => {
    try {
      const optimistic = { ...emptyDraft, title: 'Untitled note', _id: `temp-${Date.now()}`, updatedAt: new Date().toISOString() };
      setNotes((current) => [optimistic, ...current]);
      setActiveId(optimistic._id);
      const { data } = await api.post('/notes', { title: 'Untitled note', category: 'General' });
      setNotes((current) => current.map((note) => (note._id === optimistic._id ? data : note)));
      setActiveId(data._id);
      toast.success('Note created');
    } catch (error) {
      setNotes((current) => current.filter((note) => !String(note._id).startsWith('temp-')));
      toast.error(error.response?.data?.message || 'Could not create note');
    }
  };

  const deleteNote = async () => {
    if (!activeId) return;
    const previous = notes;
    setNotes((current) => current.filter((note) => note._id !== activeId));
    setActiveId(notes.find((note) => note._id !== activeId)?._id || null);
    setDeleteOpen(false);
    try {
      await api.delete(`/notes/${activeId}`);
      toast.success('Note deleted');
    } catch (error) {
      setNotes(previous);
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const generateAiSummary = async () => {
    if (!activeId || String(activeId).startsWith('temp-')) return;
    setAiLoading(true);
    try {
      const { data } = await api.post(`/notes/${activeId}/ai-summary`);
      setDraft(data);
      setNotes((current) => current.map((note) => (note._id === activeId ? data : note)));
      toast.success('AI summary generated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'AI summary failed');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleShare = async () => {
    if (!activeId) return;
    try {
      const { data } = await api.patch(`/notes/${activeId}/share`, { isPublic: !draft.isPublic });
      setDraft(data);
      setNotes((current) => current.map((note) => (note._id === activeId ? data : note)));
      toast.success(data.isPublic ? 'Public link enabled' : 'Note is private');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Sharing update failed');
    }
  };

  const shareUrl = draft.shareId ? `${window.location.origin}/shared/${draft.shareId}` : '';
  const previewHtml = DOMPurify.sanitize(marked.parse(draft.content || '*Nothing to preview yet.*'));

  return (
    <main className="grid h-[calc(100vh-65px)] grid-cols-1 overflow-hidden lg:grid-cols-[350px_1fr]">
      <aside className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:border-b-0 lg:border-r">
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={17} />
              <input className="input pl-9" placeholder="Search notes" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            </div>
            <button className="btn-primary px-3" onClick={createNote} aria-label="New note"><FilePlus2 size={18} /></button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select className="input" value={filters.tag} onChange={(e) => setFilters({ ...filters, tag: e.target.value })}>
              <option value="">All tags</option>
              {allTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
            </select>
            <select className="input" value={filters.archived} onChange={(e) => setFilters({ ...filters, archived: e.target.value })}>
              <option value="false">Active</option>
              <option value="true">Archived</option>
              <option value="">All</option>
            </select>
            <select className="input" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        <div className="h-[260px] overflow-y-auto border-t border-slate-100 dark:border-slate-800 lg:h-[calc(100vh-210px)]">
          {loading ? (
            <div className="p-6"><Spinner label="Loading notes" /></div>
          ) : notes.length ? notes.map((note) => (
            <button
              key={note._id}
              onClick={() => setActiveId(note._id)}
              className={`block w-full border-b border-slate-100 p-4 text-left transition dark:border-slate-800 ${
                note._id === activeId ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="line-clamp-1 font-semibold text-slate-950 dark:text-white">{note.title}</h3>
                {note.archived ? <Archive size={15} className="text-slate-400" /> : null}
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{note.content || 'No content yet'}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {(note.tags || []).slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">#{tag}</span>
                ))}
              </div>
            </button>
          )) : (
            <div className="p-4">
              <EmptyState title="No notes found" message="Create a note or adjust the filters." action={<button className="btn-primary" onClick={createNote}>New note</button>} />
            </div>
          )}
        </div>
      </aside>

      <section className="overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950">
        {activeId ? (
          <div className="mx-auto max-w-6xl space-y-5">
            <div className="panel p-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <input className="w-full bg-transparent text-2xl font-semibold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white" placeholder="Untitled note" value={draft.title || ''} onChange={(e) => updateDraft({ title: e.target.value })} />
                <div className="flex flex-wrap gap-2">
                  <button className="btn-secondary" onClick={() => updateDraft({ archived: !draft.archived })}><Archive size={17} /> {draft.archived ? 'Unarchive' : 'Archive'}</button>
                  <button className="btn-secondary" onClick={toggleShare}>{draft.isPublic ? <EyeOff size={17} /> : <Eye size={17} />} {draft.isPublic ? 'Make private' : 'Share'}</button>
                  <button className="btn-primary" onClick={generateAiSummary} disabled={aiLoading}><Brain size={17} /> {aiLoading ? 'Thinking...' : 'AI summary'}</button>
                  <button className="btn-secondary text-rose-600 dark:text-rose-300" onClick={() => setDeleteOpen(true)}><Trash2 size={17} /> Delete</button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <input className="input" placeholder="Category" value={draft.category || ''} onChange={(e) => updateDraft({ category: e.target.value })} />
                <input className="input" placeholder="Tags separated by commas" value={(draft.tags || []).join(', ')} onChange={(e) => updateDraft({ tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })} />
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">{saving ? 'Saving...' : dirty ? 'Pending save' : 'Saved'}</div>
              </div>
              {draft.isPublic && shareUrl ? (
                <div className="mt-4 flex flex-col gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200 sm:flex-row sm:items-center sm:justify-between">
                  <span className="break-all">{shareUrl}</span>
                  <button className="btn-secondary py-2" onClick={() => navigator.clipboard.writeText(shareUrl).then(() => toast.success('Link copied'))}><LinkIcon size={16} /> Copy</button>
                </div>
              ) : null}
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
              <div className="panel overflow-hidden">
                <textarea
                  className="min-h-[520px] w-full resize-y bg-white p-5 text-sm leading-7 text-slate-800 outline-none dark:bg-slate-900 dark:text-slate-100"
                  placeholder="Write your note in Markdown..."
                  value={draft.content || ''}
                  onChange={(e) => updateDraft({ content: e.target.value })}
                />
              </div>
              <div className="space-y-5">
                <div className="panel p-5">
                  <h2 className="text-lg font-semibold text-slate-950 dark:text-white">AI summary</h2>
                  {aiLoading ? <div className="mt-5"><Spinner label="Generating insights" /></div> : (
                    <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                      <p>{draft.summary || 'Generate a summary to see the key ideas here.'}</p>
                      <div>
                        <h3 className="font-semibold text-slate-950 dark:text-white">Action items</h3>
                        {draft.actionItems?.length ? (
                          <ul className="mt-2 list-disc space-y-1 pl-5">
                            {draft.actionItems.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                          </ul>
                        ) : <p className="mt-2 text-slate-500 dark:text-slate-400">No action items yet.</p>}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-950 dark:text-white">Suggested title</h3>
                        <p className="mt-2">{draft.suggestedTitle || 'No suggestion yet.'}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="panel p-5">
                  <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Markdown preview</h2>
                  <article className="prose prose-sm mt-4 max-w-none text-slate-700 dark:prose-invert dark:text-slate-200" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl pt-16">
            <EmptyState title="Choose a note" message="Select a note from the sidebar or create a fresh one to begin." action={<button className="btn-primary" onClick={createNote}>New note</button>} />
          </div>
        )}
      </section>

      <ConfirmModal
        open={deleteOpen}
        title="Delete this note?"
        message="This removes the note permanently from your workspace."
        confirmLabel="Delete note"
        onConfirm={deleteNote}
        onClose={() => setDeleteOpen(false)}
      />
    </main>
  );
}
