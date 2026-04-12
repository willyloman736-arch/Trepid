'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon, IconName } from '@/components/ui/Icon'
import { useStore } from '@/lib/store'
import { modalVariants, overlayVariants } from '@/lib/animation'

/* ============================================================
   CommandPalette — ⌘K / Ctrl+K universal launcher
   - Fuzzy filters across label, category, and id
   - Arrow keys navigate, Enter executes, Esc closes
   - Commands grouped by category with sticky headers
   - Mounted once in dashboard layout
   ============================================================ */

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

interface Command {
  id: string
  label: string
  hint?: string
  icon: IconName
  category: 'Navigate' | 'Actions' | 'Ask'
  action: () => void
}

/* Simple fuzzy score: 0 if no match; higher = better match.
   Case-insensitive, favors prefix matches and sequential chars. */
function fuzzyScore(text: string, query: string): number {
  if (!query) return 1
  const t = text.toLowerCase()
  const q = query.toLowerCase()
  if (t.includes(q)) return t.startsWith(q) ? 100 : 50
  // Sequential character match
  let ti = 0
  let qi = 0
  let score = 0
  while (ti < t.length && qi < q.length) {
    if (t[ti] === q[qi]) {
      score += 1
      qi++
    }
    ti++
  }
  return qi === q.length ? score : 0
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)

  const lockSession = useStore((s) => s.lockSession)
  const resetDemo = useStore((s) => s.resetDemo)
  const appendChatMessage = useStore((s) => s.appendChatMessage)

  /* Reset query + selection when palette opens/closes */
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIdx(0)
      // Autofocus input next tick
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  /* Helper: companion query injects a user message into chat */
  const companionQuery = useCallback(
    (text: string) => {
      appendChatMessage({ from: 'user', text })
      // Give the bot a moment, then push a response-like followup
      setTimeout(() => {
        appendChatMessage({
          from: 'bot',
          text: 'Check your dashboard for live stats or open the companion for a full answer.',
        })
      }, 300)
    },
    [appendChatMessage]
  )

  /* Full command list — built once */
  const commands: Command[] = useMemo(
    () => [
      // Navigate
      {
        id: 'dashboard',
        label: 'Go to Dashboard',
        icon: 'layout-dashboard',
        category: 'Navigate',
        action: () => router.push('/dashboard'),
      },
      {
        id: 'rules',
        label: 'Go to Rules',
        icon: 'shield-check',
        category: 'Navigate',
        action: () => router.push('/rules'),
      },
      {
        id: 'journal',
        label: 'Go to Journal',
        icon: 'book-open',
        category: 'Navigate',
        action: () => router.push('/journal'),
      },
      {
        id: 'analytics',
        label: 'Go to Analytics',
        icon: 'bar-chart',
        category: 'Navigate',
        action: () => router.push('/analytics'),
      },
      {
        id: 'accountability',
        label: 'Go to Accountability',
        icon: 'users',
        category: 'Navigate',
        action: () => router.push('/accountability'),
      },
      {
        id: 'settings',
        label: 'Go to Settings',
        icon: 'settings',
        category: 'Navigate',
        action: () => router.push('/settings'),
      },

      // Actions
      {
        id: 'log-trade',
        label: 'Log a Trade',
        hint: 'Opens journal form',
        icon: 'plus',
        category: 'Actions',
        action: () => router.push('/journal'),
      },
      {
        id: 'lock-session',
        label: 'Lock Session Now',
        icon: 'lock',
        category: 'Actions',
        action: () => lockSession('Manual session lock via command palette'),
      },
      {
        id: 'reset-session',
        label: 'Reset Session',
        hint: 'Restores seed data',
        icon: 'refresh',
        category: 'Actions',
        action: () => resetDemo(),
      },
      {
        id: 'open-companion',
        label: 'Open Companion',
        icon: 'message-circle',
        category: 'Actions',
        action: () => {
          // Dispatch a window event so FloatingBubble can listen and open
          window.dispatchEvent(new CustomEvent('trepid:open-companion'))
        },
      },

      // Ask companion
      {
        id: 'check-trades',
        label: 'How many trades today?',
        icon: 'trending-up',
        category: 'Ask',
        action: () => companionQuery('How many trades have I taken today?'),
      },
      {
        id: 'check-loss',
        label: 'What is my daily loss?',
        icon: 'trending-down',
        category: 'Ask',
        action: () => companionQuery('What is my daily loss so far?'),
      },
      {
        id: 'can-i-trade',
        label: 'Can I take another trade?',
        icon: 'help-circle',
        category: 'Ask',
        action: () => companionQuery('Can I take another trade right now?'),
      },
      {
        id: 'am-i-safe',
        label: 'Am I overtrading?',
        icon: 'alert-triangle',
        category: 'Ask',
        action: () => companionQuery('Am I overtrading?'),
      },
    ],
    [router, lockSession, resetDemo, companionQuery]
  )

  /* Filter + rank by fuzzy score, preserve category grouping */
  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return commands
    return commands
      .map((c) => ({
        cmd: c,
        score: Math.max(
          fuzzyScore(c.label, q),
          fuzzyScore(c.category, q) * 0.3,
          fuzzyScore(c.id, q) * 0.5
        ),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.cmd)
  }, [commands, query])

  /* Group by category while preserving filter order */
  const grouped = useMemo(() => {
    const map = new Map<Command['category'], Command[]>()
    filtered.forEach((c) => {
      if (!map.has(c.category)) map.set(c.category, [])
      map.get(c.category)!.push(c)
    })
    return Array.from(map.entries())
  }, [filtered])

  /* Clamp selectedIdx when list changes */
  useEffect(() => {
    if (selectedIdx >= filtered.length) setSelectedIdx(Math.max(0, filtered.length - 1))
  }, [filtered, selectedIdx])

  /* Keyboard handling while open */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIdx((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const cmd = filtered[selectedIdx]
        if (cmd) {
          cmd.action()
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, filtered, selectedIdx, onClose])

  /* Lock body scroll while open */
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  /* Scroll selected item into view */
  useEffect(() => {
    if (!listRef.current) return
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-cmd-idx="${selectedIdx}"]`
    )
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIdx])

  /* Index lookup: flat index for a given command (for keyboard nav) */
  const indexOf = (cmd: Command) => filtered.findIndex((c) => c.id === cmd.id)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cmd-overlay"
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-[120] flex items-start justify-center pt-[18vh] px-4"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <motion.div
            key="cmd-panel"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="glass-modal relative w-full max-w-[560px] overflow-hidden"
            style={{ borderRadius: '16px', padding: 0 }}
            role="dialog"
            aria-label="Command palette"
          >
            {/* Input row */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] relative z-[2]">
              <Icon
                name="search"
                className="w-4 h-4 text-label-tertiary shrink-0"
                strokeWidth={2.2}
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedIdx(0)
                }}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent outline-none text-[15px] text-label placeholder:text-label-tertiary font-medium"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd>esc</kbd>
            </div>

            {/* Results list */}
            <div
              ref={listRef}
              className="max-h-[420px] overflow-y-auto scrollbar-thin py-2 relative z-[2]"
            >
              {grouped.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-[14px] text-label-tertiary">
                    No commands match{' '}
                    <span className="text-label">&ldquo;{query}&rdquo;</span>
                  </p>
                </div>
              ) : (
                grouped.map(([category, cmds]) => (
                  <div key={category}>
                    <div className="cmd-category">{category}</div>
                    {cmds.map((cmd) => {
                      const idx = indexOf(cmd)
                      const selected = idx === selectedIdx
                      return (
                        <div
                          key={cmd.id}
                          data-cmd-idx={idx}
                          className={`cmd-item mx-2 ${selected ? 'selected' : ''}`}
                          onMouseEnter={() => setSelectedIdx(idx)}
                          onClick={() => {
                            cmd.action()
                            onClose()
                          }}
                        >
                          <div className="cmd-item-icon">
                            <Icon name={cmd.icon} className="w-4 h-4" strokeWidth={2.2} />
                          </div>
                          <div className="cmd-item-label">
                            {cmd.label}
                            {cmd.hint && (
                              <span className="ml-2 text-[12px] font-normal text-label-tertiary">
                                {cmd.hint}
                              </span>
                            )}
                          </div>
                          <span className="cmd-item-enter">↵</span>
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint bar */}
            <div className="flex items-center justify-between gap-4 px-4 py-2.5 border-t border-white/[0.08] relative z-[2]">
              <div className="flex items-center gap-3 text-[11px] text-label-tertiary">
                <span className="flex items-center gap-1.5">
                  <kbd>↑</kbd>
                  <kbd>↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd>↵</kbd>
                  select
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd>esc</kbd>
                  close
                </span>
              </div>
              <span className="text-[11px] text-label-tertiary tabular-nums">
                {filtered.length} {filtered.length === 1 ? 'command' : 'commands'}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
