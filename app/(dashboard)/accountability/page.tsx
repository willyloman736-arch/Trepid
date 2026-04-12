'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassButton } from '@/components/ui/GlassButton'
import { GlassBadge } from '@/components/ui/GlassBadge'
import { GlassInput } from '@/components/ui/GlassInput'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { PartnerCard } from '@/components/accountability/PartnerCard'
import { LinkPartnerModal } from '@/components/accountability/LinkPartnerModal'
import { EscalationFlow } from '@/components/accountability/EscalationFlow'
import { AccountabilityGraph } from '@/components/3d/ClientOnly'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

type Tab = 'partners' | 'settings'

export default function AccountabilityPage() {
  const partners = useStore((s) => s.partners)
  const removePartner = useStore((s) => s.removePartner)
  const acceptPartner = useStore((s) => s.acceptPartner)
  const user = useStore((s) => s.user)
  const enforcement = useStore((s) => s.enforcement)
  const settings = useStore((s) => s.notificationSettings)
  const updateSettings = useStore((s) => s.updateNotificationSettings)

  const [tab, setTab] = useState<Tab>('partners')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const active = partners.filter((p) => p.status !== 'REVOKED')
  const activeCount = partners.filter((p) => p.status === 'ACTIVE').length
  const pendingCount = partners.filter((p) => p.status === 'PENDING').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-large-title text-label">Accountability</h1>
          <p className="text-callout text-label-secondary mt-1 max-w-xl">
            When you break your rules, the right people get notified.
          </p>
        </div>
        <GlassButton variant="primary" onClick={() => setModalOpen(true)}>
          <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} />
          Add Partner
        </GlassButton>
      </div>

      {/* Tabs */}
      <div
        className="inline-flex p-1 rounded-[14px]"
        style={{ background: 'rgba(0,0,0,0.06)' }}
      >
        {(['partners', 'settings'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'relative px-5 py-2 rounded-[10px] text-[14px] font-semibold transition-colors',
              tab === t ? 'text-label' : 'text-label-secondary hover:text-label'
            )}
          >
            {tab === t && (
              <motion.div
                layoutId="accountability-tab-ind"
                className="absolute inset-0 bg-white rounded-[10px] shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative">
              {t === 'partners' ? 'Partners' : 'Notification Settings'}
            </span>
          </button>
        ))}
      </div>

      {tab === 'partners' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatPanel
              label="Active Partners"
              value={activeCount.toString()}
              tone="success"
            />
            <StatPanel
              label="Pending Invites"
              value={pendingCount.toString()}
              tone="warning"
            />
            <StatPanel
              label="Alert Stage"
              value={`Level ${settings.notifyStage}+`}
              tone="accent"
            />
          </div>

          {/* 3D graph + escalation */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
            <GlassCard
              padding="p-6"
              hover={false}
              className="h-[440px] overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-title-3 text-label">Your Network</h3>
                  <p className="text-footnote text-label-secondary mt-0.5">
                    You at the center, partners in orbit
                  </p>
                </div>
                <GlassBadge tone="success" pulse>
                  Live
                </GlassBadge>
              </div>

              <div className="relative h-[calc(100%-72px)] -mx-6 -mb-6">
                <AccountabilityGraph
                  traderName={user?.name || 'You'}
                  partners={active}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[11px] font-semibold">
                  <div className="flex items-center gap-3">
                    <Legend color="#007AFF" label="You" />
                    <Legend color="#30D158" label="Mentor" />
                    <Legend color="#BF5AF2" label="Partner" />
                  </div>
                  <span className="text-label-tertiary">Pulsing = recent alert</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard padding="p-6" hover={false}>
              <h3 className="text-title-3 text-label mb-1">Escalation Flow</h3>
              <p className="text-footnote text-label-secondary mb-5">
                Currently at level {enforcement.level}
              </p>
              <EscalationFlow
                currentLevel={enforcement.level}
                notifyStage={settings.notifyStage}
              />
            </GlassCard>
          </div>

          {/* Partner grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-title-3 text-label">Linked People</h2>
              <p className="text-footnote text-label-tertiary">
                {active.length} partner{active.length === 1 ? '' : 's'}
              </p>
            </div>

            {active.length === 0 ? (
              <GlassCard padding="p-0" hover={false}>
                <EmptyState
                  type="accountability_no_partners"
                  onCta={() => setModalOpen(true)}
                />
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {active.map((partner, i) => (
                  <PartnerCard
                    key={partner.id}
                    partner={partner}
                    onRevoke={removePartner}
                    onAccept={acceptPartner}
                    onSelect={(id) =>
                      setSelectedId((prev) => (prev === id ? null : id))
                    }
                    selected={selectedId === partner.id}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'settings' && (
        <div className="max-w-3xl space-y-5">
          <GlassCard padding="p-6" hover={false}>
            <h3 className="text-title-3 text-label mb-1">Channels</h3>
            <p className="text-footnote text-label-secondary mb-5">
              Where should alerts reach you
            </p>

            <div className="rounded-[14px] bg-white/[0.04] overflow-hidden divide-y divide-white/[0.08]">
              <ToggleRow
                label="In-App"
                desc="Notifications and toasts in the app"
                checked={settings.inApp}
                onChange={(v) => updateSettings({ inApp: v })}
              />
              <ToggleRow
                label="Push Notifications"
                desc="Browser notifications when tab is backgrounded"
                checked={settings.push}
                onChange={(v) => updateSettings({ push: v })}
              />
              <ToggleRow
                label="SMS Alerts"
                desc="Critical only — Twilio, optional cost"
                checked={settings.sms}
                onChange={(v) => updateSettings({ sms: v })}
                warning="SMS sends on level 6 only. Carrier rates apply."
              />
            </div>

            {settings.sms && (
              <div className="mt-5">
                <GlassInput
                  label="SMS Phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={settings.smsPhone}
                  onChange={(e) => updateSettings({ smsPhone: e.target.value })}
                />
              </div>
            )}
          </GlassCard>

          <GlassCard padding="p-6" hover={false}>
            <h3 className="text-title-3 text-label mb-1">Escalation Threshold</h3>
            <p className="text-footnote text-label-secondary mb-5">
              At which level should partners be notified
            </p>

            <div className="flex items-baseline justify-between mb-3">
              <span className="text-body text-label">Notify at stage</span>
              <span
                className="text-[28px] font-bold tabular-nums tracking-tight"
                style={{ color: '#007AFF' }}
              >
                Level {settings.notifyStage}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              value={settings.notifyStage}
              onChange={(e) =>
                updateSettings({ notifyStage: parseInt(e.target.value) })
              }
              className="w-full [accent-color:#007AFF]"
            />
            <div className="flex justify-between text-[11px] font-semibold text-label-tertiary mt-2">
              {[1, 2, 3, 4, 5, 6].map((l) => (
                <span key={l}>Lv {l}</span>
              ))}
            </div>
            <p className="text-footnote text-label-secondary mt-4">
              Recommended: Level 5. Lower values may cause partner notification fatigue.
            </p>
          </GlassCard>

          <GlassCard padding="p-6" hover={false}>
            <h3 className="text-title-3 text-label mb-1">Routines</h3>
            <p className="text-footnote text-label-secondary mb-5">
              Automated reminders and summaries
            </p>

            <div className="rounded-[14px] bg-white/[0.04] overflow-hidden divide-y divide-white/[0.08]">
              <ToggleRow
                label="Daily summary"
                desc="Evening recap of today's discipline"
                checked={settings.dailySummary}
                onChange={(v) => updateSettings({ dailySummary: v })}
              />
              <ToggleRow
                label="Morning priming"
                desc="8am reminder based on recent violations"
                checked={settings.morningPriming}
                onChange={(v) => updateSettings({ morningPriming: v })}
              />
            </div>
          </GlassCard>
        </div>
      )}

      <LinkPartnerModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </motion.div>
  )
}

function StatPanel({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'success' | 'warning' | 'accent'
}) {
  const colorHex =
    tone === 'success' ? '#30D158' : tone === 'warning' ? '#FF9F0A' : '#007AFF'

  return (
    <div className="glass p-6">
      <div className="flex items-start justify-between mb-4">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-label-tertiary">
          {label}
        </p>
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: colorHex, boxShadow: `0 0 10px ${colorHex}80` }}
        />
      </div>
      <p className="text-[36px] font-bold text-label tabular-nums tracking-tight leading-none">
        {value}
      </p>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-2 h-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      <span className="text-label-secondary">{label}</span>
    </div>
  )
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
  warning,
}: {
  label: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
  warning?: string
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-start gap-4 p-4 hover:bg-white/[0.03] transition-colors text-left"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-label">{label}</p>
        <p className="text-[12px] text-label-tertiary">{desc}</p>
        {warning && (
          <p className="text-[11px] text-warning font-semibold mt-1">{warning}</p>
        )}
      </div>
      <div
        className={cn(
          'relative w-[50px] h-[31px] rounded-full transition-colors shrink-0 mt-0.5',
          checked ? 'bg-success' : 'bg-white/[0.15]'
        )}
      >
        <motion.span
          className="absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15)]"
          animate={{ left: checked ? '21px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  )
}
