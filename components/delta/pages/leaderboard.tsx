'use client'

import { useMemo, useState } from 'react'
import { Crown, TrendingUp, TrendingDown, Minus, Flame, Search, Trophy } from 'lucide-react'
import { GlassCard, Pill, Avatar } from '@/components/delta/ui'
import { leaderboard } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const SCOPES = ['Global', 'My Batch', 'Weekly']

export function LeaderboardPage() {
  const [scope, setScope] = useState('Global')
  const [query, setQuery] = useState('')

  const me = useMemo(() => leaderboard.find((l) => l.you)!, [])

  const list = useMemo(() => {
    let base = leaderboard
    if (scope === 'My Batch') base = leaderboard.filter((l) => l.batch === me.batch).map((l, i) => ({ ...l, rank: i + 1 }))
    if (scope === 'Weekly') base = [...leaderboard].sort((a, b) => b.streak - a.streak).map((l, i) => ({ ...l, rank: i + 1 }))
    if (query.trim()) base = base.filter((l) => l.name.toLowerCase().includes(query.toLowerCase()))
    return base.slice(0, 100)
  }, [scope, query, me])

  const podium = list.slice(0, 3)

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">{leaderboard.length.toLocaleString()} learners competing</p>
        </div>
        <div className="flex items-center gap-2">
          {SCOPES.map((s) => <Pill key={s} active={scope === s} onClick={() => setScope(s)}>{s}</Pill>)}
        </div>
      </div>

      {/* Podium */}
      {!query && (
        <div className="grid grid-cols-3 gap-3">
          {[podium[1], podium[0], podium[2]].map((p, i) => {
            if (!p) return <div key={i} />
            const isFirst = p.rank === 1
            return (
              <GlassCard
                key={p.id}
                strong={isFirst}
                className={cn(
                  'p-4 flex flex-col items-center text-center gap-2 relative',
                  isFirst ? 'order-2 -mt-3' : i === 0 ? 'order-1 mt-4' : 'order-3 mt-4'
                )}
              >
                {isFirst && <Crown className="size-6 text-amber-300 absolute -top-3" />}
                <Avatar name={p.name} size={isFirst ? 64 : 52} />
                <div>
                  <p className="text-sm font-medium truncate max-w-[120px]">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">{p.batch}</p>
                </div>
                <div className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  isFirst ? 'bg-amber-400 text-black' : p.rank === 2 ? 'bg-white/20' : 'bg-amber-700/40 text-amber-200'
                )}>
                  #{p.rank} · {p.score.toLocaleString()}
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}

      {/* You bar */}
      <GlassCard strong className="p-3 flex items-center gap-3 border-primary/30">
        <span className="grid place-items-center size-10 rounded-xl bg-primary text-primary-foreground font-semibold tabular shrink-0">#{me.rank}</span>
        <Avatar name={me.name} size={38} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{me.name} <span className="text-[11px] text-primary">(You)</span></p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Flame className="size-3 text-amber-300" /> {me.streak} day streak · {me.batch}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-light tabular">{me.score.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-300 flex items-center gap-1 justify-end"><TrendingUp className="size-3" /> +{me.change} this week</p>
        </div>
      </GlassCard>

      {/* Full list */}
      <GlassCard className="flex-1 overflow-hidden flex flex-col">
        <div className="p-3 border-b border-border relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search learners..."
            className="w-full rounded-full bg-white/5 border border-border pl-10 pr-4 py-2 text-sm outline-none focus:border-white/25"
          />
        </div>
        <div className="flex-1 overflow-y-auto scroll-area">
          {list.map((l) => (
            <div
              key={l.id}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 border-b border-border/40',
                l.you ? 'bg-primary/10' : 'hover:bg-white/[0.03]'
              )}
            >
              <span className={cn('w-8 text-sm tabular text-center', l.rank <= 3 ? 'text-amber-300 font-semibold' : 'text-muted-foreground')}>
                {l.rank}
              </span>
              <Avatar name={l.name} size={32} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{l.name}{l.you && <span className="text-[11px] text-primary ml-1">(You)</span>}</p>
                <p className="text-[11px] text-muted-foreground">{l.batch}</p>
              </div>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Flame className="size-3 text-amber-300/70" /> {l.streak}</span>
              <span className="w-16 text-right text-sm font-medium tabular">{l.score.toLocaleString()}</span>
              <span className="w-12 text-right">
                {l.change > 0 ? <span className="text-[11px] text-emerald-300 flex items-center gap-0.5 justify-end"><TrendingUp className="size-3" />{l.change}</span>
                  : l.change < 0 ? <span className="text-[11px] text-red-300 flex items-center gap-0.5 justify-end"><TrendingDown className="size-3" />{Math.abs(l.change)}</span>
                  : <span className="text-[11px] text-muted-foreground flex justify-end"><Minus className="size-3" /></span>}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
