'use client'

import { useMemo, useState } from 'react'
import {
  Atom, FlaskConical, Sigma, Dna, Cpu, BookOpen, Search, Play, Check,
  ChevronRight, Clock, CircleDot, Filter, GraduationCap, X,
} from 'lucide-react'
import { GlassCard, Pill, ProgressRing, EmptyState } from '@/components/delta/ui'
import { useStore } from '@/lib/store'
import { SUBJECTS, chapters, videos, fmtDuration, type SubjectId } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const ICONS: Record<string, any> = { Atom, FlaskConical, Sigma, Dna, Cpu, BookOpen }

export function LibraryPage() {
  const [subject, setSubject] = useState<SubjectId>('physics')
  const [chapterId, setChapterId] = useState<string>('physics-c1')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'inprogress' | 'completed' | 'notstarted'>('all')
  const vp = useStore((s) => s.videoProgress)
  const openTheater = useStore((s) => s.openTheater)

  const subjectChapters = useMemo(
    () => chapters.filter((c) => c.subjectId === subject),
    [subject]
  )

  const chapterVideos = useMemo(() => {
    let list = videos.filter((v) => v.chapterId === chapterId)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = videos.filter(
        (v) => v.subjectId === subject && (v.title.toLowerCase().includes(q) || v.instructor.toLowerCase().includes(q))
      )
    }
    if (filter !== 'all') {
      list = list.filter((v) => {
        const p = vp[v.id]
        if (filter === 'completed') return p?.completed
        if (filter === 'inprogress') return p && !p.completed && p.fraction > 0
        if (filter === 'notstarted') return !p || p.fraction === 0
        return true
      })
    }
    return list
  }, [chapterId, query, subject, filter, vp])

  function chapterProgress(cid: string) {
    const vids = videos.filter((v) => v.chapterId === cid)
    const done = vids.filter((v) => vp[v.id]?.completed).length
    return vids.length ? done / vids.length : 0
  }

  return (
    <div className="h-full flex gap-4">
      {/* Column 1: Subjects */}
      <GlassCard className="w-[200px] shrink-0 p-3 flex flex-col gap-1.5 overflow-y-auto scroll-area">
        <p className="px-2 pt-1 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Subjects</p>
        {SUBJECTS.map((s) => {
          const Icon = ICONS[s.icon]
          const active = s.id === subject
          const subVids = videos.filter((v) => v.subjectId === s.id)
          const done = subVids.filter((v) => vp[v.id]?.completed).length
          return (
            <button
              key={s.id}
              onClick={() => {
                setSubject(s.id)
                const first = chapters.find((c) => c.subjectId === s.id)
                if (first) setChapterId(first.id)
                setQuery('')
              }}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all group',
                active ? 'bg-cream text-cream-foreground' : 'hover:bg-white/5 text-foreground'
              )}
            >
              <span
                className="grid place-items-center size-8 rounded-lg shrink-0"
                style={{ background: active ? 'rgba(0,0,0,0.08)' : `color-mix(in oklch, ${s.color} 18%, transparent)` }}
              >
                <Icon className="size-4" style={{ color: active ? 'inherit' : s.color }} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium truncate">{s.name}</span>
                <span className={cn('block text-[11px]', active ? 'text-cream-foreground/60' : 'text-muted-foreground')}>
                  {done}/{subVids.length} done
                </span>
              </span>
            </button>
          )
        })}
      </GlassCard>

      {/* Column 2: Chapters */}
      <GlassCard className="w-[280px] shrink-0 p-3 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-2 pt-1 pb-2">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Chapters</p>
          <span className="text-[11px] text-muted-foreground">{subjectChapters.length}</span>
        </div>
        <div className="flex flex-col gap-1.5 overflow-y-auto scroll-area pr-1">
          {subjectChapters.map((c) => {
            const prog = chapterProgress(c.id)
            const active = c.id === chapterId && !query
            return (
              <button
                key={c.id}
                onClick={() => {
                  setChapterId(c.id)
                  setQuery('')
                }}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all',
                  active ? 'bg-white/10 border border-border' : 'hover:bg-white/5 border border-transparent'
                )}
              >
                <ProgressRing value={prog} size={36} stroke={4} valueClass="text-primary">
                  <span className="text-[10px] tabular text-muted-foreground">{Math.round(prog * 100)}</span>
                </ProgressRing>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium truncate">
                    {c.number}. {c.title}
                  </span>
                  <span className="block text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" /> {c.durationMin}m · {c.topicCount} topics
                  </span>
                </span>
                <ChevronRight className="size-4 text-muted-foreground shrink-0" />
              </button>
            )
          })}
        </div>
      </GlassCard>

      {/* Column 3: Videos */}
      <GlassCard className="flex-1 min-w-0 p-4 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lectures in this subject..."
              className="w-full rounded-full bg-white/5 border border-border pl-9 pr-4 py-2 text-sm outline-none focus:border-white/25 placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Filter className="size-3.5 text-muted-foreground" />
          {([
            ['all', 'All'],
            ['inprogress', 'In Progress'],
            ['completed', 'Completed'],
            ['notstarted', 'Not Started'],
          ] as const).map(([v, l]) => (
            <Pill key={v} active={filter === v} onClick={() => setFilter(v)}>
              {l}
            </Pill>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scroll-area pr-1">
          {chapterVideos.length === 0 ? (
            <EmptyState
              icon={<GraduationCap className="size-6" />}
              title="No lectures match"
              hint="Try a different filter or search term."
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {chapterVideos.map((v) => {
                const p = vp[v.id]
                const pct = p ? Math.round(p.fraction * 100) : 0
                return (
                  <button
                    key={v.id}
                    onClick={() => openTheater(v.id)}
                    className="group text-left rounded-xl border border-border bg-white/[0.03] hover:bg-white/[0.06] transition-all overflow-hidden"
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-white/10 to-white/[0.02] grid place-items-center overflow-hidden">
                      <span className="grid place-items-center size-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform">
                        <Play className="size-5 ml-0.5 fill-current" />
                      </span>
                      <span className="absolute bottom-2 right-2 text-[11px] tabular bg-black/50 px-1.5 py-0.5 rounded">
                        {fmtDuration(v.durationSec)}
                      </span>
                      {p?.completed && (
                        <span className="absolute top-2 left-2 grid place-items-center size-6 rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3.5" />
                        </span>
                      )}
                      {pct > 0 && (
                        <span className="absolute bottom-0 left-0 h-1 bg-primary" style={{ width: `${pct}%` }} />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium line-clamp-2 leading-snug">{v.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1.5">
                        <CircleDot className="size-3" /> {v.instructor}
                        {pct > 0 && !p?.completed && <span className="ml-auto text-primary">{pct}% watched</span>}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
