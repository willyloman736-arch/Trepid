'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassButton } from '@/components/ui/GlassButton'
import { GlassBadge } from '@/components/ui/GlassBadge'
import { Icon } from '@/components/ui/Icon'
import { useStore } from '@/lib/store'
import { sounds } from '@/lib/sounds'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const router = useRouter()
  const user = useStore((s) => s.user)
  const settings = useStore((s) => s.notificationSettings)
  const resetDemo = useStore((s) => s.resetDemo)
  const logout = useStore((s) => s.logout)
  const violations = useStore((s) => s.violations)

  /* Sound effects toggle (client-only state synced with localStorage) */
  const [soundsOn, setSoundsOn] = useState(false)
  useEffect(() => {
    setSoundsOn(sounds.getStoredPreference())
    const listener = (e: Event) => {
      const ce = e as CustomEvent<{ enabled: boolean }>
      setSoundsOn(ce.detail.enabled)
    }
    window.addEventListener('sounds:change', listener as EventListener)
    return () =>
      window.removeEventListener('sounds:change', listener as EventListener)
  }, [])

  const toggleSounds = () => {
    const next = !soundsOn
    sounds.init() // ensure AudioContext exists
    sounds.toggle(next)
    setSoundsOn(next)
    // Preview a chime when enabling
    if (next) {
      setTimeout(() => sounds.tradeLogged(), 80)
    }
  }

  const primingMessage = useMemo(() => {
    if (violations.length === 0) {
      return 'Clean slate. Take only valid setups today. Quality over quantity.'
    }
    const recent = violations[0]
    if (recent.type === 'REVENGE_TRADING') {
      return 'Yesterday you revenge traded after losses. Today: no trades within 10 min of a loss.'
    }
    if (
      recent.type === 'MAX_TRADES_EXCEEDED' ||
      recent.type === 'OVERTRADING'
    ) {
      return 'Yesterday you overtraded. Today: hard stop at your max. No exceptions.'
    }
    if (recent.type === 'LOSS_STREAK') {
      return 'Yesterday you broke loss streak discipline. Today: stop after 2 losses.'
    }
    return 'Review your rules. Yesterday you broke discipline. Today, choose better.'
  }, [violations])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 max-w-3xl"
    >
      <div>
        <h1 className="text-large-title text-label">Settings</h1>
        <p className="text-callout text-label-secondary mt-1">
          Profile, routines, and demo state.
        </p>
      </div>

      {/* Profile */}
      <GlassCard padding="p-6" hover={false}>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-accent to-indigo grid place-items-center shadow-button">
            <Icon name="user" className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-title-3 text-label truncate">
              {user?.name || 'Demo Trader'}
            </p>
            <p className="text-footnote text-label-secondary truncate">
              {user?.email || 'trader@trepid.app'}
            </p>
            <GlassBadge tone="success" className="mt-2">
              {user?.role || 'TRADER'}
            </GlassBadge>
          </div>
        </div>
      </GlassCard>

      {/* Morning priming */}
      <GlassCard padding="p-6" hover={false}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-[14px] bg-warning/15 grid place-items-center shrink-0">
            <Icon name="sparkles" className="w-6 h-6 text-warning" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-title-3 text-label">Morning Priming</h3>
              <GlassBadge tone="warning">8:00 AM daily</GlassBadge>
            </div>
            <p className="text-body text-label-secondary leading-relaxed mb-4">
              Every morning before markets open, Trepid sends you a sharp reminder
              based on yesterday&apos;s violations. Never motivational — always
              data-driven.
            </p>
            <div
              className="rounded-[14px] p-4 border-l-[3px] border-warning"
              style={{ background: 'rgba(255,159,10,0.08)' }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-warning mb-1">
                Tomorrow&apos;s message
              </p>
              <p className="text-body text-label">&ldquo;{primingMessage}&rdquo;</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Notifications summary */}
      <GlassCard padding="p-6" hover={false}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-title-3 text-label">Notifications</h3>
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => router.push('/accountability')}
          >
            Edit
          </GlassButton>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ChannelChip label="In-App" active={settings.inApp} />
          <ChannelChip label="Push" active={settings.push} />
          <ChannelChip label="SMS" active={settings.sms} />
        </div>
        <p className="text-footnote text-label-tertiary mt-4">
          Alerts fire at level {settings.notifyStage}+
        </p>
      </GlassCard>

      {/* Sound effects toggle */}
      <GlassCard padding="p-6" hover={false}>
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'w-12 h-12 rounded-[14px] grid place-items-center shrink-0 transition-colors',
              soundsOn
                ? 'bg-accent/15 text-accent'
                : 'bg-white/[0.06] text-label-tertiary'
            )}
          >
            <Icon
              name={soundsOn ? 'volume' : 'volume-off'}
              className="w-6 h-6"
              strokeWidth={2}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-title-3 text-label">Sound Effects</h3>
            <p className="text-footnote text-label-secondary mt-0.5">
              Subtle audio feedback for trade events and violations.
            </p>
          </div>
          <button
            onClick={toggleSounds}
            className={cn(
              'relative w-[50px] h-[31px] rounded-full transition-colors shrink-0',
              soundsOn ? 'bg-success' : 'bg-white/[0.15]'
            )}
            aria-label="Toggle sound effects"
          >
            <motion.span
              className="absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_3px_1px_rgba(0,0,0,0.06)]"
              animate={{ left: soundsOn ? '21px' : '2px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </GlassCard>

      {/* Demo controls */}
      <GlassCard padding="p-6" hover={false}>
        <h3 className="text-title-3 text-label mb-1">Demo Controls</h3>
        <p className="text-footnote text-label-secondary mb-5">
          This is a prototype. State lives in localStorage.
        </p>
        <div className="rounded-[14px] bg-white/[0.04] overflow-hidden divide-y divide-white/[0.08]">
          <ActionRow
            title="Reset demo data"
            desc="Restores seed trades, rules, and chat history"
            action={
              <GlassButton variant="ghost" size="sm" onClick={resetDemo}>
                <Icon name="zap" className="w-3 h-3" strokeWidth={2.5} />
                Reset
              </GlassButton>
            }
          />
          <ActionRow
            title="Sign out"
            desc="Clears session and redirects to login"
            action={
              <GlassButton variant="danger" size="sm" onClick={handleLogout}>
                Sign Out
              </GlassButton>
            }
          />
        </div>
      </GlassCard>

      <p className="text-center text-footnote text-label-tertiary">
        Trepid · v0.1 · Built with Next.js + Three.js
      </p>
    </motion.div>
  )
}

function ChannelChip({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className={cn(
        'rounded-[14px] p-4 flex items-center justify-between',
        active ? 'bg-success/10' : 'bg-white/[0.05]'
      )}
    >
      <span className="text-[15px] font-semibold text-label">{label}</span>
      <GlassBadge tone={active ? 'success' : 'slate'}>{active ? 'On' : 'Off'}</GlassBadge>
    </div>
  )
}

function ActionRow({
  title,
  desc,
  action,
}: {
  title: string
  desc: string
  action: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <p className="text-[15px] font-semibold text-label">{title}</p>
        <p className="text-[12px] text-label-tertiary">{desc}</p>
      </div>
      {action}
    </div>
  )
}
