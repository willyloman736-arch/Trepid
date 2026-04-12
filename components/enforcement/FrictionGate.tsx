'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'
import { GlassButton } from '@/components/ui/GlassButton'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface FrictionGateProps {
  onProceed: () => void
  onCancel: () => void
}

const CHECKS = [
  'This trade is in my trading plan',
  'My setup is fully valid (structure + confluence)',
  'I am emotionally calm right now',
  'I checked the economic calendar',
]

export function FrictionGate({ onProceed, onCancel }: FrictionGateProps) {
  const show = useStore((s) => s.showFrictionGate)
  const setShow = useStore((s) => s.setShowFrictionGate)
  const [checked, setChecked] = useState<boolean[]>([false, false, false, false])
  const [countdown, setCountdown] = useState(5)
  const [armed, setArmed] = useState(false)

  const allChecked = checked.every(Boolean)

  useEffect(() => {
    if (!allChecked) {
      setArmed(false)
      setCountdown(5)
      return
    }
    setArmed(true)
    setCountdown(5)
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [allChecked])

  useEffect(() => {
    if (!show) {
      setChecked([false, false, false, false])
      setArmed(false)
      setCountdown(5)
    }
  }, [show])

  const close = () => {
    setShow(false)
    onCancel()
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-2xl"
            onClick={close}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="glass-modal relative z-10 w-full max-w-lg p-8"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-[20px] grid place-items-center"
                style={{
                  background: 'linear-gradient(135deg, #FF9F0A 0%, #FFD60A 100%)',
                  boxShadow: '0 12px 32px rgba(255,159,10,0.35)',
                }}
              >
                <Icon name="shield-check" className="w-8 h-8 text-white" strokeWidth={2.2} />
              </div>
            </div>

            <h2 className="text-title-1 text-label text-center mb-2">
              Before you proceed
            </h2>
            <p className="text-callout text-label-secondary text-center mb-8">
              Check every box. This trade demands conscious approval.
            </p>

            <div className="rounded-[16px] bg-white/[0.04] overflow-hidden divide-y divide-white/[0.08] mb-6">
              {CHECKS.map((text, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const next = [...checked]
                    next[i] = !next[i]
                    setChecked(next)
                  }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.03] text-left transition-colors"
                >
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full grid place-items-center transition-all shrink-0',
                      checked[i] ? 'bg-success' : 'bg-white/[0.1]'
                    )}
                  >
                    {checked[i] && (
                      <Icon name="check" className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    )}
                  </div>
                  <span className="text-body text-label flex-1">{text}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <GlassButton variant="ghost" onClick={close}>
                Cancel
              </GlassButton>
              <GlassButton
                variant="primary"
                disabled={!allChecked || countdown > 0}
                onClick={() => {
                  setShow(false)
                  onProceed()
                }}
              >
                {!allChecked
                  ? 'Check all boxes'
                  : countdown > 0
                    ? `Wait ${countdown}s...`
                    : 'Proceed'}
              </GlassButton>
            </div>

            {armed && countdown > 0 && (
              <p className="mt-4 text-[12px] text-warning text-center font-semibold">
                Forced pause: {countdown}s
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
