'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { BackgroundOrbs } from '@/components/layout/BackgroundOrbs'
import NightSky from '@/components/ui/NightSky'
import { WarningOverlay } from '@/components/enforcement/WarningOverlay'
import { CooldownTimer } from '@/components/enforcement/CooldownTimer'
import { SessionLock } from '@/components/enforcement/SessionLock'
import { FloatingBubble } from '@/components/companion/FloatingBubble'
import { NotificationToaster } from '@/components/layout/NotificationToaster'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { KeyboardShortcuts } from '@/components/ui/KeyboardShortcuts'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { CinematicOnboarding } from '@/components/onboarding/CinematicOnboarding'
import { TabTitleUpdater } from '@/components/layout/TabTitleUpdater'
import { InstallBanner } from '@/components/ui/InstallBanner'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { useStore } from '@/lib/store'
import { installSoundsOnFirstGesture } from '@/lib/sounds'
import { useSoundBridge } from '@/hooks/useSoundBridge'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const enforcement = useStore((s) => s.enforcement)

  /* Wire audio cues to store transitions (trade/violation/lock/cooldown). */
  useSoundBridge()

  /* Global overlay state — mounted once, toggled from anywhere */
  const [cmdOpen, setCmdOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  /* Mock auth gate — if not logged in, redirect to login (after hydration) */
  useEffect(() => {
    const id = setTimeout(() => {
      if (!useStore.getState().authenticated) {
        router.push('/login')
      }
    }, 200)
    return () => clearTimeout(id)
  }, [router])

  /* Initialize sound system on first user gesture */
  useEffect(() => {
    installSoundsOnFirstGesture()
  }, [])

  /* ============================================================
     Global keydown listener — single source of truth for all
     app-wide shortcuts. Ignores keys pressed inside inputs,
     textareas, and contentEditable elements (so typing in the
     journal or chat doesn't trigger navigation).
     ============================================================ */
  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null): boolean => {
      if (!(el instanceof HTMLElement)) return false
      const tag = el.tagName
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        el.isContentEditable
      )
    }

    const handler = (e: KeyboardEvent) => {
      const typing = isTypingTarget(e.target)

      /* ⌘K / Ctrl+K — command palette. Works even when typing. */
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdOpen((v) => !v)
        return
      }

      /* ⌘/ — focus companion (dispatch event) */
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('trepid:open-companion'))
        return
      }

      if (typing) return

      /* ? — shortcuts overlay */
      if (e.key === '?') {
        e.preventDefault()
        setShortcutsOpen((v) => !v)
        return
      }

      /* Navigation shortcuts */
      const k = e.key.toLowerCase()
      if (k === 'l') {
        e.preventDefault()
        router.push('/journal')
      } else if (k === 'r') {
        e.preventDefault()
        router.push('/rules')
      } else if (k === 'j') {
        e.preventDefault()
        router.push('/journal')
      } else if (k === 'a') {
        e.preventDefault()
        router.push('/analytics')
      } else if (k === 's') {
        e.preventDefault()
        router.push('/dashboard')
      } else if (k === 'c') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('trepid:open-companion'))
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [router])

  /* ============================================================
     Listen for cross-component overlay open events so other
     components (TopBar, CommandPalette) can trigger them
     without prop-drilling.
     ============================================================ */
  useEffect(() => {
    const openPalette = () => setCmdOpen(true)
    const openNotif = () => setNotifOpen(true)
    const openShortcuts = () => setShortcutsOpen(true)
    window.addEventListener('trepid:open-palette', openPalette)
    window.addEventListener('trepid:open-notifications', openNotif)
    window.addEventListener('trepid:open-shortcuts', openShortcuts)
    return () => {
      window.removeEventListener('trepid:open-palette', openPalette)
      window.removeEventListener('trepid:open-notifications', openNotif)
      window.removeEventListener('trepid:open-shortcuts', openShortcuts)
    }
  }, [])

  const tint =
    enforcement.level >= 5
      ? 'danger'
      : enforcement.level >= 3
        ? 'warning'
        : 'default'

  return (
    <div className="relative min-h-screen">
      {/* Live tab title ticker */}
      <TabTitleUpdater />

      {/* First-run onboarding (gated by localStorage) */}
      <CinematicOnboarding />

      {/* Night sky — twinkling stars drifting across pure black.
          Replaces PriceWaves for the authenticated dashboard experience. */}
      <NightSky />

      {/* Soft gradient orbs — dimmed so the sky reads pitch black,
          leaving only the faintest color whisper at the edges. */}
      <BackgroundOrbs tint={tint} dim />

      <Sidebar />
      <TopBar />

      {/* Main content — z-10, sits above the star field */}
      <main className="relative z-10 md:pl-[72px] pb-24 md:pb-8">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 pt-24">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>

      {/* Mobile nav — iOS-style fixed bottom tab bar (mobile only).
          Uses the .mobile-only helper so the breakpoint matches the
          mobile @media block (avoids Tailwind md:hidden 1px gap at 768). */}
      <div className="mobile-only">
        <MobileTabBar />
      </div>

      {/* Global overlays */}
      <WarningOverlay />
      <CooldownTimer />
      <SessionLock />
      <NotificationToaster />
      <FloatingBubble />

      {/* New UI upgrades */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <KeyboardShortcuts
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
      <NotificationCenter
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
      />

      {/* PWA install banner — appears after 45s of engagement on mobile */}
      <InstallBanner />
    </div>
  )
}
