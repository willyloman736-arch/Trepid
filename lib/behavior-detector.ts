import type { BehaviorFlag, Trade } from '@/types'

/* ============================================================
   Behavior Detector — pattern recognition on trade history
   ============================================================ */

export function detectBehaviorPatterns(trades: Trade[]): BehaviorFlag[] {
  if (trades.length === 0) return []

  // Trades are assumed sorted: newest first
  const flags: BehaviorFlag[] = []
  const ordered = [...trades].sort(
    (a, b) => new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime()
  )

  // ----- Revenge trading: new trade within 5 min of a loss -----
  for (let i = 1; i < ordered.length; i++) {
    const prev = ordered[i - 1]
    const curr = ordered[i]
    if (prev.result === 'LOSS') {
      const prevClose = new Date(prev.closedAt || prev.openedAt).getTime()
      const currOpen = new Date(curr.openedAt).getTime()
      const gapMin = (currOpen - prevClose) / 1000 / 60
      if (gapMin < 5 && gapMin >= 0) {
        flags.push({
          type: 'REVENGE_TRADING',
          confidence: gapMin < 2 ? 0.95 : 0.75,
          description: `Revenge entry ${gapMin.toFixed(1)}m after a loss on ${prev.pair}.`,
          tradeIds: [curr.id],
        })
      }
    }
  }

  // ----- Overtrading: >3 trades in a 30-minute window -----
  const window = 30 * 60 * 1000
  for (let i = 0; i < ordered.length; i++) {
    const bucket = ordered.filter((t) => {
      const d = new Date(t.openedAt).getTime()
      const base = new Date(ordered[i].openedAt).getTime()
      return d >= base && d <= base + window
    })
    if (bucket.length > 3) {
      const existing = flags.find((f) => f.type === 'OVERTRADING')
      if (!existing) {
        flags.push({
          type: 'OVERTRADING',
          confidence: Math.min(0.98, 0.6 + (bucket.length - 3) * 0.1),
          description: `${bucket.length} trades in a 30-minute window.`,
          tradeIds: bucket.map((t) => t.id),
        })
      }
      break
    }
  }

  // ----- Lot escalation: current lot > previous after a loss -----
  for (let i = 1; i < ordered.length; i++) {
    const prev = ordered[i - 1]
    const curr = ordered[i]
    if (prev.result === 'LOSS' && curr.lotSize > prev.lotSize * 1.25) {
      flags.push({
        type: 'LOT_ESCALATION',
        confidence: 0.85,
        description: `Lot size jumped from ${prev.lotSize} → ${curr.lotSize} after a loss.`,
        tradeIds: [curr.id],
      })
    }
  }

  // ----- Rapid re-entry: same pair within 2 min of close -----
  for (let i = 1; i < ordered.length; i++) {
    const prev = ordered[i - 1]
    const curr = ordered[i]
    if (prev.pair === curr.pair && prev.closedAt) {
      const gap =
        (new Date(curr.openedAt).getTime() -
          new Date(prev.closedAt).getTime()) /
        1000 /
        60
      if (gap < 2 && gap >= 0) {
        flags.push({
          type: 'RAPID_REENTRY',
          confidence: 0.7,
          description: `Re-entered ${curr.pair} within ${gap.toFixed(1)}m.`,
          tradeIds: [curr.id],
        })
      }
    }
  }

  // ----- Loss chasing: increasing size with each consecutive loss -----
  let streak: Trade[] = []
  for (const t of ordered) {
    if (t.result === 'LOSS') {
      streak.push(t)
    } else {
      if (streak.length >= 3) {
        const sizes = streak.map((s) => s.lotSize)
        const escalating = sizes.every((v, i) => i === 0 || v >= sizes[i - 1])
        if (escalating && sizes[sizes.length - 1] > sizes[0]) {
          flags.push({
            type: 'LOSS_CHASING',
            confidence: 0.9,
            description: `${streak.length} consecutive losses with escalating size.`,
            tradeIds: streak.map((s) => s.id),
          })
        }
      }
      streak = []
    }
  }

  return flags
}
