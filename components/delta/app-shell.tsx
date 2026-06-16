'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { TopNav } from './top-nav'
import { Spotlight } from './spotlight'
import { Onboarding } from './onboarding'
import { VideoLayer } from './video-player'
import { HomePage } from './pages/home'
import { LibraryPage } from './pages/library'
import { TestsPage } from './pages/tests'
import { NotesPage } from './pages/notes'
import { LivePage } from './pages/live'
import { AnalyticsPage } from './pages/analytics'
import { LeaderboardPage } from './pages/leaderboard'
import { AchievementsPage } from './pages/achievements'
import { ProfilePage } from './pages/profile'
import { SettingsPage } from './pages/settings'
import { SyllabusPage } from './pages/syllabus'
import { DoubtsPage } from './pages/doubts'

function ActivePage() {
  const tab = useStore((s) => s.activeTab)
  switch (tab) {
    case 'home': return <HomePage />
    case 'library': return <LibraryPage />
    case 'tests': return <TestsPage />
    case 'notes': return <NotesPage />
    case 'live': return <LivePage />
    case 'analytics': return <AnalyticsPage />
    case 'leaderboard': return <LeaderboardPage />
    case 'achievements': return <AchievementsPage />
    case 'profile': return <ProfilePage />
    case 'settings': return <SettingsPage />
    case 'syllabus': return <SyllabusPage />
    case 'doubts': return <DoubtsPage />
    default: return <HomePage />
  }
}

export function AppShell() {
  const { cycleTab, activeTab, spotlightOpen, theaterVideoId } = useStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable)
      if (typing || spotlightOpen || theaterVideoId) return
      if (e.key === 'ArrowRight') cycleTab(1)
      if (e.key === 'ArrowLeft') cycleTab(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cycleTab, spotlightOpen, theaterVideoId])

  if (!mounted) {
    return (
      <div className="ambient fixed inset-0 grid place-items-center">
        <div className="size-10 rounded-xl bg-primary/80 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="ambient fixed inset-0 flex flex-col">
      <TopNav />
      <main
        key={activeTab}
        className="absolute inset-x-0 bottom-0 top-16 overflow-y-auto overflow-x-hidden scroll-thin snap-y-section animate-[fadeUp_0.25s_ease]"
      >
        <ActivePage />
      </main>
      <Spotlight />
      <Onboarding />
      <VideoLayer />
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
