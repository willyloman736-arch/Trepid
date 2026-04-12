'use client'

import { motion } from 'framer-motion'
import { LEVEL_COLORS, LEVEL_LABELS } from '@/lib/enforcement-engine'
import { cn } from '@/lib/utils'

const STAGES = [
  { level: 1, description: 'Soft warning notification' },
  { level: 2, description: 'Friction checklist gate' },
  { level: 3, description: 'Forced cooldown timer' },
  { level: 4, description: 'Full-screen intervention' },
  { level: 5, description: 'Session lock + partner notified' },
  { level: 6, description: 'SMS alert + escalation' },
]

interface EscalationFlowProps {
  currentLevel: number
  notifyStage: number
}

export function EscalationFlow({ currentLevel, notifyStage }: EscalationFlowProps) {
  return (
    <div className="space-y-3">
      {STAGES.map((stage, i) => {
        const active = currentLevel >= stage.level
        const color = LEVEL_COLORS[stage.level]
        const notify = stage.level >= notifyStage
        const isCurrent = currentLevel === stage.level
        return (
          <motion.div
            key={stage.level}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative flex items-start gap-4 p-3 rounded-[14px] transition-all',
              active ? 'bg-white/[0.04]' : ''
            )}
            style={
              isCurrent
                ? {
                    background: `${color}14`,
                    boxShadow: `0 0 0 1px ${color}40`,
                  }
                : undefined
            }
          >
            <div className="shrink-0 relative">
              <div
                className={cn(
                  'w-9 h-9 rounded-[10px] grid place-items-center font-bold text-[13px]',
                  active ? 'text-white' : 'text-label-tertiary bg-white/[0.05]'
                )}
                style={
                  active
                    ? {
                        background: color,
                        boxShadow: `0 4px 12px ${color}60`,
                      }
                    : undefined
                }
              >
                {stage.level}
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className="absolute left-1/2 top-full -translate-x-1/2 w-px h-3"
                  style={{
                    background: active ? color : 'rgba(0,0,0,0.08)',
                  }}
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 mb-0.5">
                <h4 className="text-[14px] font-semibold text-label">
                  {LEVEL_LABELS[stage.level]}
                </h4>
                <span
                  className={cn('chip shrink-0', notify ? 'chip-danger' : 'chip-slate')}
                >
                  {notify ? 'Partner' : 'Internal'}
                </span>
              </div>
              <p className="text-[12px] text-label-secondary">{stage.description}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
