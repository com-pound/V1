'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import {
  FileText, Clock, AlertCircle, ChevronRight, Check, X, Flag, Grid3x3,
  ChevronLeft, Send, RotateCcw, TrendingUp, TrendingDown, History, BarChart3,
  Trophy, Target, Timer, ArrowLeft, CircleCheck, CircleDot, Bookmark,
} from 'lucide-react'
import { GlassCard, Pill, ProgressRing, StatNumber, EmptyState } from '@/components/delta/ui'
import { useStore } from '@/lib/store'
import { tests, buildQuestions, type TestItem, type Question } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type View = 'available' | 'attempt' | 'results' | 'history' | 'analysis'

export function TestsPage() {
  const [view, setView] = useState<View>('available')
  const [activeTest, setActiveTest] = useState<TestItem | null>(null)
  const [lastResult, setLastResult] = useState<ResultData | null>(null)
  const [analysisRow, setAnalysisRow] = useState<any>(null)

  return (
    <div className="h-full">
      {view === 'available' && (
        <AvailableView
          onStart={(t) => {
            setActiveTest(t)
            setView('attempt')
          }}
          onHistory={() => setView('history')}
        />
      )}
      {view === 'attempt' && activeTest && (
        <AttemptView
          test={activeTest}
          onSubmit={(r) => {
            setLastResult(r)
            setView('results')
          }}
          onExit={() => setView('available')}
        />
      )}
      {view === 'results' && lastResult && (
        <ResultsView
          result={lastResult}
          onReview={() => setView('analysis')}
          onDone={() => setView('available')}
          setAnalysisRow={setAnalysisRow}
        />
      )}
      {view === 'history' && (
        <HistoryView
          onBack={() => setView('available')}
          onAnalyze={(row) => {
            setAnalysisRow(row)
            setView('analysis')
          }}
        />
      )}
      {view === 'analysis' && (
        <AnalysisView
          result={lastResult}
          row={analysisRow}
          onBack={() => setView(lastResult ? 'results' : 'history')}
        />
      )}
    </div>
  )
}

/* ---------------- AVAILABLE ---------------- */
function AvailableView({ onStart, onHistory }: { onStart: (t: TestItem) => void; onHistory: () => void }) {
  const [type, setType] = useState<string>('All')
  const types = ['All', 'JEE Main', 'JEE Advanced', 'Chapter Test', 'Full Syllabus', 'Previous Year']
  const list = useMemo(() => (type === 'All' ? tests : tests.filter((t) => t.type === type)), [type])
  const urgent = tests.filter((t) => t.deadlineHours !== null && t.deadlineHours <= 24)

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Test Center</h1>
          <p className="text-sm text-muted-foreground">{tests.length} mock tests · {urgent.length} due soon</p>
        </div>
        <button onClick={onHistory} className="flex items-center gap-2 rounded-full bg-white/5 border border-border px-4 py-2 text-sm hover:bg-white/10">
          <History className="size-4" /> Test History
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {types.map((t) => (
          <Pill key={t} active={type === t} onClick={() => setType(t)}>{t}</Pill>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scroll-area pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {list.map((t) => {
            const due = t.deadlineHours
            const urgent = due !== null && due <= 24
            return (
              <GlassCard key={t.id} className="p-4 flex flex-col gap-3 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <span className="grid place-items-center size-10 rounded-xl bg-primary/15 text-primary shrink-0">
                    <FileText className="size-5" />
                  </span>
                  {due !== null ? (
                    <span className={cn(
                      'flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium',
                      urgent ? 'bg-red-500/15 text-red-300' : 'bg-white/5 text-muted-foreground'
                    )}>
                      <Clock className="size-3" /> {due <= 24 ? `${due}h left` : `${Math.round(due / 24)}d left`}
                    </span>
                  ) : (
                    <span className="rounded-full px-2 py-1 text-[11px] bg-white/5 text-muted-foreground">No deadline</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium leading-snug line-clamp-2">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{t.type}</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Grid3x3 className="size-3" /> {t.questionCount} Q</span>
                  <span className="flex items-center gap-1"><Timer className="size-3" /> {t.durationMin}m</span>
                  <span className={cn(
                    'ml-auto rounded-full px-2 py-0.5',
                    t.difficulty === 'Hard' ? 'bg-red-500/15 text-red-300' :
                    t.difficulty === 'Moderate' ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'
                  )}>{t.difficulty}</span>
                </div>
                <button
                  onClick={() => onStart(t)}
                  className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-cream text-cream-foreground py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Start Test <ChevronRight className="size-4" />
                </button>
              </GlassCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ---------------- ATTEMPT ---------------- */
interface ResultData {
  test: TestItem
  questions: Question[]
  answers: Record<number, number>
  marked: Record<number, boolean>
  correct: number
  wrong: number
  unattempted: number
  score: number
  total: number
  timeTaken: number
}

function AttemptView({ test, onSubmit, onExit }: { test: TestItem; onSubmit: (r: ResultData) => void; onExit: () => void }) {
  const count = Math.min(test.questionCount, 30) // keep attempt UI snappy
  const questions = useMemo(() => buildQuestions(count), [count])
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [marked, setMarked] = useState<Record<number, boolean>>({})
  const [visited, setVisited] = useState<Record<number, boolean>>({ 0: true })
  const [secondsLeft, setSecondsLeft] = useState(test.durationMin * 60)
  const [saved, setSaved] = useState(false)
  const [palette, setPalette] = useState(true)

  // Auto-save indicator
  useEffect(() => {
    setSaved(false)
    const t = setTimeout(() => setSaved(true), 600)
    return () => clearTimeout(t)
  }, [answers, marked])

  // Countdown
  useEffect(() => {
    if (secondsLeft <= 0) {
      handleSubmit()
      return
    }
    const iv = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft])

  const q = questions[idx]
  const answeredCount = Object.keys(answers).length

  function go(n: number) {
    const next = Math.max(0, Math.min(questions.length - 1, n))
    setIdx(next)
    setVisited((v) => ({ ...v, [next]: true }))
  }

  function handleSubmit() {
    let correct = 0, wrong = 0
    questions.forEach((qq, i) => {
      if (answers[i] === undefined) return
      if (answers[i] === qq.correctIndex) correct++
      else wrong++
    })
    const unattempted = questions.length - correct - wrong
    const score = correct * 4 - wrong // JEE marking
    const scaledTotal = questions.length * 4
    onSubmit({
      test, questions, answers, marked, correct, wrong, unattempted,
      score: Math.max(0, score), total: scaledTotal,
      timeTaken: Math.round((test.durationMin * 60 - secondsLeft) / 60),
    })
  }

  const mm = Math.floor(secondsLeft / 60)
  const ss = secondsLeft % 60
  const lowTime = secondsLeft < 300

  function statusOf(i: number): 'answered' | 'marked' | 'visited' | 'untouched' {
    if (marked[i]) return 'marked'
    if (answers[i] !== undefined) return 'answered'
    if (visited[i]) return 'visited'
    return 'untouched'
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onExit} className="grid place-items-center size-9 rounded-full bg-white/5 border border-border hover:bg-white/10" aria-label="Exit test">
            <ArrowLeft className="size-4" />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{test.name}</p>
            <p className="text-[11px] text-muted-foreground">{questions.length} questions · +4 / −1 marking</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('text-[11px] flex items-center gap-1.5 transition-colors', saved ? 'text-emerald-300' : 'text-muted-foreground')}>
            <CircleCheck className="size-3.5" /> {saved ? 'Auto-saved' : 'Saving...'}
          </span>
          <div className={cn(
            'flex items-center gap-2 rounded-full px-3 py-1.5 tabular font-medium border',
            lowTime ? 'bg-red-500/15 text-red-300 border-red-500/30 animate-pulse' : 'bg-white/5 border-border'
          )}>
            <Timer className="size-4" /> {String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
          </div>
          <button onClick={() => setPalette((p) => !p)} className="grid place-items-center size-9 rounded-full bg-white/5 border border-border hover:bg-white/10 lg:hidden" aria-label="Toggle palette">
            <Grid3x3 className="size-4" />
          </button>
          <button onClick={handleSubmit} className="flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90">
            <Send className="size-4" /> Submit
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 pt-4 min-h-0">
        {/* Question area */}
        <GlassCard className="flex-1 min-w-0 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Question {idx + 1} of {questions.length}</span>
            <button
              onClick={() => setMarked((m) => ({ ...m, [idx]: !m[idx] }))}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs border transition-colors',
                marked[idx] ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-white/5 border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <Bookmark className={cn('size-3.5', marked[idx] && 'fill-current')} /> {marked[idx] ? 'Marked for review' : 'Mark for review'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scroll-area pr-1">
            <p className="text-base leading-relaxed mb-5">{q.text}</p>
            <div className="space-y-2.5 max-w-2xl">
              {q.options.map((opt, oi) => {
                const selected = answers[idx] === oi
                return (
                  <button
                    key={oi}
                    onClick={() => setAnswers((a) => ({ ...a, [idx]: oi }))}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all',
                      selected ? 'bg-primary/15 border-primary/40' : 'bg-white/[0.03] border-border hover:bg-white/[0.06]'
                    )}
                  >
                    <span className={cn(
                      'grid place-items-center size-7 rounded-full border text-xs font-medium shrink-0',
                      selected ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'
                    )}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span className="text-sm">{opt}</span>
                    {selected && <Check className="size-4 ml-auto text-primary" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Nav */}
          <div className="flex items-center justify-between gap-3 pt-4 mt-2 border-t border-border">
            <button onClick={() => go(idx - 1)} disabled={idx === 0} className="flex items-center gap-1.5 rounded-full bg-white/5 border border-border px-4 py-2 text-sm disabled:opacity-40 hover:bg-white/10">
              <ChevronLeft className="size-4" /> Previous
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => setAnswers((a) => { const c = { ...a }; delete c[idx]; return c })} className="rounded-full bg-white/5 border border-border px-4 py-2 text-sm hover:bg-white/10 text-muted-foreground">
                Clear
              </button>
              <button onClick={() => go(idx + 1)} disabled={idx === questions.length - 1} className="flex items-center gap-1.5 rounded-full bg-cream text-cream-foreground px-4 py-2 text-sm font-medium disabled:opacity-40">
                Save & Next <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Palette */}
        {palette && (
          <GlassCard className="w-64 shrink-0 p-4 flex flex-col">
            <div className="grid grid-cols-2 gap-2 mb-4 text-[11px]">
              <Legend color="bg-primary" label={`Answered ${answeredCount}`} />
              <Legend color="bg-amber-400" label={`Marked ${Object.values(marked).filter(Boolean).length}`} />
              <Legend color="bg-white/25" label={`Visited`} />
              <Legend color="bg-white/5 border border-border" label={`Not visited`} />
            </div>
            <div className="flex-1 overflow-y-auto scroll-area">
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, i) => {
                  const st = statusOf(i)
                  return (
                    <button
                      key={i}
                      onClick={() => go(i)}
                      className={cn(
                        'aspect-square rounded-lg text-xs font-medium grid place-items-center transition-all',
                        i === idx && 'ring-2 ring-cream ring-offset-2 ring-offset-card',
                        st === 'answered' && 'bg-primary text-primary-foreground',
                        st === 'marked' && 'bg-amber-400 text-black',
                        st === 'visited' && 'bg-white/20 text-foreground',
                        st === 'untouched' && 'bg-white/5 border border-border text-muted-foreground'
                      )}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>
            </div>
            <button onClick={handleSubmit} className="mt-4 w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:opacity-90">
              Submit Test
            </button>
          </GlassCard>
        )}
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <span className={cn('size-3 rounded', color)} /> {label}
    </span>
  )
}

/* ---------------- RESULTS ---------------- */
function ResultsView({ result, onReview, onDone, setAnalysisRow }: { result: ResultData; onReview: () => void; onDone: () => void; setAnalysisRow: (r: any) => void }) {
  const submit = useStore((s) => s.submitTest)
  const saved = useRef(false)
  useEffect(() => {
    if (saved.current) return
    saved.current = true
    submit({
      name: result.test.name,
      type: result.test.type,
      subject: result.test.subject,
      score: result.score,
      total: result.total,
      timeTaken: result.timeTaken,
      trend: 0,
    })
  }, [result, submit])

  const pct = (result.score / result.total) * 100
  const accuracy = result.correct + result.wrong > 0 ? (result.correct / (result.correct + result.wrong)) * 100 : 0
  const percentile = Math.min(99.9, 40 + pct * 0.6)

  return (
    <div className="h-full overflow-y-auto scroll-area">
      <div className="max-w-4xl mx-auto flex flex-col gap-4 py-2">
        <div className="text-center py-4">
          <span className="inline-grid place-items-center size-16 rounded-2xl bg-primary/15 text-primary mb-3">
            <Trophy className="size-8" />
          </span>
          <h1 className="text-2xl font-light">Test Submitted</h1>
          <p className="text-sm text-muted-foreground mt-1">{result.test.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="p-6 flex flex-col items-center justify-center md:col-span-1">
            <ProgressRing value={pct / 100} size={140} stroke={10} valueClass="text-primary">
              <div className="text-center">
                <div className="text-3xl font-light tabular">{result.score}</div>
                <div className="text-xs text-muted-foreground">/ {result.total}</div>
              </div>
            </ProgressRing>
            <p className="mt-3 text-sm text-muted-foreground">Final Score</p>
          </GlassCard>

          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <ResultStat icon={<Check className="size-4" />} label="Correct" value={result.correct} tone="text-emerald-300" />
            <ResultStat icon={<X className="size-4" />} label="Wrong" value={result.wrong} tone="text-red-300" />
            <ResultStat icon={<CircleDot className="size-4" />} label="Unattempted" value={result.unattempted} tone="text-muted-foreground" />
            <ResultStat icon={<Target className="size-4" />} label="Accuracy" value={`${accuracy.toFixed(0)}%`} tone="text-primary" />
            <ResultStat icon={<TrendingUp className="size-4" />} label="Percentile" value={percentile.toFixed(1)} tone="text-amber-300" />
            <ResultStat icon={<Timer className="size-4" />} label="Time" value={`${result.timeTaken}m`} tone="text-foreground" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => { setAnalysisRow(null); onReview() }} className="flex items-center gap-2 rounded-full bg-cream text-cream-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90">
            <BarChart3 className="size-4" /> Review & Analysis
          </button>
          <button onClick={onDone} className="flex items-center gap-2 rounded-full bg-white/5 border border-border px-5 py-2.5 text-sm hover:bg-white/10">
            <RotateCcw className="size-4" /> Back to Tests
          </button>
        </div>
      </div>
    </div>
  )
}

function ResultStat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; tone: string }) {
  return (
    <GlassCard className="p-4 flex flex-col gap-1">
      <span className={cn('flex items-center gap-1.5 text-xs', tone)}>{icon} {label}</span>
      <span className="text-2xl font-light tabular">{value}</span>
    </GlassCard>
  )
}

/* ---------------- HISTORY ---------------- */
function HistoryView({ onBack, onAnalyze }: { onBack: () => void; onAnalyze: (row: any) => void }) {
  const history = useStore((s) => s.history)
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="grid place-items-center size-9 rounded-full bg-white/5 border border-border hover:bg-white/10" aria-label="Back">
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h1 className="text-2xl font-light tracking-tight">Test History</h1>
          <p className="text-sm text-muted-foreground">{history.length} attempts recorded</p>
        </div>
      </div>

      <GlassCard className="flex-1 overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
          <span className="col-span-5">Test</span>
          <span className="col-span-2">Score</span>
          <span className="col-span-2">Time</span>
          <span className="col-span-2">Trend</span>
          <span className="col-span-1"></span>
        </div>
        <div className="flex-1 overflow-y-auto scroll-area">
          {history.map((h) => {
            const pct = (h.score / h.total) * 100
            return (
              <button
                key={h.id}
                onClick={() => onAnalyze(h)}
                className="w-full grid grid-cols-12 gap-3 px-4 py-3 border-b border-border/50 hover:bg-white/[0.04] text-left items-center"
              >
                <div className="col-span-5 min-w-0">
                  <p className="text-sm font-medium truncate">{h.name}</p>
                  <p className="text-[11px] text-muted-foreground">{h.type} · {h.daysAgo === 0 ? 'Today' : `${h.daysAgo}d ago`}</p>
                </div>
                <div className="col-span-2">
                  <span className={cn('text-sm font-medium tabular', pct >= 60 ? 'text-emerald-300' : pct >= 35 ? 'text-amber-300' : 'text-red-300')}>
                    {h.score}
                  </span>
                  <span className="text-[11px] text-muted-foreground">/{h.total}</span>
                </div>
                <span className="col-span-2 text-sm tabular text-muted-foreground">{h.timeTaken}m</span>
                <div className="col-span-2">
                  {h.trend === 0 ? (
                    <span className="text-[11px] text-muted-foreground">—</span>
                  ) : h.trend > 0 ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-300"><TrendingUp className="size-3" /> +{h.trend}</span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-red-300"><TrendingDown className="size-3" /> {h.trend}</span>
                  )}
                </div>
                <ChevronRight className="col-span-1 size-4 text-muted-foreground justify-self-end" />
              </button>
            )
          })}
        </div>
      </GlassCard>
    </div>
  )
}

/* ---------------- ANALYSIS ---------------- */
function AnalysisView({ result, row, onBack }: { result: ResultData | null; row: any; onBack: () => void }) {
  // If we have a full result (just attempted), show per-question review; else synthesize from history row.
  const subjects = ['Physics', 'Chemistry', 'Maths']

  const breakdown = useMemo(() => {
    if (result) {
      return subjects.map((sub) => {
        const qs = result.questions.map((q, i) => ({ q, i })).filter(({ q }) => q.subject === sub)
        const correct = qs.filter(({ i, q }) => result.answers[i] === q.correctIndex).length
        const wrong = qs.filter(({ i, q }) => result.answers[i] !== undefined && result.answers[i] !== q.correctIndex).length
        return { sub, total: qs.length, correct, wrong, unattempted: qs.length - correct - wrong }
      })
    }
    // synthesize
    const seed = row ? row.score : 150
    return subjects.map((sub, k) => {
      const total = 10
      const correct = Math.max(2, Math.round((seed / 300) * 10) - k)
      const wrong = Math.min(total - correct, 2 + k)
      return { sub, total, correct, wrong, unattempted: total - correct - wrong }
    })
  }, [result, row])

  return (
    <div className="h-full overflow-y-auto scroll-area">
      <div className="max-w-5xl mx-auto flex flex-col gap-4 py-1">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="grid place-items-center size-9 rounded-full bg-white/5 border border-border hover:bg-white/10" aria-label="Back">
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-2xl font-light tracking-tight">Performance Analysis</h1>
            <p className="text-sm text-muted-foreground">{result?.test.name ?? row?.name ?? 'Test review'}</p>
          </div>
        </div>

        {/* Subject breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {breakdown.map((b) => {
            const acc = b.correct + b.wrong > 0 ? (b.correct / (b.correct + b.wrong)) * 100 : 0
            return (
              <GlassCard key={b.sub} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">{b.sub}</span>
                  <span className="text-xs text-muted-foreground">{b.correct}/{b.total}</span>
                </div>
                <div className="flex items-center gap-4">
                  <ProgressRing value={acc / 100} size={64} stroke={6} valueClass="text-primary">
                    <span className="text-xs tabular">{acc.toFixed(0)}%</span>
                  </ProgressRing>
                  <div className="flex-1 space-y-1.5 text-[11px]">
                    <Bar label="Correct" value={b.correct} total={b.total} color="bg-emerald-400" />
                    <Bar label="Wrong" value={b.wrong} total={b.total} color="bg-red-400" />
                    <Bar label="Skipped" value={b.unattempted} total={b.total} color="bg-white/25" />
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>

        {/* Per-question review (only when we have the live result) */}
        {result && (
          <GlassCard className="p-4">
            <p className="text-sm font-medium mb-3">Question-by-question review</p>
            <div className="space-y-2.5">
              {result.questions.map((q, i) => {
                const userAns = result.answers[i]
                const isCorrect = userAns === q.correctIndex
                const attempted = userAns !== undefined
                return (
                  <div key={q.id} className="rounded-xl border border-border bg-white/[0.02] p-3.5">
                    <div className="flex items-start gap-3">
                      <span className={cn(
                        'grid place-items-center size-6 rounded-full shrink-0 mt-0.5',
                        !attempted ? 'bg-white/10 text-muted-foreground' : isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                      )}>
                        {!attempted ? <CircleDot className="size-3.5" /> : isCorrect ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">{q.text}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                          <span className="rounded-full bg-emerald-500/15 text-emerald-300 px-2 py-0.5">
                            Correct: {String.fromCharCode(65 + q.correctIndex)}
                          </span>
                          {attempted && !isCorrect && (
                            <span className="rounded-full bg-red-500/15 text-red-300 px-2 py-0.5">
                              You: {String.fromCharCode(65 + userAns)}
                            </span>
                          )}
                          {!attempted && <span className="rounded-full bg-white/5 text-muted-foreground px-2 py-0.5">Skipped</span>}
                          <span className="rounded-full bg-white/5 text-muted-foreground px-2 py-0.5">{q.subject}</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                          <span className="text-foreground font-medium">Solution: </span>{q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        )}

        {!result && (
          <EmptyState
            icon={<BarChart3 className="size-6" />}
            title="Subject-level analysis"
            hint="Per-question solutions are available right after you attempt a test live."
          />
        )}
      </div>
    </div>
  )
}

function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total ? (value / total) * 100 : 0
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 text-muted-foreground">{label}</span>
      <span className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <span className={cn('block h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </span>
      <span className="w-4 text-right tabular">{value}</span>
    </div>
  )
}
