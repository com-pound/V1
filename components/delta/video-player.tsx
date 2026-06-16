'use client'

import { useStore } from '@/lib/store'
import { videos, chapters, SUBJECTS, fmtDuration } from '@/lib/mock-data'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Play, Pause, X, Maximize2, Minimize2, PictureInPicture2, SkipBack, SkipForward,
  Volume2, Gauge, Heart, Bookmark, Download, ListVideo,
} from 'lucide-react'

const SUBJECT_POSTER: Record<string, string> = {
  physics: 'from-[oklch(0.3_0.06_62)] to-[oklch(0.18_0.02_62)]',
  chemistry: 'from-[oklch(0.3_0.06_150)] to-[oklch(0.18_0.02_150)]',
  maths: 'from-[oklch(0.3_0.06_250)] to-[oklch(0.18_0.02_250)]',
  biology: 'from-[oklch(0.3_0.06_30)] to-[oklch(0.18_0.02_30)]',
  cs: 'from-[oklch(0.3_0.06_200)] to-[oklch(0.18_0.02_200)]',
  english: 'from-[oklch(0.3_0.05_90)] to-[oklch(0.18_0.02_90)]',
}

export function getVideo(id: string) {
  return videos.find((v) => v.id === id)
}

// Shared playback engine — advances store progress while playing.
function usePlayback(videoId: string | null) {
  const { videoProgress, setVideoProgress } = useStore()
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const video = videoId ? getVideo(videoId) : null
  const fraction = videoId ? videoProgress[videoId]?.fraction ?? 0 : 0
  const accRef = useRef(0)

  useEffect(() => {
    setPlaying(true)
  }, [videoId])

  useEffect(() => {
    if (!playing || !video || !videoId) return
    const iv = setInterval(() => {
      const cur = useStore.getState().videoProgress[videoId]?.fraction ?? 0
      const next = Math.min(1, cur + (speed * 1) / video.durationSec)
      setVideoProgress(videoId, next)
      // bump study hours occasionally
      accRef.current += speed
      if (accRef.current > 60) {
        accRef.current = 0
      }
      if (next >= 1) setPlaying(false)
    }, 250)
    return () => clearInterval(iv)
  }, [playing, video, videoId, speed, setVideoProgress])

  return { playing, setPlaying, speed, setSpeed, fraction, video }
}

function Seekbar({ fraction, onSeek, duration }: { fraction: number; onSeek: (f: number) => void; duration: number }) {
  return (
    <div
      className="group relative h-1.5 w-full cursor-pointer rounded-full bg-white/15"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        onSeek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)))
      }}
    >
      <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${fraction * 100}%` }} />
      {/* chapter markers */}
      {[0.25, 0.5, 0.75].map((m) => (
        <span key={m} className="absolute top-1/2 size-1 -translate-y-1/2 rounded-full bg-white/40" style={{ left: `${m * 100}%` }} />
      ))}
      <span
        className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: `${fraction * 100}%` }}
      />
    </div>
  )
}

export function VideoLayer() {
  const { theaterVideoId, pipVideoId, closeTheater, enterPip, closePip, restoreFromPip, openTheater, videoProgress } = useStore()
  const [maximized, setMaximized] = useState(false)
  const theater = usePlayback(theaterVideoId)
  const pip = usePlayback(pipVideoId)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (theaterVideoId && e.key === 'Escape') {
        if (maximized) {
          setMaximized(false)
          document.exitFullscreen?.().catch(() => {})
        } else closeTheater()
      }
      if (theaterVideoId && e.code === 'Space') {
        e.preventDefault()
        theater.setPlaying((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [theaterVideoId, maximized, closeTheater, theater])

  // Up next list
  const upNext = theaterVideoId
    ? videos.filter((v) => v.chapterId === getVideo(theaterVideoId)?.chapterId && v.id !== theaterVideoId).slice(0, 6)
    : []

  return (
    <>
      {/* THEATER */}
      {theaterVideoId && theater.video && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/80 backdrop-blur-sm" onClick={() => closeTheater()}>
          <div
            ref={containerRef}
            className={cn(
              'glass-strong overflow-hidden elev-3',
              maximized ? 'fixed inset-0 rounded-none' : 'w-[80vw] h-[80vh] rounded-2xl'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full">
              {/* Player */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className={cn('relative flex-1 bg-gradient-to-br grid place-items-center', SUBJECT_POSTER[theater.video.subjectId])}>
                  <button
                    onClick={() => theater.setPlaying((p) => !p)}
                    className="grid place-items-center size-20 rounded-full bg-black/30 backdrop-blur border border-white/20 hover:scale-105 transition-transform"
                    aria-label={theater.playing ? 'Pause' : 'Play'}
                  >
                    {theater.playing ? <Pause className="size-8 fill-current" /> : <Play className="size-8 fill-current translate-x-0.5" />}
                  </button>
                  <span className="absolute top-4 left-4 text-xs text-white/70">{SUBJECTS.find((s) => s.id === theater.video!.subjectId)?.name}</span>
                  <button onClick={() => closeTheater()} className="absolute top-4 right-4 grid place-items-center size-9 rounded-full bg-black/30 hover:bg-black/50" aria-label="Close">
                    <X className="size-4" />
                  </button>
                </div>
                {/* Controls */}
                <div className="p-4 space-y-3 border-t border-border bg-card/60">
                  <Seekbar fraction={theater.fraction} duration={theater.video.durationSec} onSeek={(f) => useStore.getState().setVideoProgress(theaterVideoId, f)} />
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <button onClick={() => theater.setPlaying((p) => !p)} className="text-foreground hover:text-primary">
                      {theater.playing ? <Pause className="size-5" /> : <Play className="size-5" />}
                    </button>
                    <button onClick={() => useStore.getState().setVideoProgress(theaterVideoId, Math.max(0, theater.fraction - 10 / theater.video!.durationSec))} className="hover:text-foreground"><SkipBack className="size-4" /></button>
                    <button onClick={() => useStore.getState().setVideoProgress(theaterVideoId, Math.min(1, theater.fraction + 10 / theater.video!.durationSec))} className="hover:text-foreground"><SkipForward className="size-4" /></button>
                    <span className="text-xs tabular">{fmtDuration(Math.round(theater.fraction * theater.video.durationSec))} / {fmtDuration(theater.video.durationSec)}</span>
                    <div className="flex-1" />
                    <button
                      onClick={() => theater.setSpeed(theater.speed >= 2 ? 1 : theater.speed + 0.5)}
                      className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-xs hover:text-foreground"
                    >
                      <Gauge className="size-3.5" /> {theater.speed}x
                    </button>
                    <Volume2 className="size-4" />
                    <button onClick={enterPip} className="hover:text-foreground" aria-label="Picture in picture"><PictureInPicture2 className="size-4" /></button>
                    <button
                      onClick={() => {
                        if (!maximized) {
                          containerRef.current?.requestFullscreen?.().catch(() => {})
                          setMaximized(true)
                        } else {
                          document.exitFullscreen?.().catch(() => {})
                          setMaximized(false)
                        }
                      }}
                      className="hover:text-foreground"
                      aria-label="Fullscreen"
                    >
                      {maximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{theater.video.title}</p>
                      <p className="text-xs text-muted-foreground">{theater.video.instructor}</p>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <button className="grid place-items-center size-8 rounded-full bg-white/5 hover:text-primary"><Heart className="size-4" /></button>
                      <button className="grid place-items-center size-8 rounded-full bg-white/5 hover:text-primary"><Bookmark className="size-4" /></button>
                      <button className="grid place-items-center size-8 rounded-full bg-white/5 hover:text-primary"><Download className="size-4" /></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Up Next sidebar */}
              {!maximized && (
                <div className="w-72 shrink-0 border-l border-border bg-card/40 flex flex-col">
                  <div className="flex items-center gap-2 p-4 border-b border-border">
                    <ListVideo className="size-4 text-primary" />
                    <span className="text-sm font-medium">Up Next</span>
                  </div>
                  <div className="flex-1 overflow-y-auto scroll-thin p-2 space-y-1">
                    {upNext.map((v) => (
                      <button key={v.id} onClick={() => openTheater(v.id)} className="w-full flex gap-3 rounded-xl p-2 hover:bg-white/5 text-left">
                        <span className={cn('relative grid place-items-center w-24 h-14 shrink-0 rounded-lg bg-gradient-to-br', SUBJECT_POSTER[v.subjectId])}>
                          <Play className="size-4 opacity-80" />
                          {videoProgress[v.id]?.completed && <span className="absolute bottom-1 right-1 size-2 rounded-full bg-primary" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-medium line-clamp-2">{v.title}</span>
                          <span className="block text-[11px] text-muted-foreground mt-1">{v.instructor} · {fmtDuration(v.durationSec)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PIP */}
      {pipVideoId && pip.video && (
        <div className="fixed bottom-5 right-5 z-[95] w-80 rounded-xl overflow-hidden glass-strong elev-3">
          <div className={cn('relative h-44 bg-gradient-to-br grid place-items-center cursor-pointer', SUBJECT_POSTER[pip.video.subjectId])} onClick={restoreFromPip}>
            <button onClick={(e) => { e.stopPropagation(); pip.setPlaying((p) => !p) }} className="grid place-items-center size-12 rounded-full bg-black/30 border border-white/20">
              {pip.playing ? <Pause className="size-5" /> : <Play className="size-5 translate-x-0.5" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); closePip() }} className="absolute top-2 right-2 grid place-items-center size-7 rounded-full bg-black/40 hover:bg-black/60" aria-label="Close PiP">
              <X className="size-3.5" />
            </button>
            <span className="absolute bottom-0 inset-x-0 h-1 bg-white/15">
              <span className="block h-full bg-primary" style={{ width: `${pip.fraction * 100}%` }} />
            </span>
          </div>
          <div className="p-2.5">
            <p className="text-xs font-medium truncate">{pip.video.title}</p>
            <p className="text-[11px] text-muted-foreground">{pip.video.instructor}</p>
          </div>
        </div>
      )}
    </>
  )
}
