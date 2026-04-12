'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { useStore } from '@/lib/store'
import { PRESETS } from '@/lib/seed-data'
import type { EnforcementLevel, Rule, RuleCategory } from '@/types'
import { cn } from '@/lib/utils'

const TABS: { id: RuleCategory; label: string }[] = [
  { id: 'position', label: 'Position' },
  { id: 'session', label: 'Session' },
  { id: 'loss', label: 'Loss Control' },
  { id: 'behavior', label: 'Behavior' },
]

const ENFORCEMENT_LEVELS: {
  value: EnforcementLevel
  label: string
  desc: string
}[] = [
  { value: 'WARNING', label: 'Warn', desc: 'Show a warning notification' },
  { value: 'FRICTION', label: 'Friction', desc: 'Require checklist before trade' },
  { value: 'COOLDOWN', label: 'Cooldown', desc: 'Start cooldown timer' },
  { value: 'OVERLAY', label: 'Overlay', desc: 'Full-screen intervention' },
  { value: 'LOCK', label: 'Lock', desc: 'Terminate the session' },
  { value: 'ALERT', label: 'Alert', desc: 'Notify accountability partner' },
]

export default function RulesPage() {
  const rules = useStore((s) => s.rules)
  const updateRule = useStore((s) => s.updateRule)
  const applyPreset = useStore((s) => s.applyPreset)
  const [activeTab, setActiveTab] = useState<RuleCategory>('session')

  const filtered = rules.filter((r) => r.category === activeTab)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-large-title text-label">Rules</h1>
        <p className="text-callout text-label-secondary mt-1 max-w-xl">
          Define your boundaries. Trepid enforces them for you.
        </p>
      </div>

      {/* Presets */}
      <section>
        <h2 className="text-title-3 text-label mb-4">Quick Presets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESETS.map((preset, i) => (
            <motion.div
              key={preset.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.98 }}
            >
              <GlassCard
                padding="p-5"
                interactive
                onClick={() => applyPreset(preset.overrides as Record<string, number>)}
                className="h-full group"
              >
                <div className="w-10 h-10 rounded-[12px] bg-accent/12 grid place-items-center mb-4">
                  <Icon name="shield-check" className="w-5 h-5 text-accent" strokeWidth={2.2} />
                </div>
                <h3 className="text-headline text-label mb-1">{preset.name}</h3>
                <p className="text-footnote text-label-secondary leading-relaxed">
                  {preset.description}
                </p>
                <p className="mt-4 text-[13px] font-semibold text-accent">
                  Apply preset →
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <section>
        <div
          className="inline-flex p-1 rounded-[14px] mb-6"
          style={{
            background: 'rgba(0,0,0,0.06)',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative px-5 py-2 rounded-[10px] text-[14px] font-semibold transition-colors',
                activeTab === tab.id
                  ? 'text-label'
                  : 'text-label-secondary hover:text-label'
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="rules-tab-indicator"
                  className="absolute inset-0 bg-white rounded-[10px] shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* iOS Settings-style grouped rule list */}
        <GlassCard padding="p-0" hover={false} className="overflow-hidden">
          <div className="divide-y divide-white/[0.08]">
            {filtered.map((rule, i) => (
              <RuleRow key={rule.id} rule={rule} index={i} onChange={updateRule} />
            ))}
            {filtered.length === 0 && <EmptyState type="rules_none_set" />}
          </div>
        </GlassCard>
      </section>
    </motion.div>
  )
}

function RuleRow({
  rule,
  index,
  onChange,
}: {
  rule: Rule
  index: number
  onChange: (id: string, patch: Partial<Rule>) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className={cn('transition-colors', !rule.enabled && 'opacity-50')}
    >
      {/* Main row */}
      <div className="flex items-center gap-4 px-5 py-4">
        <div
          className={cn(
            'w-9 h-9 rounded-[10px] grid place-items-center shrink-0',
            rule.enabled ? 'bg-accent/12 text-accent' : 'bg-white/[0.08] text-label-tertiary'
          )}
        >
          <Icon name="shield-check" className="w-4 h-4" strokeWidth={2.2} />
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 min-w-0 text-left"
        >
          <p className="text-[15px] font-semibold text-label truncate">
            {rule.name}
          </p>
          <p className="text-[13px] text-label-secondary truncate">
            {rule.description}
          </p>
        </button>

        {/* Value */}
        {rule.type !== 'NO_REVENGE_TRADING' && (
          <div className="text-right shrink-0">
            <p className="text-[15px] font-semibold text-label-secondary tabular-nums">
              {rule.unit === 'USD' ? `$${rule.value}` : rule.value}
              {rule.unit && rule.unit !== 'USD' && (
                <span className="text-label-tertiary ml-1 text-[13px]">
                  {rule.unit}
                </span>
              )}
            </p>
          </div>
        )}

        {/* iOS toggle */}
        <button
          onClick={() => onChange(rule.id, { enabled: !rule.enabled })}
          className={cn(
            'relative w-[50px] h-[31px] rounded-full transition-colors shrink-0',
            rule.enabled ? 'bg-success' : 'bg-white/[0.15]'
          )}
        >
          <motion.span
            className="absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_3px_1px_rgba(0,0,0,0.06)]"
            animate={{ left: rule.enabled ? '21px' : '2px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>

        {/* Chevron */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-6 h-6 grid place-items-center text-label-tertiary shrink-0"
        >
          <motion.div animate={{ rotate: expanded ? 90 : 0 }}>
            <Icon name="chevron-right" className="w-4 h-4" strokeWidth={2.2} />
          </motion.div>
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && rule.enabled && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="px-5 pb-5 pl-[76px] space-y-4">
            {/* Slider */}
            {rule.type !== 'NO_REVENGE_TRADING' && (
              <div>
                <p className="text-[12px] font-semibold text-label-secondary mb-2">
                  Threshold
                </p>
                <input
                  type="range"
                  min={rule.unit === 'USD' ? 50 : 1}
                  max={
                    rule.unit === 'USD'
                      ? 2000
                      : rule.type === 'MAX_TRADES_PER_DAY'
                        ? 20
                        : 30
                  }
                  step={rule.unit === 'USD' ? 50 : 1}
                  value={rule.value}
                  onChange={(e) =>
                    onChange(rule.id, { value: parseFloat(e.target.value) })
                  }
                  className="w-full [accent-color:#007AFF] cursor-pointer"
                />
              </div>
            )}

            {/* Enforcement level selector */}
            <div>
              <p className="text-[12px] font-semibold text-label-secondary mb-2">
                On breach, Trepid will...
              </p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
                {ENFORCEMENT_LEVELS.map((lvl) => (
                  <button
                    key={lvl.value}
                    onClick={() => onChange(rule.id, { enforcement: lvl.value })}
                    title={lvl.desc}
                    className={cn(
                      'px-3 py-2 rounded-[10px] text-[12px] font-semibold transition-all',
                      rule.enforcement === lvl.value
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-white/[0.05] text-label-secondary hover:bg-white/[0.1]'
                    )}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
