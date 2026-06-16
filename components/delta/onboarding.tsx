'use client'

import { useStore } from '@/lib/store'
import { SUBJECTS } from '@/lib/mock-data'
import { useState } from 'react'
import { GraduationCap, Check, Target, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Onboarding() {
  const { onboardingDone, finishOnboarding, setDailyGoal } = useStore()
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState<string[]>(['physics', 'chemistry', 'maths'])
  const [goal, setGoal] = useState(6)

  if (onboardingDone) return null

  const steps = [
    {
      icon: <Sparkles className="size-6" />,
      title: 'Welcome to Project Delta',
      body: 'Your premium command center for JEE preparation — lectures, tests, analytics and a configurable dashboard, all in one place.',
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
  const s = steps[step]

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/60 backdrop-blur-md">
      <div className="w-[min(520px,92vw)] glass-strong rounded-3xl elev-3 p-7">
        <div className="grid place-items-center size-12 rounded-2xl bg-primary text-primary-foreground mb-5">{s.icon}</div>
        <h2 className="text-xl font-semibold tracking-tight text-balance">{s.title}</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.body}</p>

        {step === 1 && (
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

        {step === 2 && (
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
            <button onClick={finishOnboarding} className="rounded-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground">
              Skip
            </button>
            <button
              onClick={() => {
                if (step < 2) setStep(step + 1)
                else {
                  setDailyGoal(goal)
                  finishOnboarding()
                }
              }}
              className="rounded-full px-5 py-2 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {step < 2 ? 'Continue' : 'Get started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
