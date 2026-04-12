'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon, IconName } from '@/components/ui/Icon'
import { useStore } from '@/lib/store'
import { ease } from '@/lib/animation'
import { cn } from '@/lib/utils'

/* ============================================================
   CinematicOnboarding — first-run only, 4 steps.
   Gated by localStorage 'trepid_onboarded' flag.
   Uses Framer Motion AnimatePresence for slide transitions.
   ============================================================ */

const STORAGE_KEY = 'trepid_onboarded'

type Platform = 'MT5' | 'MT4' | 'MOBILE' | 'MANUAL'

interface PlatformOption {
  id: Platform
  label: string
  subtitle: string
  icon: IconName
}

const PLATFORMS: PlatformOption[] = [
  { id: 'MT5', label: 'MT5 Desktop', subtitle: 'MetaTrader 5', icon: 'bar-chart' },
  { id: 'MT4', label: 'MT4 Desktop', subtitle: 'MetaTrader 4', icon: 'bar-chart' },
  { id: 'MOBILE', label: 'Mobile App', subtitle: 'Broker mobile', icon: 'layout-dashboard' },
  { id: 'MANUAL', label: "I'll log manually", subtitle: 'Journal first', icon: 'book-open' },
]

export function CinematicOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [maxTrades, setMaxTrades] = useState(3)
  const updateRule = useStore((s) => s.updateRule)
  const rules = useStore((s) => s.rules)

  /* On mount: check localStorage gate (client-only) */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) setVisible(true)
  }, [])

  const finish = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, '1')
    }
    setVisible(false)
    router.push('/dashboard')
  }

  /* Apply the "first rule" — write to store */
  const applyFirstRule = () => {
    const rule = rules.find((r) => r.type === 'MAX_TRADES_PER_DAY')
    if (rule) {
      updateRule(rule.id, { value: maxTrades, enabled: true })
    }
    setStep(3)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 0 && <StepStatement key="statement" onContinue={() => setStep(1)} />}
        {step === 1 && (
          <StepPlatform
            key="platform"
            selected={selectedPlatform}
            onSelect={setSelectedPlatform}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StepFirstRule
            key="first-rule"
            maxTrades={maxTrades}
            onChange={setMaxTrades}
            onSet={applyFirstRule}
          />
        )}
        {step === 3 && <StepReady key="ready" onStart={finish} />}
      </AnimatePresence>

      {/* Step progress dots — bottom center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 rounded-full"
            initial={false}
            animate={{
              width: step === i ? 24 : 6,
              backgroundColor:
                step === i ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   STEP 0 — The Statement
   Lines fade in one at a time.
   ============================================================ */
function StepStatement({ onContinue }: { onContinue: () => void }) {
  const [lineIdx, setLineIdx] = useState(0)
  const lines = [
    { text: 'You know your strategy.', delay: 800 },
    { text: 'You keep breaking your own rules.', delay: 1000 },
    { text: 'Every trader does.', delay: 800 },
    { text: 'Trepid fixes that.', delay: 1200, highlight: true },
  ]

  useEffect(() => {
    if (lineIdx >= lines.length) return
    const t = setTimeout(() => {
      setLineIdx((i) => i + 1)
    }, lines[lineIdx].delay)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIdx])

  const allShown = lineIdx >= lines.length

  return (
    <motion.div
      key="statement"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: '-30%' }}
      transition={{ duration: 0.5, ease: ease.appleOut }}
      className="absolute inset-0 flex flex-col items-center justify-center px-8"
      style={{ background: '#000000' }}
    >
      <div className="space-y-6 text-center max-w-2xl">
        {lines.map((line, i) => (
          <AnimatePresence key={i}>
            {i < lineIdx && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: ease.appleOut }}
                className={cn(
                  'text-[32px] md:text-[40px] font-bold leading-tight tracking-tight',
                  line.highlight ? 'text-gradient-accent' : 'text-white'
                )}
                style={
                  line.highlight
                    ? {
                        background:
                          'linear-gradient(135deg, #4F6EF7 0%, #5E5CE6 35%, #BF5AF2 65%, #FF2D55 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }
                    : undefined
                }
              >
                {line.text}
              </motion.p>
            )}
          </AnimatePresence>
        ))}
      </div>

      {/* Continue hint */}
      <AnimatePresence>
        {allShown && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={onContinue}
            className="absolute bottom-20 flex items-center gap-2 text-[14px] font-medium text-white/60 hover:text-white transition-colors"
          >
            Continue
            <Icon name="arrow-right" className="w-4 h-4" strokeWidth={2.2} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ============================================================
   STEP 1 — Connect your platform
   ============================================================ */
function StepPlatform({
  selected,
  onSelect,
  onNext,
}: {
  selected: Platform | null
  onSelect: (p: Platform) => void
  onNext: () => void
}) {
  return (
    <motion.div
      key="platform"
      initial={{ opacity: 0, x: '30%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '-30%' }}
      transition={{ duration: 0.5, ease: ease.appleOut }}
      className="absolute inset-0 flex flex-col items-center justify-center px-6"
    >
      <div className="w-full max-w-2xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[40px] font-bold text-white tracking-tight mb-3"
        >
          How do you trade?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[17px] text-white/60 mb-10"
        >
          Pick your platform. We&apos;ll tailor the experience.
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {PLATFORMS.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08, ease: ease.appleOut }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(p.id)}
              className={cn(
                'glass p-5 flex flex-col items-center gap-3 text-center transition-colors',
                selected === p.id && 'ring-2 ring-accent'
              )}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-[14px] grid place-items-center',
                  selected === p.id
                    ? 'bg-accent/20 text-accent'
                    : 'bg-white/[0.08] text-label-secondary'
                )}
              >
                <Icon name={p.icon} className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white">{p.label}</p>
                <p className="text-[11px] text-white/50 mt-0.5">{p.subtitle}</p>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: selected ? 1 : 0.3 }}
          disabled={!selected}
          onClick={onNext}
          whileHover={selected ? { scale: 1.02 } : undefined}
          whileTap={selected ? { scale: 0.97 } : undefined}
          className="btn-primary !px-8 !py-4 !text-[16px] disabled:cursor-not-allowed"
        >
          Continue
          <Icon name="arrow-right" className="w-4 h-4" strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ============================================================
   STEP 2 — Your first rule (slider)
   ============================================================ */
function StepFirstRule({
  maxTrades,
  onChange,
  onSet,
}: {
  maxTrades: number
  onChange: (n: number) => void
  onSet: () => void
}) {
  return (
    <motion.div
      key="first-rule"
      initial={{ opacity: 0, x: '30%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '-30%' }}
      transition={{ duration: 0.5, ease: ease.appleOut }}
      className="absolute inset-0 flex flex-col items-center justify-center px-6"
    >
      <div className="w-full max-w-xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[40px] font-bold text-white tracking-tight mb-3"
        >
          Set your most important rule.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[17px] text-white/60 mb-10"
        >
          You can add more later. Start with one.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-8 text-left"
        >
          <div className="flex items-baseline justify-between mb-6">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-white/50">
              Maximum trades per day
            </p>
            <motion.span
              key={maxTrades}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="text-[64px] font-extrabold text-accent tabular-nums leading-none"
            >
              {maxTrades}
            </motion.span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={maxTrades}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full [accent-color:#4F6EF7] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-white/40 mt-2 font-medium">
            <span>1</span>
            <span>10</span>
          </div>
          <p className="text-[14px] text-white/70 mt-6 leading-relaxed">
            If you take more than{' '}
            <span className="text-accent font-semibold">{maxTrades}</span>{' '}
            {maxTrades === 1 ? 'trade' : 'trades'}, Trepid will warn you
            immediately and escalate enforcement.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={onSet}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="btn-primary !px-8 !py-4 !text-[16px] mt-8"
        >
          Set this rule
          <Icon name="arrow-right" className="w-4 h-4" strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ============================================================
   STEP 3 — Ready / meet your companion
   ============================================================ */
function StepReady({ onStart }: { onStart: () => void }) {
  const [messageIdx, setMessageIdx] = useState(0)
  const mockConversation = [
    { from: 'user' as const, text: 'Can I take another trade?' },
    {
      from: 'bot' as const,
      text: "You've taken 2/3 trades today. One remaining. Make it count.",
    },
  ]

  useEffect(() => {
    if (messageIdx >= mockConversation.length) return
    const t = setTimeout(
      () => setMessageIdx((i) => i + 1),
      messageIdx === 0 ? 1200 : 1800
    )
    return () => clearTimeout(t)
  }, [messageIdx, mockConversation.length])

  return (
    <motion.div
      key="ready"
      initial={{ opacity: 0, x: '30%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: ease.appleOut }}
      className="absolute inset-0 flex flex-col items-center justify-center px-6"
    >
      <div className="w-full max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: ease.appleOut, delay: 0.2 }}
          className="onboarding-companion-bubble relative mx-auto mb-8"
          style={{ width: 96, height: 96 }}
        >
          <div className="bubble-wrapper">
            <div className="bubble-container">
              <div className="bubble-inner" />
              <div className="bubble-inner-2" />
              <div className="bubble-membrane" />
              <div className="bubble-specular" />
              <div className="bubble-specular-2" />
            </div>
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-[40px] font-bold text-white tracking-tight mb-3"
        >
          Meet your companion.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="text-[17px] text-white/60 mb-10"
        >
          Ask it anything. It knows your session in real time.
        </motion.p>

        {/* Mock chat bubbles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="glass-dark p-5 rounded-[20px] mb-8 space-y-3 text-left max-w-md mx-auto"
          style={{ borderRadius: '20px' }}
        >
          {mockConversation.map((m, i) => (
            <AnimatePresence key={i}>
              {i < messageIdx && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    'flex',
                    m.from === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] px-4 py-2.5 text-[14px] leading-snug',
                      m.from === 'user'
                        ? 'bg-accent text-white rounded-[16px] rounded-br-[4px]'
                        : 'bg-white/[0.1] text-white rounded-[16px] rounded-bl-[4px]'
                    )}
                  >
                    {m.text}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: messageIdx >= mockConversation.length ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          onClick={onStart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="btn-primary !px-8 !py-4 !text-[16px]"
        >
          Start Trading
          <Icon name="arrow-right" className="w-4 h-4" strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  )
}
