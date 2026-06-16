'use client'

import { useMemo, useState } from 'react'
import {
  Footprints, Flame, Zap, Shield, Target, Crown, Swords, Atom, FlaskConical,
  Sigma, Trophy, Moon, Sunrise, Medal, Sparkles, MessageCircleQuestion, Lock, Check,
} from 'lucide-react'
import { GlassCard, Pill, ProgressRing } from '@/components/delta/ui'
import { achievements, type Achievement } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const ICONS: Record<string, any> = {
  Footprints, Flame, Zap, Shield, Target, Crown, Swords, Atom, FlaskConical,
  Sigma, Trophy, Moon, Sunrise, Medal, Sparkles, MessageCircleQuestion,
}

const RARITY: Record<string, { ring: string; bg: string; label: string }> = {
  Common: { ring: 'text-zinc-300', bg: 'bg-zinc-500/15', label: 'text-zinc-300' },
  Rare: { ring: 'text-sky-300', bg: 'bg-sky-500/15', label: 'text-sky-300' },
  Epic: { ring: 'text-fuchsia-300', bg: 'bg-fuchsia-500/15', label: 'text-fuchsia-300' },
  Legendary: { ring: 'text-amber-300', bg: 'bg-amber-500/15', label: 'text-amber-300' },
}

const CATEGORIES = ['All', 'Study Streak', 'Test Mastery', 'Subject Expert', 'Special']

export function AchievementsPage() {
  const [cat, setCat] = useState('All')
  const earned = achievements.filter((a) => a.earned).length
  const list = useMemo(() => (cat === 'All' ? achievements : achievements.filter((a) => a.category === cat)), [cat])

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Achievements</h1>
          <p className="text-sm text-muted-foreground">{earned} of {achievements.length} unlocked</p>
        </div>
        <div className="flex items-center gap-3">
          <ProgressRing value={earned / achievements.length} size={48} stroke={5} valueClass="text-primary">
            <span className="text-[11px] tabular">{Math.round((earned / achievements.length) * 100)}%</span>
          </ProgressRing>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map((c) => <Pill key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Pill>)}
      </div>

      <div className="flex-1 overflow-y-auto scroll-area pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {list.map((a) => {
            const Icon = ICONS[a.icon] ?? Trophy
            const r = RARITY[a.rarity]
            return (
              <GlassCard
                key={a.id}
                className={cn('p-4 flex flex-col gap-3 relative overflow-hidden transition-all', !a.earned && 'opacity-80')}
              >
                <div className="flex items-start justify-between">
                  <span className={cn('grid place-items-center size-12 rounded-2xl relative', a.earned ? r.bg : 'bg-white/5')}>
                    <Icon className={cn('size-6', a.earned ? r.ring : 'text-muted-foreground')} />
                    {!a.earned && (
                      <span className="absolute -bottom-1 -right-1 grid place-items-center size-5 rounded-full bg-card border border-border">
                        <Lock className="size-2.5 text-muted-foreground" />
                      </span>
                    )}
                    {a.earned && (
                      <span className="absolute -bottom-1 -right-1 grid place-items-center size-5 rounded-full bg-emerald-500 text-white">
                        <Check className="size-3" />
                      </span>
                    )}
                  </span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', r.bg, r.label)}>{a.rarity}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{a.description}</p>
                </div>
                {a.earned ? (
                  <p className="text-[11px] text-emerald-300 mt-auto">Unlocked {a.earnedAt}</p>
                ) : (
                  <div className="mt-auto">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span className="tabular">{Math.round(a.progress * 100)}%</span>
                    </div>
                    <span className="block h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <span className="block h-full rounded-full bg-primary" style={{ width: `${a.progress * 100}%` }} />
                    </span>
                  </div>
                )}
              </GlassCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}
