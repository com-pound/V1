'use client'

import { useStore } from '@/lib/store'
import { SUBJECTS } from '@/lib/mock-data'
import { useState } from 'react'
import { GraduationCap, Check, Target, Sparkles, UserRound, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const TARGET_YEARS = ['2026', '2027', '2028']

export function Onboarding() {
  const { onboardingDone, finishOnboarding, setDailyGoal, setProfile } = useStore()
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState<string[]>(['physics', 'chemistry', 'maths'])
  const [goal, setGoal] = useState(6)

  // profile fields
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [targetYear, setTargetYear] = useState('2027')
  const [bio, setBio] = useState('')

  if (onboardingDone) return null

  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '?'

  const steps = [
    {
      icon: <Sparkles className="size-6" />,
      title: 'Welcome to Project Delta',
      body: 'Your premium command center for JEE preparation — lectures, tests, analytics and a configurable dashboard, all in one place.',
    },
    {
      icon: <UserRound className="size-6" />,
      title: 'Create your profile',
      body: 'Tell us who you are. This personalizes your dashboard, profile page and greetings.',
    },
    {
      icon: <GraduationCap className="size-6" />,
      title: 'Select your subjects',
      body: 'Pick the subjects you want to focus on. You can change this anytime in Settings.',
    },
    {
      icon: <Target className="size-6" />,
      title: 'Set a daily study goal',
      body: 'How many hours do you aim to study each day? This powers your goal ring and streak.',
    },
  ]
  const last = steps.length - 1
  const s = steps[step]
  const canContinue = step !== 1 || name.trim().length > 0

  function commit() {
    setProfile({
      name: name.trim() || 'Aryan Sharma',
      location: location.trim() || 'Kota, Rajasthan',
      targetYear,
      batch: `Nucleus ${targetYear}`,
      bio: bio.trim() || `JEE ${targetYear} aspirant on Project Delta.`,
    })
    setDailyGoal(goal)
    finishOnboarding()
  }

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/60 backdrop-blur-md">
      <div className="w-[min(520px,92vw)] glass-strong rounded-3xl elev-3 p-7">
        <div className="grid place-items-center size-12 rounded-2xl bg-primary text-primary-foreground mb-5">{s.icon}</div>
        <h2 className="text-xl font-semibold tracking-tight text-balance">{s.title}</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.body}</p>

        {/* Step 1 — create profile */}
        {step === 1 && (
          <div className="mt-5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="grid place-items-center size-16 rounded-2xl bg-primary/15 text-primary text-xl font-medium shrink-0">
                {initials}
              </div>
              <div className="flex-1">
                <Field label="Full name">
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aryan Sharma"
                    className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
                  />
                </Field>
              </div>
            </div>

            <Field label="Location" icon={<MapPin className="size-3.5" />}>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kota, Rajasthan"
                className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
              />
            </Field>

            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Target year</p>
              <div className="grid grid-cols-3 gap-2">
                {TARGET_YEARS.map((y) => {
                  const on = targetYear === y
                  return (
                    <button
                      key={y}
                      onClick={() => setTargetYear(y)}
                      className={cn(
                        'rounded-xl border py-2 text-sm font-medium transition-all',
                        on ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-white/5 text-muted-foreground hover:bg-white/10'
                      )}
                    >
                      JEE {y}
                    </button>
                  )
                })}
              </div>
            </div>

            <Field label="Short bio (optional)">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="A line about your goals…"
                className="w-full bg-transparent outline-none text-sm resize-none placeholder:text-muted-foreground/60"
              />
            </Field>
          </div>
        )}

        {/* Step 2 — subjects */}
        {step === 2 && (
          <div className="grid grid-cols-3 gap-2 mt-5">
            {SUBJECTS.map((sub) => {
              const on = picked.includes(sub.id)
              return (
                <button
                  key={sub.id}
                  onClick={() => setPicked((p) => (on ? p.filter((x) => x !== sub.id) : [...p, sub.id]))}
                  className={cn(
                    'rounded-xl border p-3 text-left transition-all',
                    on ? 'border-primary bg-primary/10' : 'border-border bg-white/5 hover:bg-white/10'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium">{sub.name}</span>
                    {on && <Check className="size-3.5 text-primary" />}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Step 3 — daily goal */}
        {step === 3 && (
          <div className="mt-6">
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm text-muted-foreground">Daily goal</span>
              <span className="text-3xl font-light tabular">{goal}<span className="text-sm text-muted-foreground ml-1">hrs</span></span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className="w-full accent-[oklch(0.74_0.135_62)]"
            />
          </div>
        )}

        <div className="flex items-center justify-between mt-7">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <span key={i} className={cn('h-1.5 rounded-full transition-all', i === step ? 'w-6 bg-primary' : 'w-1.5 bg-white/15')} />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={commit} className="rounded-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground">
              Skip
            </button>
            <button
              disabled={!canContinue}
              onClick={() => {
                if (step < last) setStep(step + 1)
                else commit()
              }}
              className="rounded-full px-5 py-2 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step < last ? 'Continue' : 'Get started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block rounded-xl border border-border bg-white/5 px-3 py-2 focus-within:border-primary/60 transition-colors">
      <span className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
        {icon}
        {label}
      </span>
      {children}
    </label>
  )
}
