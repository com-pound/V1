'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  Plus, Search, Tag, Trash2, Save, StickyNote, X, Check, FileText,
} from 'lucide-react'
import { GlassCard, Pill, EmptyState } from '@/components/delta/ui'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const SUBJECT_FILTERS = ['All', 'Physics', 'Chemistry', 'Maths', 'Biology']

export function NotesPage() {
  const notes = useStore((s) => s.notes)
  const addNote = useStore((s) => s.addNote)
  const updateNote = useStore((s) => s.updateNote)
  const deleteNote = useStore((s) => s.deleteNote)

  const [query, setQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('All')
  const [activeId, setActiveId] = useState<string | null>(notes[0]?.id ?? null)
  const [draft, setDraft] = useState({ title: '', subject: 'Physics', content: '', tags: '' })
  const [savedFlash, setSavedFlash] = useState(false)

  const active = notes.find((n) => n.id === activeId) ?? null

  // Sync draft when switching notes
  useEffect(() => {
    if (active) {
      setDraft({ title: active.title, subject: active.subject, content: active.content, tags: active.tags.join(', ') })
    }
  }, [activeId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced auto-save
  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => {
      updateNote(active.id, {
        title: draft.title || 'Untitled note',
        subject: draft.subject,
        content: draft.content,
        tags: draft.tags.split(',').map((x) => x.trim()).filter(Boolean),
      })
      setSavedFlash(true)
      const f = setTimeout(() => setSavedFlash(false), 1200)
      return () => clearTimeout(f)
    }, 700)
    return () => clearTimeout(t)
  }, [draft]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    let list = notes
    if (subjectFilter !== 'All') list = list.filter((n) => n.subject === subjectFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some((t) => t.includes(q)))
    }
    return [...list].sort((a, b) => b.updatedAt - a.updatedAt)
  }, [notes, subjectFilter, query])

  function createNote() {
    const id = `note-${Date.now()}`
    addNote({ title: 'Untitled note', subject: 'Physics', content: '', tags: [] })
    // newly added note is prepended; select it next tick
    setTimeout(() => {
      const newest = useStore.getState().notes[0]
      if (newest) setActiveId(newest.id)
    }, 0)
  }

  function relTime(ts: number) {
    const d = Math.floor((Date.now() - ts) / 86400000)
    if (d === 0) return 'Today'
    if (d === 1) return 'Yesterday'
    return `${d}d ago`
  }

  return (
    <div className="h-full flex gap-4">
      {/* List */}
      <GlassCard className="w-[320px] shrink-0 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-medium">Notes</h1>
            <button onClick={createNote} className="flex items-center gap-1.5 rounded-full bg-cream text-cream-foreground px-3 py-1.5 text-xs font-medium hover:opacity-90">
              <Plus className="size-3.5" /> New
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full rounded-full bg-white/5 border border-border pl-9 pr-3 py-2 text-sm outline-none focus:border-white/25"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {SUBJECT_FILTERS.map((s) => (
              <Pill key={s} active={subjectFilter === s} onClick={() => setSubjectFilter(s)}>{s}</Pill>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scroll-area p-2 space-y-1">
          {filtered.length === 0 ? (
            <EmptyState icon={<StickyNote className="size-6" />} title="No notes found" hint="Create one to get started." />
          ) : (
            filtered.map((n) => (
              <button
                key={n.id}
                onClick={() => setActiveId(n.id)}
                className={cn(
                  'w-full rounded-xl p-3 text-left transition-all border',
                  n.id === activeId ? 'bg-white/10 border-border' : 'border-transparent hover:bg-white/5'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{n.title}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0">{relTime(n.updatedAt)}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{n.content || 'No content yet'}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] rounded-full bg-primary/15 text-primary px-2 py-0.5">{n.subject}</span>
                  {n.tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-[10px] rounded-full bg-white/5 text-muted-foreground px-2 py-0.5">#{t}</span>
                  ))}
                </div>
              </button>
            ))
          )}
        </div>
      </GlassCard>

      {/* Editor */}
      <GlassCard className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {active ? (
          <>
            <div className="flex items-center justify-between gap-3 p-4 border-b border-border">
              <input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="Note title"
                className="flex-1 bg-transparent text-lg font-medium outline-none placeholder:text-muted-foreground"
              />
              <span className={cn('flex items-center gap-1.5 text-[11px] transition-opacity', savedFlash ? 'text-emerald-300 opacity-100' : 'text-muted-foreground opacity-70')}>
                {savedFlash ? <Check className="size-3.5" /> : <Save className="size-3.5" />}
                {savedFlash ? 'Saved' : 'Auto-save on'}
              </span>
              <button
                onClick={() => {
                  deleteNote(active.id)
                  const rest = useStore.getState().notes
                  setActiveId(rest[0]?.id ?? null)
                }}
                className="grid place-items-center size-9 rounded-full bg-white/5 border border-border text-muted-foreground hover:text-red-300 hover:bg-red-500/10"
                aria-label="Delete note"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Subject</span>
                <select
                  value={draft.subject}
                  onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
                  className="rounded-lg bg-white/5 border border-border px-2.5 py-1.5 text-xs outline-none"
                >
                  {['Physics', 'Chemistry', 'Maths', 'Biology', 'English'].map((s) => (
                    <option key={s} value={s} className="bg-card">{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                <Tag className="size-3.5 text-muted-foreground" />
                <input
                  value={draft.tags}
                  onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))}
                  placeholder="comma, separated, tags"
                  className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <textarea
              value={draft.content}
              onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
              placeholder="Start writing your note... formulas, derivations, doubts, anything."
              className="flex-1 resize-none bg-transparent p-5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground scroll-area"
            />
            <div className="px-5 py-2.5 border-t border-border text-[11px] text-muted-foreground flex items-center gap-4">
              <span>{draft.content.length} chars</span>
              <span>{draft.content.trim() ? draft.content.trim().split(/\s+/).length : 0} words</span>
            </div>
          </>
        ) : (
          <EmptyState
            icon={<FileText className="size-6" />}
            title="No note selected"
            hint="Pick a note from the list or create a new one."
          />
        )}
      </GlassCard>
    </div>
  )
}
