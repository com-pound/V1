'use client'

import { useMemo, useState } from 'react'
import {
  Atom, FlaskConical, Sigma, Dna, Cpu, BookOpen, ChevronDown, Check, Circle,
  PlayCircle, Clock,
} from 'lucide-react'
import { GlassCard, Pill, ProgressRing } from '@/components/delta/ui'
import { useStore } from '@/lib/store'
import { SUBJECTS, chapters, videos, type SubjectId } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const ICONS: Record<string, any> = { Atom, FlaskConical, Sigma, Dna, Cpu, BookOpen }

export function SyllabusPage() {
  const [subject, setSubject] = useState<SubjectId>('physics')
  const [openChapter, setOpenChapter] = useState<string | null>(null)
  const vp = useStore((s) => s.videoProgress)
  const openTheater = useStore((s) => s.openTheater)

  const subjectChapters = useMemo(() => chapters.filter((c) => c.subjectId === subject), [subject])

  function chapterStats(cid: string) {
    const vids = videos.filter((v) => v.chapterId === cid)
    const done = vids.filter((v) => vp[v.id]?.completed).length
    return { total: vids.length, done, pct: vids.length ? done / vids.length : 0 }
  }

  const overall = useMemo(() => {
    const vids = videos.filter((v) => v.subjectId === subject)
    const done = vids.filter((v) => vp[v.id]?.completed).length
    return { total: vids.length, done, pct: vids.length ? done / vids.length : 0 }
  }, [subject, vp])

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Syllabus Tracker</h1>
          <p className="text-sm text-muted-foreground">Track your chapter-wise completion across the full JEE syllabus</p>
        </div>
        <div className="flex items-center gap-3">
          <ProgressRing value={overall.pct} size={48} stroke={5} valueClass="text-primary">
            <span className="text-[11px] tabular">{Math.round(overall.pct * 100)}%</span>
          </ProgressRing>
          <div className="text-sm">
            <p className="tabular">{overall.done}/{overall.total}</p>
            <p className="text-[11px] text-muted-foreground">topics done</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {SUBJECTS.map((s) => {
          const Icon = ICONS[s.icon]
          return (
            <button
              key={s.id}
              onClick={() => { setSubject(s.id); setOpenChapter(null) }}
              className={cn(
                'flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition-all border',
                subject === s.id ? 'bg-cream text-cream-foreground border-transparent' : 'bg-white/5 border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="size-3.5" /> {s.name}
            </button>
          )
        })}
      </div>

      <GlassCard className="flex-1 overflow-y-auto scroll-area p-2">
        <div className="space-y-1.5">
          {subjectChapters.map((c) => {
            const st = chapterStats(c.id)
            const open = openChapter === c.id
            const vids = videos.filter((v) => v.chapterId === c.id)
            return (
              <div key={c.id} className="rounded-xl border border-border overflow-hidden bg-white/[0.02]">
                <button
                  onClick={() => setOpenChapter(open ? null : c.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.04] text-left"
                >
                  <ProgressRing value={st.pct} size={40} stroke={4} valueClass={st.pct === 1 ? 'text-emerald-400' : 'text-primary'}>
                    {st.pct === 1 ? <Check className="size-4 text-emerald-400" /> : <span className="text-[10px] tabular">{Math.round(st.pct * 100)}</span>}
                  </ProgressRing>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{c.number}. {c.title}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                      <span>{st.done}/{st.total} topics</span>
                      <span className="flex items-center gap-1"><Clock className="size-3" /> {c.durationMin}m</span>
                    </p>
                  </div>
                  <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
                </button>
                {open && (
                  <div className="border-t border-border divide-y divide-border/40">
                    {vids.map((v) => {
                      const p = vp[v.id]
                      return (
                        <button
                          key={v.id}
                          onClick={() => openTheater(v.id)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 pl-5 hover:bg-white/[0.04] text-left"
                        >
                          {p?.completed ? (
                            <Check className="size-4 text-emerald-400 shrink-0" />
                          ) : p && p.fraction > 0 ? (
                            <PlayCircle className="size-4 text-primary shrink-0" />
                          ) : (
                            <Circle className="size-4 text-muted-foreground shrink-0" />
                          )}
                          <span className="text-sm flex-1 min-w-0 truncate">{v.title}</span>
                          {p && p.fraction > 0 && !p.completed && (
                            <span className="text-[11px] text-primary">{Math.round(p.fraction * 100)}%</span>
                          )}
                          <span className="text-[11px] text-muted-foreground">{v.instructor}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </GlassCard>
    </div>
  )
}
