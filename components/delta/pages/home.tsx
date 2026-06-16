'use client'

import { useStore, type WidgetState } from '@/lib/store'
import { WIDGET_REGISTRY } from './widget-content'
import { GlassCard } from '../ui'
import { cn } from '@/lib/utils'
import { useRef, useState, useCallback } from 'react'
import { GripVertical, X, Plus, LayoutGrid, Move, RotateCcw } from 'lucide-react'

const SNAP = 6
const MIN_W = 180
const MIN_H = 96

type Guides = { x: number | null; y: number | null }

export function HomePage() {
  const { widgets, gridMode, setGridMode, updateWidget, bringToFront, removeWidget, addWidget, resetWidgets } = useStore()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [guides, setGuides] = useState<Guides>({ x: null, y: null })
  const [picker, setPicker] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)

  const snapValue = useCallback(
    (val: number, others: number[], shift: boolean) => {
      if (shift) return { val, guide: null as number | null }
      for (const o of others) {
        if (Math.abs(val - o) <= SNAP) return { val: o, guide: o }
      }
      // grid snap to 20px
      const g = Math.round(val / 20) * 20
      return { val: g, guide: null }
    },
    []
  )

  const startDrag = (e: React.PointerEvent, w: WidgetState) => {
    if (gridMode) return
    e.preventDefault()
    bringToFront(w.id)
    setDragId(w.id)
    const startX = e.clientX
    const startY = e.clientY
    const ox = w.x
    const oy = w.y
    const others = widgets.filter((x) => x.id !== w.id)
    const xEdges = others.flatMap((o) => [o.x, o.x + o.w, o.x + o.w / 2])
    const yEdges = others.flatMap((o) => [o.y, o.y + o.h, o.y + o.h / 2])

    const move = (ev: PointerEvent) => {
      const shift = ev.shiftKey
      let nx = Math.max(0, ox + (ev.clientX - startX))
      let ny = Math.max(0, oy + (ev.clientY - startY))
      const sx = snapValue(nx, xEdges, shift)
      const sxr = snapValue(nx + w.w, xEdges, shift)
      const sy = snapValue(ny, yEdges, shift)
      const syb = snapValue(ny + w.h, yEdges, shift)
      let gx: number | null = null
      let gy: number | null = null
      if (sx.guide !== null) { nx = sx.val; gx = sx.guide } else if (sxr.guide !== null) { nx = sxr.val - w.w; gx = sxr.guide } else nx = sx.val
      if (sy.guide !== null) { ny = sy.val; gy = sy.guide } else if (syb.guide !== null) { ny = syb.val - w.h; gy = syb.guide } else ny = sy.val
      setGuides({ x: gx, y: gy })
      updateWidget(w.id, { x: nx, y: ny })
    }
    const up = () => {
      setGuides({ x: null, y: null })
      setDragId(null)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const startResize = (e: React.PointerEvent, w: WidgetState, dir: string) => {
    if (gridMode) return
    e.preventDefault()
    e.stopPropagation()
    bringToFront(w.id)
    const startX = e.clientX
    const startY = e.clientY
    const { x, y, w: ow, h: oh } = w
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      let nx = x, ny = y, nw = ow, nh = oh
      if (dir.includes('e')) nw = Math.max(MIN_W, ow + dx)
      if (dir.includes('s')) nh = Math.max(MIN_H, oh + dy)
      if (dir.includes('w')) { nw = Math.max(MIN_W, ow - dx); nx = x + (ow - nw) }
      if (dir.includes('n')) { nh = Math.max(MIN_H, oh - dy); ny = y + (oh - nh) }
      updateWidget(w.id, { x: nx, y: ny, w: nw, h: nh })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const handles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']
  const handlePos: Record<string, string> = {
    n: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize w-6 h-2',
    s: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize w-6 h-2',
    e: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize h-6 w-2',
    w: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize h-6 w-2',
    ne: 'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize size-3',
    nw: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize size-3',
    se: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize size-3',
    sw: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize size-3',
  }

  return (
    <div className="relative w-full" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* Toolbar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 glass-strong border-b border-border">
        <div>
          <p className="text-sm font-medium">Dashboard</p>
          <p className="text-xs text-muted-foreground">{gridMode ? 'Grid layout' : 'Free-form canvas — drag, resize & arrange'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGridMode(!gridMode)}
            className={cn('flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs transition-colors', gridMode ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10')}
          >
            {gridMode ? <LayoutGrid className="size-3.5" /> : <Move className="size-3.5" />}
            {gridMode ? 'Grid' : 'Free'}
          </button>
          <button onClick={resetWidgets} className="flex items-center gap-1.5 rounded-full bg-white/5 border border-border px-3 py-1.5 text-xs hover:bg-white/10">
            <RotateCcw className="size-3.5" /> Reset
          </button>
          <button onClick={() => setPicker(true)} className="flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium">
            <Plus className="size-3.5" /> Widget
          </button>
        </div>
      </div>

      {gridMode ? (
        <div className="p-5 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {widgets.map((w) => (
            <GlassCard key={w.id} className="group relative p-5" style={{ minHeight: w.type === 'greeting' ? 96 : 200 }}>
              <RemoveBtn onClick={() => removeWidget(w.id)} />
              {WIDGET_REGISTRY[w.type]?.render()}
            </GlassCard>
          ))}
        </div>
      ) : (
        <div ref={canvasRef} className="relative dot-grid" style={{ minHeight: 'calc(100vh - 120px)' }}>
          {/* snap guides */}
          {guides.x !== null && <div className="pointer-events-none absolute top-0 bottom-0 w-px bg-primary/60 z-40" style={{ left: guides.x }} />}
          {guides.y !== null && <div className="pointer-events-none absolute left-0 right-0 h-px bg-primary/60 z-40" style={{ top: guides.y }} />}

          {widgets.map((w) => (
            <GlassCard
              key={w.id}
              className={cn('group absolute p-4 select-none', dragId === w.id && 'ring-1 ring-primary/40 elev-3')}
              style={{ left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z }}
              onPointerDown={() => bringToFront(w.id)}
            >
              {/* drag handle */}
              <button
                onPointerDown={(e) => startDrag(e, w)}
                className="absolute top-1.5 left-1.5 z-10 grid place-items-center size-6 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-white/10 cursor-grab active:cursor-grabbing transition-opacity"
                aria-label="Drag widget"
              >
                <GripVertical className="size-3.5" />
              </button>
              <RemoveBtn onClick={() => removeWidget(w.id)} />

              <div className="h-full pt-1.5">{WIDGET_REGISTRY[w.type]?.render()}</div>

              {/* resize handles */}
              {handles.map((d) => (
                <span
                  key={d}
                  onPointerDown={(e) => startResize(e, w, d)}
                  className={cn('absolute z-20 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity', handlePos[d], (d.length === 2) && 'bg-primary border border-background')}
                />
              ))}
            </GlassCard>
          ))}
        </div>
      )}

      {/* Widget picker */}
      {picker && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 backdrop-blur-sm" onClick={() => setPicker(false)}>
          <GlassCard strong className="w-[min(560px,92vw)] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium">Add a widget</p>
              <button onClick={() => setPicker(false)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto scroll-thin">
              {Object.entries(WIDGET_REGISTRY).map(([type, def]) => (
                <button
                  key={type}
                  onClick={() => { addWidget(type); setPicker(false) }}
                  className="rounded-xl border border-border bg-white/5 p-3 text-left hover:bg-white/10 hover:border-primary/40 transition-colors"
                >
                  <p className="text-[13px] font-medium">{def.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Click to add</p>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute top-1.5 right-1.5 z-10 grid place-items-center size-6 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-opacity"
      aria-label="Remove widget"
    >
      <X className="size-3.5" />
    </button>
  )
}
