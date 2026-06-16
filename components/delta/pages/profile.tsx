'use client'

import {
  Flame, Clock, Trophy, Target, Award, MapPin, Calendar, Pencil, Atom,
  FlaskConical, Sigma, TrendingUp, BookOpen,
} from 'lucide-react'
import { GlassCard, Avatar, ProgressRing } from '@/components/delta/ui'
import { useStore } from '@/lib/store'
import { achievements, activity, SUBJECTS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const ACT_ICON: Record<string, any> = { video: BookOpen, test: Target, note: Pencil, live: Flame, streak: TrendingUp, badge: Award }

export function ProfilePage() {
  const streak = useStore((s) => s.streak)
  const totalHours = useStore((s) => s.totalHours())
  const history = useStore((s) => s.history)
  const subjectProgress = useStore((s) => s.subjectProgress())
  const setTab = useStore((s) => s.setTab)
  const earned = achievements.filter((a) => a.earned)

  const avg = history.length ? Math.round(history.reduce((a, h) => a + (h.score / h.total) * 100, 0) / history.length) : 0

  return (
    <div className="h-full overflow-y-auto scroll-area">
      <div className="flex flex-col gap-4 pb-2">
        {/* Header card */}
        <GlassCard strong className="p-6 relative overflow-hidden">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="relative">
              <Avatar name="Aryan Sharma" size={88} />
              <span className="absolute -bottom-1 -right-1 grid place-items-center size-7 rounded-full bg-amber-400 text-black text-[11px] font-bold">47</span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-light">Aryan Sharma</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="size-3.5" /> Kota, Rajasthan</span>
                <span className="flex items-center gap-1"><Calendar className="size-3.5" /> Joined Jan 2026</span>
                <span className="rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[11px]">Nucleus 2026</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2 max-w-xl">JEE 2027 aspirant. Targeting a top 500 rank. Physics is my strength, grinding through organic chemistry.</p>
            </div>
            <button onClick={() => setTab('settings')} className="flex items-center gap-2 rounded-full bg-white/5 border border-border px-4 py-2 text-sm hover:bg-white/10">
              <Pencil className="size-4" /> Edit Profile
            </button>
          </div>
        </GlassCard>

        {/* Stat strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={<Flame className="size-5 text-amber-300" />} value={`${streak}`} label="Day Streak" />
          <Stat icon={<Clock className="size-5 text-primary" />} value={`${totalHours}h`} label="Study Time" />
          <Stat icon={<Target className="size-5 text-emerald-300" />} value={`${avg}%`} label="Avg Score" />
          <Stat icon={<Trophy className="size-5 text-amber-300" />} value={`${earned.length}`} label="Badges" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Subject mastery */}
          <GlassCard className="p-4 lg:col-span-2">
            <p className="text-sm font-medium mb-4">Subject Mastery</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {SUBJECTS.slice(0, 6).map((s) => {
                const v = subjectProgress[s.id] ?? 0
                return (
                  <div key={s.id} className="flex flex-col items-center gap-2">
                    <ProgressRing value={v} size={72} stroke={6} valueClass="text-primary">
                      <span className="text-sm tabular">{Math.round(v * 100)}%</span>
                    </ProgressRing>
                    <span className="text-xs text-muted-foreground text-center">{s.name}</span>
                  </div>
                )
              })}
            </div>
          </GlassCard>

          {/* Recent activity */}
          <GlassCard className="p-4 flex flex-col">
            <p className="text-sm font-medium mb-3">Recent Activity</p>
            <div className="flex-1 space-y-3 overflow-y-auto scroll-area max-h-72 pr-1">
              {activity.slice(0, 10).map((a) => {
                const Icon = ACT_ICON[a.type] ?? BookOpen
                return (
                  <div key={a.id} className="flex items-start gap-3">
                    <span className="grid place-items-center size-8 rounded-lg bg-white/5 shrink-0"><Icon className="size-4 text-primary" /></span>
                    <div className="min-w-0">
                      <p className="text-xs leading-snug">{a.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {a.minutesAgo < 60 ? `${a.minutesAgo}m ago` : `${Math.round(a.minutesAgo / 60)}h ago`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </div>

        {/* Recent badges */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Recent Badges</p>
            <button onClick={() => setTab('achievements')} className="text-xs text-primary hover:underline">View all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto scroll-area pb-1">
            {earned.slice(0, 8).map((a) => (
              <div key={a.id} className="shrink-0 w-28 rounded-xl border border-border bg-white/[0.02] p-3 text-center">
                <span className="inline-grid place-items-center size-10 rounded-xl bg-amber-500/15 text-amber-300 mb-2"><Award className="size-5" /></span>
                <p className="text-[11px] font-medium truncate">{a.title}</p>
                <p className="text-[10px] text-muted-foreground">{a.earnedAt}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <GlassCard className="p-4 flex items-center gap-3">
      <span className="grid place-items-center size-11 rounded-xl bg-white/5">{icon}</span>
      <div>
        <p className="text-2xl font-light tabular leading-none">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
      </div>
    </GlassCard>
  )
}
