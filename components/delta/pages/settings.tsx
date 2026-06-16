'use client'

import { useState } from 'react'
import {
  User, Bell, Target, Layout, RotateCcw, Calendar, Sliders, Check, Trash2,
} from 'lucide-react'
import { GlassCard, Toggle, Segmented, Avatar } from '@/components/delta/ui'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function SettingsPage() {
  const dailyGoalHours = useStore((s) => s.dailyGoalHours)
  const setDailyGoal = useStore((s) => s.setDailyGoal)
  const customCountdownDate = useStore((s) => s.customCountdownDate)
  const resetWidgets = useStore((s) => s.resetWidgets)
  const profile = useStore((s) => s.profile)
  const setProfile = useStore((s) => s.setProfile)

  const [notif, setNotif] = useState({ live: true, tests: true, streak: true, leaderboard: false })
  const [reduceMotion, setReduceMotion] = useState(false)
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const [savedFlash, setSavedFlash] = useState(false)

  function flash() {
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1200)
  }

  return (
    <div className="h-full overflow-y-auto scroll-area">
      <div className="max-w-3xl mx-auto flex flex-col gap-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account, goals, and preferences</p>
          </div>
          {savedFlash && <span className="flex items-center gap-1.5 text-xs text-emerald-300"><Check className="size-4" /> Saved</span>}
        </div>

        {/* Account */}
        <GlassCard className="p-5">
          <SectionTitle icon={<User className="size-4" />} title="Account" />
          <div className="flex items-center gap-4 mb-4">
            <Avatar name={profile.name} size={56} />
            <div>
              <p className="text-sm font-medium">{profile.name}</p>
              <p className="text-xs text-muted-foreground">aryan.sharma@delta.edu</p>
            </div>
            <button onClick={flash} className="ml-auto rounded-full bg-white/5 border border-border px-3 py-1.5 text-xs hover:bg-white/10">Change avatar</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Display name" defaultValue={profile.name} onBlur={(v) => { setProfile({ name: v }); flash() }} />
            <Field label="Email" defaultValue="aryan.sharma@delta.edu" onBlur={flash} />
            <Field label="Batch" defaultValue={profile.batch} onBlur={(v) => { setProfile({ batch: v }); flash() }} />
            <Field label="Location" defaultValue={profile.location} onBlur={(v) => { setProfile({ location: v }); flash() }} />
          </div>
        </GlassCard>

        {/* Goals */}
        <GlassCard className="p-5">
          <SectionTitle icon={<Target className="size-4" />} title="Study Goals" />
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm">Daily study goal</label>
                <span className="text-sm tabular text-primary">{dailyGoalHours}h / day</span>
              </div>
              <input
                type="range" min={1} max={12} value={dailyGoalHours}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>1h</span><span>12h</span></div>
            </div>
            <Row label="Target exam date" hint="Used for the countdown widget">
              <span className="flex items-center gap-2 text-sm rounded-lg bg-white/5 border border-border px-3 py-1.5">
                <Calendar className="size-4 text-primary" /> {new Date(customCountdownDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </Row>
          </div>
        </GlassCard>

        {/* Notifications */}
        <GlassCard className="p-5">
          <SectionTitle icon={<Bell className="size-4" />} title="Notifications" />
          <div className="space-y-1">
            <Row label="Live class reminders"><Toggle checked={notif.live} onChange={(v) => { setNotif((n) => ({ ...n, live: v })); flash() }} /></Row>
            <Row label="Test deadlines"><Toggle checked={notif.tests} onChange={(v) => { setNotif((n) => ({ ...n, tests: v })); flash() }} /></Row>
            <Row label="Streak reminders"><Toggle checked={notif.streak} onChange={(v) => { setNotif((n) => ({ ...n, streak: v })); flash() }} /></Row>
            <Row label="Leaderboard changes"><Toggle checked={notif.leaderboard} onChange={(v) => { setNotif((n) => ({ ...n, leaderboard: v })); flash() }} /></Row>
          </div>
        </GlassCard>

        {/* Appearance */}
        <GlassCard className="p-5">
          <SectionTitle icon={<Sliders className="size-4" />} title="Appearance" />
          <div className="space-y-1">
            <Row label="Interface density">
              <Segmented
                value={density}
                onChange={(v) => { setDensity(v); flash() }}
                options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]}
              />
            </Row>
            <Row label="Reduce motion" hint="Minimize animations across the app">
              <Toggle checked={reduceMotion} onChange={(v) => { setReduceMotion(v); flash() }} />
            </Row>
          </div>
        </GlassCard>

        {/* Dashboard */}
        <GlassCard className="p-5">
          <SectionTitle icon={<Layout className="size-4" />} title="Dashboard" />
          <Row label="Reset widget layout" hint="Restore the default home dashboard arrangement">
            <button
              onClick={() => { resetWidgets(); flash() }}
              className="flex items-center gap-2 rounded-full bg-white/5 border border-border px-4 py-2 text-sm hover:bg-white/10"
            >
              <RotateCcw className="size-4" /> Reset Layout
            </button>
          </Row>
        </GlassCard>

        {/* Danger */}
        <GlassCard className="p-5 border-red-500/20">
          <SectionTitle icon={<Trash2 className="size-4 text-red-300" />} title="Danger Zone" />
          <Row label="Clear all local data" hint="Resets progress, notes, and test history on this device">
            <button
              onClick={() => { localStorage.removeItem('project-delta-v1'); location.reload() }}
              className="rounded-full bg-red-500/15 text-red-300 border border-red-500/30 px-4 py-2 text-sm hover:bg-red-500/25"
            >
              Clear Data
            </button>
          </Row>
        </GlassCard>
      </div>
    </div>
  )
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <p className="flex items-center gap-2 text-sm font-medium mb-4 pb-3 border-b border-border">
      <span className="text-primary">{icon}</span> {title}
    </p>
  )
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <p className="text-sm">{label}</p>
        {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function Field({ label, defaultValue, onBlur }: { label: string; defaultValue: string; onBlur?: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <input
        defaultValue={defaultValue}
        onBlur={(e) => onBlur?.(e.target.value)}
        className="mt-1 w-full rounded-lg bg-white/5 border border-border px-3 py-2 text-sm outline-none focus:border-white/25"
      />
    </label>
  )
}
