'use client'

import { useStore } from '@/lib/store'
import { WIDGET_REGISTRY } from './widget-content'
import { GlassCard } from '../ui'
import { Sparkles, LayoutGrid } from 'lucide-react'

export function HomePage() {
  const { widgets, gridMode, setTab } = useStore()
  const canvasHeight = widgets.reduce((m, w) => Math.max(m, w.y + w.h), 0) + 48

  return (
    <div className="relative w-full" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 glass-strong border-b border-border">
        <div>
          <p className="text-sm font-medium">Dashboard</p>
          <p className="text-xs text-muted-foreground">Your personalized command center</p>
        </div>
        <button
          onClick={() => setTab('playground')}
          className="flex items-center gap-1.5 rounded-full bg-white/5 border border-border px-3 py-1.5 text-xs hover:bg-white/10 transition-colors"
        >
          <Sparkles className="size-3.5 text-primary" /> Customize
        </button>
      </div>

      {widgets.length === 0 ? (
        <EmptyState onOpen={() => setTab('playground')} />
      ) : gridMode ? (
        <div className="p-5 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {widgets.map((w) => (
            <GlassCard key={w.id} className="relative p-5" style={{ minHeight: w.type === 'greeting' ? 96 : 200 }}>
              {WIDGET_REGISTRY[w.type]?.render()}
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="relative" style={{ minHeight: canvasHeight }}>
          {widgets.map((w) => (
            <GlassCard
              key={w.id}
              className="absolute p-4"
              style={{ left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z }}
            >
              <div className="h-full">{WIDGET_REGISTRY[w.type]?.render()}</div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="grid place-items-center" style={{ minHeight: 'calc(100vh - 180px)' }}>
      <GlassCard className="max-w-md w-[92vw] p-8 text-center flex flex-col items-center gap-3">
        <span className="grid place-items-center size-12 rounded-2xl bg-primary/15 text-primary">
          <LayoutGrid className="size-6" />
        </span>
        <h2 className="text-lg font-light">Your dashboard is empty</h2>
        <p className="text-sm text-muted-foreground text-balance">
          Head to the Playground to add widgets and arrange your personalized command center.
        </p>
        <button
          onClick={onOpen}
          className="mt-2 flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
        >
          <Sparkles className="size-4" /> Open Playground
        </button>
      </GlassCard>
    </div>
  )
}
