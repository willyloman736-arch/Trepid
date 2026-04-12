'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { GlassButton } from '@/components/ui/GlassButton'
import { useStore } from '@/lib/store'
import { LEVEL_LABELS } from '@/lib/enforcement-engine'

/**
 * Violation intervention — Apple-style.
 * For heavy level 4+ breaches, shows a centered glass modal with
 * override + cooldown CTA. The floating TopBar pill also pulses.
 */
export function WarningOverlay() {
  const show = useStore((s) => s.showViolationOverlay)
  const enforcement = useStore((s) => s.enforcement)
  const rules = useStore((s) => s.rules)
  const startCooldown = useStore((s) => s.startCooldown)
  const override = useStore((s) => s.overrideViolation)
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (!show) {
      setCountdown(10)
      return
    }
    const id = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [show])

  const cooldownRule = rules.find(
    (r) => r.type === 'COOLDOWN_AFTER_LOSS' || r.type === 'MAX_CONSECUTIVE_LOSSES'
  )
  const cooldownMin = cooldownRule?.value ?? 10

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-2xl" />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="glass-modal relative z-10 w-full max-w-lg p-8"
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.2, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ background: 'rgba(255,159,10,0.3)', filter: 'blur(20px)' }}
                />
                <div className="relative w-20 h-20 rounded-full grid place-items-center"
                  style={{
                    background: 'linear-gradient(135deg, #FF9F0A 0%, #FF6F0A 100%)',
                    boxShadow: '0 12px 32px rgba(255,159,10,0.45)',
                  }}
                >
                  <Icon name="warning" className="w-10 h-10 text-white" strokeWidth={2.2} />
                </div>
              </div>
            </div>

            <p className="text-[12px] font-semibold uppercase tracking-wider text-warning text-center mb-2">
              Rule Violation · Level {enforcement.level}
            </p>
            <h2 className="text-title-1 text-label text-center mb-3">
              {LEVEL_LABELS[enforcement.level] || 'Violation'} triggered
            </h2>
            <p className="text-body text-label-secondary text-center mb-8 max-w-sm mx-auto leading-relaxed">
              {enforcement.message}
            </p>

            {/* Ladder */}
            <div className="mb-8">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((lvl) => {
                  const active = lvl <= enforcement.level
                  const color =
                    lvl <= 2 ? '#30D158' : lvl <= 4 ? '#FF9F0A' : '#FF3B30'
                  return (
                    <div key={lvl} className="flex-1">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          background: active ? color : 'rgba(0,0,0,0.06)',
                          boxShadow: active ? `0 0 10px ${color}70` : 'none',
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Companion note */}
            <div className="rounded-[14px] bg-accent/8 p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-accent to-indigo grid place-items-center shrink-0">
                  <Icon name="sparkles" className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <div className="text-[13px] text-label leading-relaxed">
                  <span className="font-semibold">Trepid says:</span> Overtrading
                  is the #1 killer of edge. Start the {cooldownMin}-minute cooldown
                  and let the urge pass.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <GlassButton
                variant="ghost"
                disabled={countdown > 0}
                onClick={override}
                className="!py-3.5 !text-[15px]"
              >
                {countdown > 0 ? `Override (${countdown}s)` : 'Override'}
              </GlassButton>
              <GlassButton
                variant="primary"
                onClick={() => startCooldown(cooldownMin)}
                className="!py-3.5 !text-[15px]"
              >
                <Icon name="lock" className="w-4 h-4" strokeWidth={2.2} />
                Start Cooldown
              </GlassButton>
            </div>

            <p className="mt-5 text-[12px] text-center text-label-tertiary">
              Override applies −15 discipline penalty
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
