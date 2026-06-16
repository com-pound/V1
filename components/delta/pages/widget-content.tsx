'use client'

import { useStore, useSubjectProgress } from '@/lib/store'
import { SUBJECTS, liveSessions, tests, leaderboard, activity } from '@/lib/mock-data'
import { ProgressRing } from '../ui'
import { cn } from '@/lib/utils'
import {
  Flame, Clock, Target, BookMarked, StickyNote, Trophy, Activity as ActivityIcon,
  TrendingUp, Radio, CalendarClock, ArrowUpRight, Play,
} from 'lucide-react'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function WidgetGreeting() {
  const firstName = useStore((s) => s.profile.name).split(' ')[0]
  return (
    <div className="flex items-center justify-between h-full px-1">
      <div>
        <p className="text-2xl font-light tracking-tight text-balance">
          {greeting()}, <span className="font-medium">{firstName}</span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · Let&apos;s make today count.
        </p>
      </div>
      <div className="hidden lg:flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2">
        <Flame className="size-4 text-primary" />
        <span className="text-sm font-medium text-primary">23 day streak</span>
      </div>
    </div>
  )
}

export function WidgetStreak() {
  const streak = useStore((s) => s.streak)
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <div className="flex flex-col h-full">
      <Header icon={<Flame className="size-3.5" />} title="Streak" />
      <div className="flex items-center gap-3 mt-1">
        <span className="text-4xl font-light tabular">{streak}</span>
        <span className="text-xs text-muted-foreground leading-tight">days<br />in a row</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5 mt-auto">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className={cn('size-5 rounded-md', i < 6 ? 'bg-primary' : 'bg-white/10')} />
            <span className="text-[9px] text-muted-foreground">{d}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WidgetNextClass() {
  const setTab = useStore((s) => s.setTab)
  const next = liveSessions.find((l) => !l.isLive) ?? liveSessions[0]
  const live = liveSessions.find((l) => l.isLive)
  return (
    <div className="flex flex-col h-full">
      <Header icon={<CalendarClock className="size-3.5" />} title="Next Class" />
      <p className="text-sm font-medium mt-1">{(live ?? next).subject}</p>
      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{(live ?? next).topic}</p>
      <p className="text-[11px] text-muted-foreground mt-1">{(live ?? next).instructor}</p>
      <div className="mt-auto flex items-center justify-between">
        {live ? (
          <span className="flex items-center gap-1.5 text-xs text-primary font-medium"><span className="size-1.5 rounded-full bg-primary live-dot" />Live now</span>
        ) : (
          <span className="text-xs text-muted-foreground tabular">in {next.startsInHours}h 00m</span>
        )}
        <button onClick={() => setTab('live')} className="rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
          {live ? 'Join' : 'Remind'}
        </button>
      </div>
    </div>
  )
}

export function WidgetDailyGoal() {
  const { hoursToday, dailyGoalHours, setTab } = useStore()
  const pct = Math.min(1, hoursToday / dailyGoalHours)
  return (
    <div className="flex flex-col h-full items-center">
      <Header icon={<Target className="size-3.5" />} title="Daily Goal" full />
      <ProgressRing value={pct} size={92} stroke={9} className="my-1">
        <div className="text-center">
          <span className="text-xl font-light tabular">{Math.round(pct * 100)}%</span>
        </div>
      </ProgressRing>
      <p className="text-xs text-muted-foreground">{hoursToday}h / {dailyGoalHours}h</p>
      <button onClick={() => setTab('library')} className="mt-auto w-full rounded-full bg-white/5 border border-border py-1.5 text-xs hover:bg-white/10">Study Now</button>
    </div>
  )
}

export function WidgetSubjectRings() {
  const subjectProgress = useSubjectProgress()
  const core = SUBJECTS.slice(0, 3)
  return (
    <div className="flex flex-col h-full">
      <Header icon={<TrendingUp className="size-3.5" />} title="Subject Progress" />
      <div className="flex items-center justify-around flex-1">
        {core.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-1.5">
            <ProgressRing value={subjectProgress[s.id]} size={68} stroke={7}>
              <span className="text-sm font-light tabular">{Math.round(subjectProgress[s.id] * 100)}</span>
            </ProgressRing>
            <span className="text-[11px] text-muted-foreground">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WidgetTestDue() {
  const setTab = useStore((s) => s.setTab)
  const due = tests.filter((t) => t.deadlineHours !== null).sort((a, b) => (a.deadlineHours! - b.deadlineHours!)).slice(0, 3)
  return (
    <div className="flex flex-col h-full">
      <Header icon={<BookMarked className="size-3.5" />} title="Tests Due" />
      <div className="flex-1 space-y-2 overflow-y-auto scroll-thin mt-1">
        {due.map((t) => (
          <div key={t.id} className="flex items-center gap-2">
            <span className={cn('size-1.5 rounded-full shrink-0', t.deadlineHours! < 24 ? 'bg-destructive' : 'bg-warning')} />
            <span className="flex-1 min-w-0">
              <span className="block text-xs truncate">{t.name}</span>
              <span className="text-[10px] text-muted-foreground">{t.deadlineHours}h left</span>
            </span>
            <button onClick={() => setTab('tests')} className="rounded-full bg-white/5 border border-border px-2.5 py-1 text-[11px] hover:bg-white/10">Start</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WidgetQuickNotes() {
  const { quickScratch, setQuickScratch, notes } = useStore()
  return (
    <div className="flex flex-col h-full">
      <Header icon={<StickyNote className="size-3.5" />} title="Quick Notes" />
      <textarea
        value={quickScratch}
        onChange={(e) => setQuickScratch(e.target.value)}
        placeholder="Jot something down…"
        className="w-full resize-none rounded-lg bg-white/5 border border-border p-2 text-xs outline-none focus:border-primary/40 h-14 scroll-thin"
      />
      <div className="mt-2 space-y-1 overflow-y-auto scroll-thin">
        {notes.slice(0, 2).map((n) => (
          <p key={n.id} className="text-[11px] text-muted-foreground truncate">· {n.title}</p>
        ))}
      </div>
    </div>
  )
}

export function WidgetLeaderPeek() {
  const setTab = useStore((s) => s.setTab)
  const you = leaderboard.find((l) => l.you)!
  return (
    <div className="flex flex-col h-full">
      <Header icon={<Trophy className="size-3.5" />} title="Leaderboard" action={() => setTab('leaderboard')} />
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-3xl font-light tabular">#{you.rank}</span>
        <span className="text-xs text-success flex items-center"><ArrowUpRight className="size-3" />{you.change}</span>
      </div>
      <p className="text-xs text-muted-foreground">{you.score} pts</p>
      <div className="mt-auto space-y-1">
        {leaderboard.slice(0, 3).map((l, i) => (
          <div key={l.id} className="flex items-center gap-2 text-[11px]">
            <span className="text-primary w-3">{i + 1}</span>
            <span className="flex-1 truncate text-muted-foreground">{l.name}</span>
            <span className="tabular">{l.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WidgetRecentActivity() {
  return (
    <div className="flex flex-col h-full">
      <Header icon={<ActivityIcon className="size-3.5" />} title="Recent Activity" />
      <div className="flex-1 space-y-2 overflow-y-auto scroll-thin mt-1">
        {activity.slice(0, 5).map((a) => (
          <div key={a.id} className="flex gap-2">
            <span className="mt-1 size-1.5 rounded-full bg-primary/70 shrink-0" />
            <span className="min-w-0">
              <span className="block text-[11px] line-clamp-1">{a.label}</span>
              <span className="text-[10px] text-muted-foreground">{a.minutesAgo < 60 ? `${a.minutesAgo}m` : `${Math.floor(a.minutesAgo / 60)}h`} ago</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WidgetBatchRank() {
  const you = leaderboard.find((l) => l.you)!
  const nearby = leaderboard.slice(you.rank - 2, you.rank + 1)
  return (
    <div className="flex flex-col h-full">
      <Header icon={<TrendingUp className="size-3.5" />} title="Batch Rank" />
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-3xl font-light tabular">#{you.rank}</span>
        <span className="text-[11px] text-muted-foreground">{you.batch}</span>
      </div>
      <div className="mt-auto space-y-1">
        {nearby.map((l) => (
          <div key={l.id} className={cn('flex items-center gap-2 text-[11px] rounded-md px-1.5 py-1', l.you && 'bg-primary/10')}>
            <span className="text-muted-foreground w-5">#{l.rank}</span>
            <span className="flex-1 truncate">{l.you ? 'You' : l.name}</span>
            <span className="tabular">{l.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WidgetLiveStatus() {
  const setTab = useStore((s) => s.setTab)
  const live = liveSessions.find((l) => l.isLive)
  return (
    <div className="flex items-center justify-between h-full">
      <div>
        <div className="flex items-center gap-2">
          <Radio className="size-4 text-destructive" />
          <span className="text-sm font-medium">{live ? 'Live Now' : 'Next in 2h'}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{live ? `${live.subject} · ${live.viewers.toLocaleString()} watching` : 'Chemistry · Equilibrium'}</p>
      </div>
      <button onClick={() => setTab('live')} className="rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium">{live ? 'Join' : 'View'}</button>
    </div>
  )
}

export function WidgetCustomCountdown() {
  const date = useStore((s) => s.customCountdownDate)
  const days = Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86400000))
  return (
    <div className="flex flex-col h-full items-center justify-center text-center">
      <Header icon={<CalendarClock className="size-3.5" />} title="JEE Main 2027" full />
      <span className="text-5xl font-extralight tabular text-primary my-2">{days}</span>
      <span className="text-xs text-muted-foreground">days remaining</span>
      <span className="text-[11px] text-muted-foreground mt-1">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
    </div>
  )
}

function Header({ icon, title, action, full }: { icon: React.ReactNode; title: string; action?: () => void; full?: boolean }) {
  return (
    <div className={cn('flex items-center gap-1.5 text-muted-foreground', full ? 'justify-center' : 'justify-between')}>
      <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-medium">
        {icon}
        {title}
      </span>
      {action && <button onClick={action} className="hover:text-foreground"><ArrowUpRight className="size-3.5" /></button>}
    </div>
  )
}

export const WIDGET_REGISTRY: Record<string, { title: string; render: () => React.ReactNode }> = {
  greeting: { title: 'Greeting & Date', render: () => <WidgetGreeting /> },
  streak: { title: 'Streak Tracker', render: () => <WidgetStreak /> },
  nextClass: { title: 'Next Class', render: () => <WidgetNextClass /> },
  dailyGoal: { title: 'Daily Goal', render: () => <WidgetDailyGoal /> },
  subjectRings: { title: 'Subject Progress', render: () => <WidgetSubjectRings /> },
  testDue: { title: 'Tests Due', render: () => <WidgetTestDue /> },
  quickNotes: { title: 'Quick Notes', render: () => <WidgetQuickNotes /> },
  leaderPeek: { title: 'Leaderboard Peek', render: () => <WidgetLeaderPeek /> },
  recentActivity: { title: 'Recent Activity', render: () => <WidgetRecentActivity /> },
  batchRank: { title: 'Batch Rank', render: () => <WidgetBatchRank /> },
  liveStatus: { title: 'Live Status', render: () => <WidgetLiveStatus /> },
  customCountdown: { title: 'Custom Countdown', render: () => <WidgetCustomCountdown /> },
}
