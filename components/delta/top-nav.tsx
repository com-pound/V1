'use client'

import { useStore, type TabId } from '@/lib/store'
import { Avatar, IconButton } from './ui'
import { cn } from '@/lib/utils'
import { Bell, Search, Triangle } from 'lucide-react'

const TABS: { id: TabId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'library', label: 'Library' },
  { id: 'tests', label: 'Tests' },
  { id: 'notes', label: 'Notes' },
  { id: 'live', label: 'Live' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings' },
]

export function TopNav() {
  const { activeTab, setTab, setSpotlight } = useStore()
  const profileName = useStore((s) => s.profile.name)

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 glass-strong border-b border-border flex items-center px-5 gap-4">
      {/* Logo */}
      <button onClick={() => setTab('home')} className="flex items-center gap-2.5 shrink-0">
        <span className="grid place-items-center size-8 rounded-xl bg-primary text-primary-foreground">
          <Triangle className="size-4 fill-current" />
        </span>
        <span className="font-semibold tracking-tight text-[15px]">
          Project <span className="text-primary">Delta</span>
        </span>
      </button>

      {/* Center nav */}
      <nav className="flex-1 flex items-center justify-center min-w-0">
        <div className="flex items-center gap-0.5 rounded-full bg-white/5 border border-border p-1 overflow-x-auto scroll-none max-w-full">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all whitespace-nowrap',
                activeTab === t.id
                  ? 'bg-cream text-cream-foreground elev-1'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Right cluster */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setSpotlight(true)}
          className="hidden md:flex items-center gap-2 rounded-full bg-white/5 border border-border pl-3 pr-2 py-1.5 text-xs text-muted-foreground hover:bg-white/10 transition-colors"
        >
          <Search className="size-3.5" />
          <span>Search</span>
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
        </button>
        <div className="relative">
          <IconButton label="Notifications">
            <Bell className="size-4" />
          </IconButton>
          <span className="absolute top-0.5 right-0.5 size-2 rounded-full bg-primary ring-2 ring-background" />
        </div>
        <button onClick={() => setTab('profile')} aria-label="Profile">
          <Avatar name={profileName} size={36} />
        </button>
      </div>
    </header>
  )
}
