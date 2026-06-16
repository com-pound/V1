'use client'

import { useMemo } from 'react'
import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart,
  RadialBar, RadialBarChart, PolarAngleAxis, Bar, BarChart, CartesianGrid,
} from 'recharts'
import { Clock, TrendingUp, Flame, Target, Award, Activity, BookOpen } from 'lucide-react'
import { GlassCard, StatNumber, ProgressRing } from '@/components/delta/ui'
import { useStore } from '@/lib/store'
import { studyHours, scoreTrend, SUBJECTS } from '@/lib/mock-data'

export function AnalyticsPage() {
  const subjectProgress = useStore((s) => s.subjectProgress())
  const totalHours = useStore((s) => s.totalHours())
  const streak = useStore((s) => s.streak)
  const history = useStore((s) => s.history)

  const avgScore = useMemo(() => {
    if (!history.length) return 0
    return Math.round(history.reduce((a, h) => a + (h.score / h.total) * 100, 0) / history.length)
  }, [history])

  const subjectBars = useMemo(
    () => SUBJECTS.slice(0, 5).map((s) => ({ subject: s.name.slice(0, 4), value: Math.round((subjectProgress[s.id] ?? 0) * 100), fill: s.color })),
    [subjectProgress]
  )

  const accuracyData = useMemo(
    () => history.slice(0, 12).reverse().map((h, i) => ({ t: `T${i + 1}`, score: Math.round((h.score / h.total) * 100) })),
    [history]
  )

  return (
    <div className="h-full overflow-y-auto scroll-area">
      <div className="flex flex-col gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Your performance across every subject and test</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={<Clock className="size-4" />} label="Total Study Hours" value={totalHours} suffix="h" tone="text-primary" />
          <KpiCard icon={<Flame className="size-4" />} label="Current Streak" value={streak} suffix="d" tone="text-amber-300" />
          <KpiCard icon={<Target className="size-4" />} label="Avg Test Score" value={avgScore} suffix="%" tone="text-emerald-300" />
          <KpiCard icon={<Award className="size-4" />} label="Tests Taken" value={history.length} suffix="" tone="text-foreground" />
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Study hours area */}
          <GlassCard className="p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium flex items-center gap-2"><Activity className="size-4 text-primary" /> Daily Study Hours</p>
              <span className="text-[11px] text-muted-foreground">Last 30 days</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={studyHours} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hoursFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.74 0.135 62)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="oklch(0.74 0.135 62)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip suffix="h" />} />
                  <Area type="monotone" dataKey="hours" stroke="oklch(0.74 0.135 62)" strokeWidth={2} fill="url(#hoursFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Subject completion radial */}
          <GlassCard className="p-4">
            <p className="text-sm font-medium mb-3 flex items-center gap-2"><BookOpen className="size-4 text-primary" /> Subject Completion</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="30%" outerRadius="100%" data={subjectBars} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={8} />
                  <Tooltip content={<ChartTip suffix="%" nameKey="subject" />} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {subjectBars.map((s) => (
                <span key={s.subject} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ background: s.fill }} /> {s.subject} {s.value}%
                </span>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Score trend */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium flex items-center gap-2"><TrendingUp className="size-4 text-primary" /> Test Score Trend</p>
              <span className="text-[11px] text-muted-foreground">Recent attempts</span>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="t" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip suffix="%" />} />
                  <Line type="monotone" dataKey="score" stroke="oklch(0.7 0.13 150)" strokeWidth={2.5} dot={{ r: 3, fill: 'oklch(0.7 0.13 150)' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Per-subject mastery bars */}
          <GlassCard className="p-4">
            <p className="text-sm font-medium mb-3 flex items-center gap-2"><Target className="size-4 text-primary" /> Subject Mastery</p>
            <div className="space-y-3 mt-4">
              {SUBJECTS.slice(0, 5).map((s) => {
                const v = Math.round((subjectProgress[s.id] ?? 0) * 100)
                return (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="w-28 text-xs text-muted-foreground truncate">{s.name}</span>
                    <span className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                      <span className="block h-full rounded-full transition-all" style={{ width: `${v}%`, background: s.color }} />
                    </span>
                    <span className="w-9 text-right text-xs tabular">{v}%</span>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, suffix, tone }: { icon: React.ReactNode; label: string; value: number; suffix: string; tone: string }) {
  return (
    <GlassCard className="p-4">
      <span className={`flex items-center gap-1.5 text-xs ${tone}`}>{icon} {label}</span>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-3xl font-light tabular leading-none">{value}</span>
        <span className="text-sm text-muted-foreground mb-0.5">{suffix}</span>
      </div>
    </GlassCard>
  )
}

function ChartTip({ active, payload, label, suffix = '', nameKey }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs elev-2">
      <p className="text-muted-foreground">{nameKey ? p.payload[nameKey] : label}</p>
      <p className="font-medium tabular">{p.value}{suffix}</p>
    </div>
  )
}
