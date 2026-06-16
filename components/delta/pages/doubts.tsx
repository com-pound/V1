'use client'

import { useMemo, useState } from 'react'
import {
  MessageCircleQuestion, Plus, ArrowBigUp, MessageSquare, CheckCircle2,
  Search, Send, X, Clock,
} from 'lucide-react'
import { GlassCard, Pill, Avatar, EmptyState } from '@/components/delta/ui'
import { doubts as seedDoubts } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const FILTERS = ['All', 'Unresolved', 'Resolved', 'My Doubts']
const SUBJECTS = ['Physics', 'Chemistry', 'Maths']

interface Doubt {
  id: string
  text: string
  subject: string
  asker: string
  answers: number
  upvotes: number
  hoursAgo: number
  resolved: boolean
  mine: boolean
}

export function DoubtsPage() {
  const [doubts, setDoubts] = useState<Doubt[]>(seedDoubts as Doubt[])
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [composing, setComposing] = useState(false)
  const [voted, setVoted] = useState<Record<string, boolean>>({})
  const [draft, setDraft] = useState({ text: '', subject: 'Physics' })

  const list = useMemo(() => {
    let l = doubts
    if (filter === 'Unresolved') l = l.filter((d) => !d.resolved)
    if (filter === 'Resolved') l = l.filter((d) => d.resolved)
    if (filter === 'My Doubts') l = l.filter((d) => d.mine)
    if (query.trim()) l = l.filter((d) => d.text.toLowerCase().includes(query.toLowerCase()))
    return l
  }, [doubts, filter, query])

  function postDoubt() {
    if (!draft.text.trim()) return
    setDoubts((d) => [
      { id: `doubt-${Date.now()}`, text: draft.text.trim(), subject: draft.subject, asker: 'You', answers: 0, upvotes: 0, hoursAgo: 0, resolved: false, mine: true },
      ...d,
    ])
    setDraft({ text: '', subject: 'Physics' })
    setComposing(false)
  }

  function vote(id: string) {
    setVoted((v) => {
      const has = v[id]
      setDoubts((ds) => ds.map((d) => (d.id === id ? { ...d, upvotes: d.upvotes + (has ? -1 : 1) } : d)))
      return { ...v, [id]: !has }
    })
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Doubt Forum</h1>
          <p className="text-sm text-muted-foreground">{doubts.filter((d) => !d.resolved).length} open · ask anything, get answers</p>
        </div>
        <button onClick={() => setComposing(true)} className="flex items-center gap-2 rounded-full bg-cream text-cream-foreground px-4 py-2 text-sm font-medium hover:opacity-90">
          <Plus className="size-4" /> Ask a Doubt
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search doubts..."
            className="w-full rounded-full bg-white/5 border border-border pl-9 pr-4 py-2 text-sm outline-none focus:border-white/25"
          />
        </div>
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Pill>)}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-area pr-1">
        {list.length === 0 ? (
          <EmptyState icon={<MessageCircleQuestion className="size-6" />} title="No doubts here" hint="Be the first to ask a question." />
        ) : (
          <div className="space-y-2.5">
            {list.map((d) => (
              <GlassCard key={d.id} className="p-4 flex gap-4 hover:bg-white/[0.04] transition-colors">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <button
                    onClick={() => vote(d.id)}
                    className={cn(
                      'grid place-items-center size-9 rounded-lg border transition-colors',
                      voted[d.id] ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-white/5 border-border text-muted-foreground hover:text-foreground'
                    )}
                    aria-label="Upvote"
                  >
                    <ArrowBigUp className={cn('size-5', voted[d.id] && 'fill-current')} />
                  </button>
                  <span className="text-xs tabular">{d.upvotes}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed">{d.text}</p>
                  <div className="flex items-center gap-3 mt-3 flex-wrap text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Avatar name={d.asker} size={20} /> {d.asker}</span>
                    <span className="rounded-full bg-primary/15 text-primary px-2 py-0.5">{d.subject}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="size-3" /> {d.answers} answers</span>
                    <span className="flex items-center gap-1"><Clock className="size-3" /> {d.hoursAgo === 0 ? 'just now' : `${d.hoursAgo}h ago`}</span>
                    {d.resolved && (
                      <span className="flex items-center gap-1 text-emerald-300 ml-auto"><CheckCircle2 className="size-3.5" /> Resolved</span>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Compose modal */}
      {composing && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setComposing(false)}>
          <GlassCard strong className="w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-lg font-medium">Ask a Doubt</p>
              <button onClick={() => setComposing(false)} className="grid place-items-center size-8 rounded-full bg-white/5 hover:bg-white/10" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-muted-foreground">Subject</span>
              {SUBJECTS.map((s) => (
                <Pill key={s} active={draft.subject === s} onClick={() => setDraft((d) => ({ ...d, subject: s }))}>{s}</Pill>
              ))}
            </div>
            <textarea
              value={draft.text}
              onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
              autoFocus
              placeholder="Describe your doubt clearly. Mention the chapter and what you've tried..."
              className="w-full h-32 resize-none rounded-xl bg-white/5 border border-border p-3 text-sm outline-none focus:border-white/25 scroll-area"
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button onClick={() => setComposing(false)} className="rounded-full bg-white/5 border border-border px-4 py-2 text-sm hover:bg-white/10">Cancel</button>
              <button onClick={postDoubt} disabled={!draft.text.trim()} className="flex items-center gap-2 rounded-full bg-cream text-cream-foreground px-4 py-2 text-sm font-medium disabled:opacity-40">
                <Send className="size-4" /> Post Doubt
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
