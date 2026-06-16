'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Radio, Users, Send, Calendar, Clock, Bell, BellRing, Play, Pause,
  MessageSquare, Heart, Maximize2,
} from 'lucide-react'
import { GlassCard, Avatar } from '@/components/delta/ui'
import { useStore } from '@/lib/store'
import { liveSessions } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const CHAT_SEED = [
  { user: 'Aarav S.', msg: 'Sir please explain torque again', mine: false },
  { user: 'Diya M.', msg: 'This is so clear now thank you!', mine: false },
  { user: 'Rohan K.', msg: 'What about angular momentum conservation?', mine: false },
  { user: 'Saanvi P.', msg: 'PYQ 2023 had this exact concept', mine: false },
  { user: 'Ishaan R.', msg: 'Can you share these notes?', mine: false },
]
const AUTO_MSGS = [
  { user: 'Kabir V.', msg: 'Got it, makes sense now' },
  { user: 'Tara N.', msg: 'Please solve one more example' },
  { user: 'Myra J.', msg: 'Best explanation ever' },
  { user: 'Arjun D.', msg: 'Doubt cleared, thanks NV sir!' },
  { user: 'Neha B.', msg: 'Is this in JEE Advanced syllabus?' },
]

export function LivePage() {
  const live = liveSessions.find((s) => s.isLive)!
  const upcoming = liveSessions.filter((s) => !s.isLive)
  const [playing, setPlaying] = useState(true)
  const [viewers, setViewers] = useState(live.viewers)
  const [reminders, setReminders] = useState<Record<string, boolean>>({})
  const [chat, setChat] = useState(CHAT_SEED)
  const [input, setInput] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)
  const [elapsed, setElapsed] = useState(2734) // seconds into stream

  useEffect(() => {
    const iv = setInterval(() => {
      setViewers((v) => v + Math.floor(Math.random() * 7) - 3)
      setElapsed((e) => e + 2)
      if (Math.random() > 0.55) {
        const m = AUTO_MSGS[Math.floor(Math.random() * AUTO_MSGS.length)]
        setChat((c) => [...c.slice(-40), { ...m, mine: false }])
      }
    }, 2600)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [chat])

  function send() {
    if (!input.trim()) return
    setChat((c) => [...c, { user: 'You', msg: input.trim(), mine: true }])
    setInput('')
  }

  const hh = Math.floor(elapsed / 3600)
  const mm = Math.floor((elapsed % 3600) / 60)
  const ss = elapsed % 60

  return (
    <div className="h-full flex gap-4">
      {/* Main stream */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <GlassCard className="flex-1 flex flex-col overflow-hidden">
          {/* Video stage */}
          <div className="relative flex-1 bg-gradient-to-br from-[oklch(0.3_0.06_62)] to-[oklch(0.16_0.02_62)] grid place-items-center min-h-[280px]">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="grid place-items-center size-20 rounded-full bg-black/30 backdrop-blur border border-white/20 hover:scale-105 transition-transform"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause className="size-8 fill-current" /> : <Play className="size-8 fill-current translate-x-0.5" />}
            </button>

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                <span className="size-1.5 rounded-full bg-white animate-pulse" /> LIVE
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur px-2.5 py-1 text-[11px] text-white">
                <Users className="size-3" /> {viewers.toLocaleString()}
              </span>
            </div>
            <span className="absolute top-4 right-4 rounded-full bg-black/40 backdrop-blur px-2.5 py-1 text-[11px] tabular text-white">
              {String(hh).padStart(2, '0')}:{String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
            </span>

            {/* live progress shimmer bar */}
            <span className="absolute bottom-0 inset-x-0 h-1 bg-white/10 overflow-hidden">
              <span className="block h-full w-1/3 bg-red-500/80 animate-[live_3s_linear_infinite]" />
            </span>
          </div>

          {/* Stream meta */}
          <div className="p-4 border-t border-border flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <span className="grid place-items-center size-10 rounded-xl bg-primary/15 text-primary shrink-0">
                <Radio className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{live.topic}</p>
                <p className="text-[11px] text-muted-foreground">{live.subject} · {live.instructor}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="grid place-items-center size-9 rounded-full bg-white/5 border border-border text-muted-foreground hover:text-red-300"><Heart className="size-4" /></button>
              <button className="grid place-items-center size-9 rounded-full bg-white/5 border border-border text-muted-foreground hover:text-foreground"><Maximize2 className="size-4" /></button>
            </div>
          </div>
        </GlassCard>

        {/* Upcoming */}
        <GlassCard className="p-4 shrink-0">
          <p className="text-sm font-medium mb-3 flex items-center gap-2"><Calendar className="size-4 text-primary" /> Upcoming Sessions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {upcoming.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border bg-white/[0.02] p-3">
                <div className="text-center shrink-0 w-12">
                  <p className="text-lg font-light tabular leading-none">{s.startsInHours < 24 ? `${s.startsInHours}h` : `${Math.round(s.startsInHours / 24)}d`}</p>
                  <p className="text-[10px] text-muted-foreground">to go</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{s.topic}</p>
                  <p className="text-[11px] text-muted-foreground">{s.subject} · {s.instructor}</p>
                </div>
                <button
                  onClick={() => setReminders((r) => ({ ...r, [s.id]: !r[s.id] }))}
                  className={cn(
                    'grid place-items-center size-9 rounded-full border shrink-0 transition-colors',
                    reminders[s.id] ? 'bg-primary/15 border-primary/30 text-primary' : 'bg-white/5 border-border text-muted-foreground hover:text-foreground'
                  )}
                  aria-label="Set reminder"
                >
                  {reminders[s.id] ? <BellRing className="size-4" /> : <Bell className="size-4" />}
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Chat */}
      <GlassCard className="w-[320px] shrink-0 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-border">
          <MessageSquare className="size-4 text-primary" />
          <span className="text-sm font-medium">Live Chat</span>
          <span className="ml-auto text-[11px] text-muted-foreground flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> {viewers.toLocaleString()} watching
          </span>
        </div>
        <div ref={chatRef} className="flex-1 overflow-y-auto scroll-area p-3 space-y-3">
          {chat.map((c, i) => (
            <div key={i} className={cn('flex gap-2', c.mine && 'flex-row-reverse')}>
              <Avatar name={c.user} size={28} />
              <div className={cn('max-w-[78%]', c.mine && 'text-right')}>
                <p className="text-[11px] text-muted-foreground">{c.user}</p>
                <p className={cn('inline-block rounded-2xl px-3 py-1.5 text-xs mt-0.5', c.mine ? 'bg-primary text-primary-foreground' : 'bg-white/5')}>
                  {c.msg}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-border flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-white/5 border border-border px-3.5 py-2 text-sm outline-none focus:border-white/25"
          />
          <button onClick={send} className="grid place-items-center size-9 rounded-full bg-cream text-cream-foreground hover:opacity-90 shrink-0" aria-label="Send">
            <Send className="size-4" />
          </button>
        </div>
      </GlassCard>

      <style>{`@keyframes live{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
    </div>
  )
}
