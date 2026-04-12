'use client'

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { useStore, useSnapshot } from '@/lib/store'
import { respondToMessage } from '@/lib/ai-companion'
import { fmtMoney, fmtTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

/**
 * The FloatingBubble — Trepid's always-on companion.
 *
 * Resting state: a 64px liquid-gradient sphere floating bottom-right.
 * Expanded state: morphs fluidly into a 400×560 chat panel via layoutId.
 * Reflects session state through color speed and pulse intensity.
 * Draggable to any position on screen.
 */

const QUICK_ACTIONS = [
  'Can I trade?',
  'My stats',
  'Am I overtrading?',
  'Close session',
]

export function FloatingBubble() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [viewport, setViewport] = useState({ w: 1280, h: 800 })
  const [jiggle, setJiggle] = useState(false)
  const jiggleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const messages = useStore((s) => s.chatMessages)
  const append = useStore((s) => s.appendChatMessage)
  const snap = useSnapshot()
  const { session, enforcement, totalPnl, trades } = snap

  /* Determine bubble state */
  const isLocked = session.locked || enforcement.level >= 5
  const inViolation = enforcement.level >= 3
  const atRisk = session.disciplineScore < 60

  /* Position — draggable */
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  /* Client-only mount guard so SSR doesn't touch window */
  useEffect(() => {
    setMounted(true)
    const update = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  /* Listen for external open requests (CommandPalette, keyboard shortcuts) */
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('trepid:open-companion', handler)
    return () =>
      window.removeEventListener('trepid:open-companion', handler)
  }, [])

  /* Auto-scroll when messages update */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing, open])

  if (!mounted) return null

  /* Water-balloon jiggle on click, then open the chat panel.
     Small delay lets the user see the first half of the jiggle
     before the Framer Motion layoutId morph takes over. */
  const handleBubbleClick = () => {
    if (jiggle) return
    setJiggle(true)
    if (jiggleTimeoutRef.current) clearTimeout(jiggleTimeoutRef.current)
    jiggleTimeoutRef.current = setTimeout(() => {
      setJiggle(false)
      setOpen(true)
    }, 280)
  }

  const send = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg) return
    append({ from: 'user', text: msg })
    setInput('')
    setTyping(true)
    const reply = respondToMessage(msg, useStore.getState())
    setTimeout(
      () => {
        append({ from: 'bot', text: reply })
        setTyping(false)
      },
      500 + Math.random() * 400
    )
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    send()
  }

  return (
    <LayoutGroup>
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="bubble"
            layoutId="companion-surface"
            drag
            dragMomentum={false}
            dragConstraints={{
              top: -viewport.h + 200,
              bottom: 40,
              left: -viewport.w + 200,
              right: 40,
            }}
            dragElastic={0.1}
            style={{ x, y }}
            onClick={handleBubbleClick}
            className={cn(
              'floating-bubble fixed bottom-8 right-8 z-50 cursor-pointer select-none',
              'w-16 h-16'
            )}
            whileHover={{ scale: 1.125 }}
            whileDrag={{ scale: 1.15, cursor: 'grabbing' }}
          >
            {/* Outer ring — pulses red when in violation */}
            {inViolation && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255,59,48,0.5) 0%, rgba(255,59,48,0) 70%)',
                }}
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.6, 0.2, 0.6],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}

            {/* Water-balloon wrapper — float animation, jiggle on click.
                Nested inside the Framer Motion drag container so the
                parent's drag/hover transforms don't fight with the CSS
                balloon-float transform (they live on different elements). */}
            <div className={cn('bubble-wrapper', jiggle && 'jiggle')}>
              {/* Morphing blob shape — clips all inner layers */}
              <div className="bubble-container">
                {/* Layer 1: rotating conic gradient, blurred */}
                <div className="bubble-inner" />
                {/* Layer 2: counter-rotating conic, screen-blended */}
                <div className="bubble-inner-2" />
                {/* Translucent water-balloon skin */}
                <div className="bubble-membrane" />
                {/* Main specular highlight top-left */}
                <div className="bubble-specular" />
                {/* Secondary wet sheen bottom-right */}
                <div className="bubble-specular-2" />
              </div>

              {/* Status badge — sibling of container, not clipped */}
              {isLocked && (
                <div className="absolute -top-1 -right-1 z-10 w-6 h-6 rounded-full bg-danger grid place-items-center shadow-lg ring-2 ring-[#000000]">
                  <Icon name="lock" className="w-3 h-3 text-white" />
                </div>
              )}
              {!isLocked && inViolation && (
                <div className="absolute -top-1 -right-1 z-10 w-6 h-6 rounded-full bg-warning grid place-items-center shadow-lg ring-2 ring-[#000000] text-white text-[11px] font-bold">
                  !
                </div>
              )}
              {!isLocked && !inViolation && session.totalViolations > 0 && (
                <div className="absolute -top-1 -right-1 z-10 min-w-5 h-5 px-1 rounded-full bg-danger grid place-items-center shadow-lg ring-2 ring-[#000000] text-white text-[10px] font-bold">
                  {session.totalViolations}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="panel"
            layoutId="companion-surface"
            style={{ x, y }}
            className="fixed bottom-8 right-8 z-50 w-[min(calc(100vw-4rem),400px)] h-[560px] max-h-[calc(100vh-4rem)] overflow-hidden glass-modal"
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          >
            {/* Ambient gradient glow inside panel */}
            <div className="absolute inset-0 rounded-[28px] overflow-hidden pointer-events-none">
              <div
                className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-30"
                style={{
                  background:
                    'radial-gradient(circle, #5E5CE6 0%, transparent 60%)',
                }}
              />
              <div
                className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-25"
                style={{
                  background:
                    'radial-gradient(circle, #4F6EF7 0%, transparent 60%)',
                }}
              />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <header className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.08]">
                <div className="relative w-8 h-8 shrink-0">
                  <div className="absolute inset-0 rounded-full liquid-gradient" />
                  <div
                    className="absolute inset-[2px] rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.3)',
                      backdropFilter: 'blur(4px)',
                      WebkitBackdropFilter: 'blur(4px)',
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-headline text-label leading-tight">
                    Trepid
                  </h3>
                  <p className="text-caption text-label-secondary flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    Monitoring session
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full grid place-items-center bg-white/[0.08] hover:bg-white/[0.14] text-label-secondary hover:text-label transition-colors"
                  aria-label="Close"
                >
                  <Icon name="close" className="w-3.5 h-3.5" />
                </button>
              </header>

              {/* Session context strip */}
              <div className="px-5 py-3 border-b border-white/[0.08] flex items-center gap-4 text-footnote">
                <div>
                  <span className="text-label-secondary">{trades.length} trades</span>
                </div>
                <div className="w-px h-3 bg-white/[0.14]" />
                <div
                  className={cn(
                    'font-semibold',
                    totalPnl >= 0 ? 'text-success' : 'text-danger'
                  )}
                >
                  {fmtMoney(totalPnl)}
                </div>
                <div className="w-px h-3 bg-white/[0.14]" />
                <div>
                  <span className="text-label-secondary">Score </span>
                  <span
                    className={cn(
                      'font-semibold',
                      session.disciplineScore >= 70
                        ? 'text-success'
                        : session.disciplineScore >= 40
                          ? 'text-warning'
                          : 'text-danger'
                    )}
                  >
                    {session.disciplineScore}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin">
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={cn(
                      'flex',
                      m.from === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[82%] px-3.5 py-2 text-[15px] leading-snug shadow-sm',
                        m.from === 'user'
                          ? 'bg-accent text-white rounded-[18px] rounded-br-[4px]'
                          : 'bg-white/[0.08] text-label rounded-[18px] rounded-bl-[4px] border border-white/[0.1]'
                      )}
                    >
                      {m.text}
                    </div>
                  </motion.div>
                ))}
                {typing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/[0.08] border border-white/[0.1] rounded-[18px] rounded-bl-[4px] px-4 py-2.5 shadow-sm">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-label-secondary"
                            animate={{
                              y: [0, -4, 0],
                              opacity: [0.4, 1, 0.4],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.15,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick actions */}
              <div className="px-5 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action}
                    onClick={() => send(action)}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[13px] font-medium hover:bg-accent/15 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={onSubmit}
                className="p-4 flex items-center gap-2 border-t border-white/[0.08]"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 px-4 py-2.5 rounded-full bg-white/[0.06] text-[15px] text-label placeholder:text-label-tertiary outline-none border border-transparent focus:border-accent/40 focus:bg-white/[0.1] transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={cn(
                    'w-10 h-10 rounded-full grid place-items-center transition-all shrink-0',
                    input.trim()
                      ? 'bg-accent text-white shadow-button hover:bg-accent-hover active:scale-95'
                      : 'bg-white/[0.08] text-label-tertiary cursor-not-allowed'
                  )}
                >
                  <Icon name="arrow-right" className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  )
}
