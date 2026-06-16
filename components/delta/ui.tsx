'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function GlassCard({
  className,
  children,
  strong,
  ...props
}: { className?: string; children?: ReactNode; strong?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        strong ? 'glass-strong' : 'glass',
        'rounded-2xl elev-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function Pill({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap',
        active
          ? 'bg-cream text-cream-foreground elev-1'
          : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-border',
        className
      )}
    >
      {children}
    </button>
  )
}

export function IconButton({
  children,
  onClick,
  className,
  label,
  active,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
  label: string
  active?: boolean
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={cn(
        'grid place-items-center rounded-full size-9 transition-all border border-border',
        active ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground',
        className
      )}
    >
      {children}
    </button>
  )
}

export function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  className,
  trackClass = 'text-white/10',
  valueClass = 'text-primary',
  children,
}: {
  value: number // 0..1
  size?: number
  stroke?: number
  className?: string
  trackClass?: string
  valueClass?: string
  children?: ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.max(0, Math.min(1, value)))
  return (
    <div className={cn('relative grid place-items-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={trackClass} stroke="currentColor" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={valueClass}
          stroke="currentColor"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}

// Big metric numeral styled like the reference ( ,77,32% )
export function StatNumber({ value, suffix = '%', className }: { value: number; suffix?: string; className?: string }) {
  const whole = Math.floor(value)
  const frac = Math.round((value - whole) * 100)
  return (
    <div className={cn('flex items-end font-sans tabular leading-none', className)}>
      <span className="text-muted-foreground/50 text-[0.5em] mb-1.5 mr-0.5">,</span>
      <span className="font-light tracking-tight">{whole}</span>
      <span className="text-muted-foreground/60 text-[0.5em] mb-1.5 mx-0.5">,</span>
      <span className="font-light tracking-tight">{String(frac).padStart(2, '0')}</span>
      <span className="text-[0.42em] font-normal text-muted-foreground mb-1.5 ml-1">{suffix}</span>
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors border border-border',
        checked ? 'bg-primary' : 'bg-white/10'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 size-4 rounded-full bg-cream transition-transform',
          checked ? 'translate-x-5.5' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-border p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-all',
            value === o.value ? 'bg-cream text-cream-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('')
  return (
    <div
      className={cn('grid place-items-center rounded-full bg-gradient-to-br from-white/15 to-white/5 border border-border text-foreground font-medium', className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials}
    </div>
  )
}

export function SectionShell({ children, className }: { children: ReactNode; className?: string }) {
  // Each major section is a self-contained 16:9 canvas filling viewport width.
  return (
    <section className={cn('snap-section relative w-full shrink-0', className)} style={{ height: 'calc(100vh - 64px)' }}>
      <div className="absolute inset-0 p-5">{children}</div>
    </section>
  )
}

export function EmptyState({ icon, title, hint, cta }: { icon: ReactNode; title: string; hint?: string; cta?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center h-full text-muted-foreground">
      <div className="grid place-items-center size-14 rounded-2xl bg-white/5 border border-border">{icon}</div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {hint && <p className="text-xs mt-1">{hint}</p>}
      </div>
      {cta}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-white/5', className)} />
}
