'use client'

import { useStore, type TabId } from '@/lib/store'
import { videos, tests, SUBJECTS } from '@/lib/mock-data'
import { useEffect, useMemo, useState } from 'react'
import { Search, Hash, Play, FileText, BarChart3, CornerDownLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

type Result = { id: string; label: string; sub: string; tab: TabId; icon: React.ReactNode }

export function Spotlight() {
  const { spotlightOpen, setSpotlight, setTab, openTheater, notes } = useStore()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)

  useEffect(() => {
    if (spotlightOpen) {
      setQ('')
      setSel(0)
    }
  }, [spotlightOpen])

  const results = useMemo<Result[]>(() => {
    const query = q.trim().toLowerCase()
    const pages: Result[] = (
      ['home', 'library', 'tests', 'notes', 'live', 'analytics', 'leaderboard', 'achievements', 'profile', 'settings', 'syllabus', 'doubts'] as TabId[]
    ).map((t) => ({ id: `page-${t}`, label: t[0].toUpperCase() + t.slice(1), sub: 'Page', tab: t, icon: <Hash className="size-4" /> }))

    if (!query) return pages.slice(0, 6)

    const vidR: Result[] = videos
      .filter((v) => v.title.toLowerCase().includes(query))
      .slice(0, 5)
      .map((v) => ({ id: v.id, label: v.title, sub: `Video · ${SUBJECTS.find((s) => s.id === v.subjectId)?.name}`, tab: 'library', icon: <Play className="size-4" /> }))
    const testR: Result[] = tests
      .filter((t) => t.name.toLowerCase().includes(query))
      .slice(0, 4)
      .map((t) => ({ id: t.id, label: t.name, sub: `Test · ${t.type}`, tab: 'tests', icon: <BarChart3 className="size-4" /> }))
    const noteR: Result[] = notes
      .filter((n) => n.title.toLowerCase().includes(query))
      .slice(0, 3)
      .map((n) => ({ id: n.id, label: n.title, sub: `Note · ${n.subject}`, tab: 'notes', icon: <FileText className="size-4" /> }))
    const pageR = pages.filter((p) => p.label.toLowerCase().includes(query))

    return [...pageR, ...vidR, ...testR, ...noteR].slice(0, 12)
  }, [q, notes])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSpotlight(!spotlightOpen)
      }
      if (!spotlightOpen) return
      if (e.key === 'Escape') setSpotlight(false)
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSel((s) => Math.min(results.length - 1, s + 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSel((s) => Math.max(0, s - 1))
      }
      if (e.key === 'Enter') {
        const r = results[sel]
        if (r) choose(r)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotlightOpen, results, sel])

  function choose(r: Result) {
    setTab(r.tab)
    if (r.tab === 'library' && r.id.includes('-v')) openTheater(r.id)
    setSpotlight(false)
  }

  if (!spotlightOpen) return null

  return (
    <div className="fixed inset-0 z-[100] grid place-items-start justify-center pt-[12vh] bg-black/50 backdrop-blur-sm" onClick={() => setSpotlight(false)}>
      <div
        className="w-[min(640px,92vw)] glass-strong rounded-2xl elev-3 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setSel(0)
            }}
            placeholder="Search videos, tests, notes, pages…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-[52vh] overflow-y-auto scroll-thin p-2">
          {results.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No results for “{q}”</p>}
          {results.map((r, i) => (
            <button
              key={r.id}
              onMouseEnter={() => setSel(i)}
              onClick={() => choose(r)}
              className={cn(
                'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                sel === i ? 'bg-white/10' : 'hover:bg-white/5'
              )}
            >
              <span className="grid place-items-center size-8 rounded-lg bg-white/5 text-muted-foreground">{r.icon}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm truncate">{r.label}</span>
                <span className="block text-xs text-muted-foreground">{r.sub}</span>
              </span>
              {sel === i && <CornerDownLeft className="size-3.5 text-muted-foreground" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
