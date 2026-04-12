'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { GlassButton } from '@/components/ui/GlassButton'
import { GlassInput } from '@/components/ui/GlassInput'
import { EmotionTagger } from './EmotionTagger'
import { Icon } from '@/components/ui/Icon'
import { FrictionGate } from '@/components/enforcement/FrictionGate'
import { useStore } from '@/lib/store'
import { PAIRS } from '@/lib/seed-data'
import type { Emotion, TradeDirection, TradeResult, TradeSession } from '@/types'
import { cn, fmtClock } from '@/lib/utils'

const SESSIONS: { value: TradeSession; label: string }[] = [
  { value: 'ASIAN', label: 'Asian' },
  { value: 'LONDON', label: 'London' },
  { value: 'NY', label: 'NY' },
  { value: 'OVERLAP', label: 'Overlap' },
]

export function TradeForm() {
  const addTrade = useStore((s) => s.addTrade)
  const enforcement = useStore((s) => s.enforcement)
  const session = useStore((s) => s.session)
  const setShowFriction = useStore((s) => s.setShowFrictionGate)

  const [pair, setPair] = useState(PAIRS[0])
  const [direction, setDirection] = useState<TradeDirection>('LONG')
  const [entry, setEntry] = useState('1.0850')
  const [stop, setStop] = useState('1.0830')
  const [takeProfit, setTakeProfit] = useState('1.0890')
  const [lot, setLot] = useState('0.20')
  const [tradeSession, setTradeSession] = useState<TradeSession>('NY')
  const [result, setResult] = useState<TradeResult>('WIN')
  const [pnl, setPnl] = useState('50')
  const [emotion, setEmotion] = useState<Emotion>('NEUTRAL')
  const [note, setNote] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'error'; msg: string } | null>(null)

  const cooldownRemaining = useMemo(() => {
    if (!enforcement.cooldownEndsAt) return 0
    return Math.max(
      0,
      Math.floor(
        (new Date(enforcement.cooldownEndsAt).getTime() - Date.now()) / 1000
      )
    )
  }, [enforcement.cooldownEndsAt])

  const blocked = session.locked || cooldownRemaining > 0
  const frictionRequired = enforcement.level === 2

  const doSubmit = () => {
    const signedPnl =
      result === 'LOSS' ? -Math.abs(parseFloat(pnl) || 0) : Math.abs(parseFloat(pnl) || 0)
    const res = addTrade({
      pair,
      direction,
      entryPrice: parseFloat(entry),
      stopLoss: parseFloat(stop),
      takeProfit: parseFloat(takeProfit),
      lotSize: parseFloat(lot),
      session: tradeSession,
      result,
      pnl: signedPnl,
      emotion,
      note: note.trim() || undefined,
    })

    if (res.violated) {
      setFeedback({ type: 'error', msg: `Rule triggered — ${res.reason}` })
    } else {
      setFeedback({ type: 'ok', msg: 'Trade logged to your journal' })
    }
    setTimeout(() => setFeedback(null), 3200)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (blocked) return
    if (frictionRequired) {
      setShowFriction(true)
      return
    }
    doSubmit()
  }

  return (
    <>
      <FrictionGate onProceed={doSubmit} onCancel={() => {}} />

      <form onSubmit={submit} className={cn(blocked && 'opacity-60 pointer-events-none')}>
        {blocked && (
          <div
            className={cn(
              'rounded-[16px] p-4 mb-5 flex items-center gap-4',
              session.locked ? 'bg-danger/10' : 'bg-warning/10'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-[12px] grid place-items-center shrink-0',
                session.locked ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
              )}
            >
              <Icon name="lock" className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <p
                className={cn(
                  'text-headline',
                  session.locked ? 'text-danger' : 'text-warning'
                )}
              >
                {session.locked ? 'Session Locked' : 'Cooldown Active'}
              </p>
              <p className="text-footnote text-label-secondary mt-0.5">
                {session.locked
                  ? 'Trading terminated for this session'
                  : `Unlock in ${fmtClock(cooldownRemaining)}`}
              </p>
            </div>
            {cooldownRemaining > 0 && (
              <div className="text-[32px] font-bold font-sans tabular-nums text-warning tracking-tight">
                {fmtClock(cooldownRemaining)}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Pair */}
          <div>
            <label className="text-[13px] font-semibold text-label mb-2 block">
              Pair
            </label>
            <select
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              className="input-glass !font-semibold"
            >
              {PAIRS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Direction */}
          <div>
            <label className="text-[13px] font-semibold text-label mb-2 block">
              Direction
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['LONG', 'SHORT'] as TradeDirection[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDirection(d)}
                  className={cn(
                    'py-3 rounded-[14px] font-bold text-[14px] transition-all',
                    direction === d && d === 'LONG'
                      ? 'bg-success text-white shadow-[0_4px_14px_rgba(48,209,88,0.35)]'
                      : direction === d && d === 'SHORT'
                        ? 'bg-danger text-white shadow-[0_4px_14px_rgba(255,59,48,0.35)]'
                        : 'bg-white/[0.05] text-label-secondary hover:bg-white/[0.1]'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <GlassInput
            label="Entry Price"
            type="number"
            step="0.0001"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            required
          />

          <GlassInput
            label="Lot Size"
            type="number"
            step="0.01"
            min="0.01"
            value={lot}
            onChange={(e) => setLot(e.target.value)}
            required
          />

          <GlassInput
            label="Stop Loss"
            type="number"
            step="0.0001"
            value={stop}
            onChange={(e) => setStop(e.target.value)}
          />

          <GlassInput
            label="Take Profit"
            type="number"
            step="0.0001"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
          />

          {/* Session */}
          <div>
            <label className="text-[13px] font-semibold text-label mb-2 block">
              Session
            </label>
            <div
              className="inline-flex p-1 rounded-[14px] w-full"
              style={{ background: 'rgba(0,0,0,0.06)' }}
            >
              {SESSIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setTradeSession(s.value)}
                  className={cn(
                    'relative flex-1 py-2 rounded-[10px] text-[13px] font-semibold transition-colors',
                    tradeSession === s.value
                      ? 'text-label'
                      : 'text-label-secondary'
                  )}
                >
                  {tradeSession === s.value && (
                    <motion.div
                      layoutId="trade-session-ind"
                      className="absolute inset-0 bg-white rounded-[10px] shadow-sm"
                    />
                  )}
                  <span className="relative">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          <div>
            <label className="text-[13px] font-semibold text-label mb-2 block">
              Result
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['WIN', 'LOSS'] as TradeResult[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setResult(r)}
                  className={cn(
                    'py-3 rounded-[14px] font-bold text-[14px] transition-all',
                    result === r && r === 'WIN'
                      ? 'bg-success text-white shadow-[0_4px_14px_rgba(48,209,88,0.35)]'
                      : result === r && r === 'LOSS'
                        ? 'bg-danger text-white shadow-[0_4px_14px_rgba(255,59,48,0.35)]'
                        : 'bg-white/[0.05] text-label-secondary hover:bg-white/[0.1]'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <GlassInput
            label="P&L"
            type="number"
            step="0.01"
            prefix="$"
            value={pnl}
            onChange={(e) => setPnl(e.target.value)}
            required
          />
        </div>

        {/* Emotion tagger */}
        <div className="mt-6">
          <label className="text-[13px] font-semibold text-label mb-3 block">
            Emotional state
          </label>
          <EmotionTagger value={emotion} onChange={setEmotion} />
        </div>

        {/* Note */}
        <div className="mt-6">
          <label className="text-[13px] font-semibold text-label mb-2 block">
            Notes
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What was the setup? Was it in your plan?"
            className="input-glass resize-none"
          />
        </div>

        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'mt-5 rounded-[14px] px-4 py-3 text-[14px] font-semibold',
              feedback.type === 'ok'
                ? 'bg-success/15 text-success'
                : 'bg-danger/12 text-danger'
            )}
          >
            {feedback.msg}
          </motion.div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <p className="text-footnote text-label-tertiary">
            Rule check runs on submit
          </p>
          <GlassButton type="submit" variant="primary" disabled={blocked}>
            <Icon name="check" className="w-4 h-4" strokeWidth={2.5} />
            Log Trade
          </GlassButton>
        </div>
      </form>
    </>
  )
}
