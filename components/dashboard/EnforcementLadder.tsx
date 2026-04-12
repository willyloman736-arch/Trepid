'use client'

import { motion } from 'framer-motion'
import { LEVEL_COLORS, LEVEL_LABELS } from '@/lib/enforcement-engine'
import { cn } from '@/lib/utils'

interface EnforcementLadderProps {
  level: number
}

export function EnforcementLadder({ level }: EnforcementLadderProps) {
  const levels = [1, 2, 3, 4, 5, 6]

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-label-tertiary">
          Enforcement Ladder
        </p>
        <span className="text-[13px] text-label-secondary">
          Stage {level} of 6 · {LEVEL_LABELS[level]}
        </span>
      </div>

      <div className="flex gap-2">
        {levels.map((lvl) => {
          const active = lvl <= level
          const color = LEVEL_COLORS[lvl]
          return (
            <motion.div
              key={lvl}
              className="flex-1"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: lvl * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className={cn(
                  'h-2 rounded-full transition-all duration-500',
                  !active && 'bg-white/[0.08]'
                )}
                style={
                  active
                    ? {
                        background: color,
                        boxShadow: `0 0 12px ${color}66`,
                      }
                    : undefined
                }
              />
              <p
                className={cn(
                  'mt-2 text-[11px] font-medium text-center',
                  active ? 'text-label-secondary' : 'text-label-tertiary'
                )}
              >
                {LEVEL_LABELS[lvl]?.split(' ')[0]}
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
