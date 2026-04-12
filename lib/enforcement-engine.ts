import type {
  EnforcementState,
  Rule,
  SessionSnapshot,
  ViolationType,
} from '@/types'

/* ============================================================
   Enforcement Engine — Level escalation ladder
   0: clean          - no action
   1: warning        - toast/overlay warning
   2: friction       - friction gate (checklist)
   3: cooldown       - timer block
   4: overlay        - full overlay block
   5: lock           - session locked
   6: alert          - partner/mentor alerted
   ============================================================ */

export type EvaluationResult = {
  state: EnforcementState
  triggeredRules: string[]
  violationType?: ViolationType
  reason: string
}

const LEVEL_ACTIONS: EnforcementState['action'][] = [
  'none',
  'warn',
  'friction',
  'cooldown',
  'overlay',
  'lock',
  'alert',
]

export function evaluateEnforcement(
  snapshot: SessionSnapshot,
  rules: Rule[],
  currentLevel: number,
  cooldownMinutes = 10
): EvaluationResult {
  const triggered: string[] = []
  const reasons: string[] = []
  let violationType: ViolationType | undefined
  let nextLevel = currentLevel

  const enabledRules = rules.filter((r) => r.enabled)

  for (const rule of enabledRules) {
    switch (rule.type) {
      case 'MAX_TRADES_PER_DAY': {
        if (snapshot.tradesCount > rule.value) {
          triggered.push(rule.id)
          reasons.push(
            `Max daily trades exceeded (${snapshot.tradesCount} > ${rule.value}).`
          )
          violationType = 'MAX_TRADES_EXCEEDED'
          nextLevel = Math.max(nextLevel, enforceStep(rule.enforcement))
        }
        break
      }

      case 'MAX_DAILY_LOSS': {
        if (snapshot.dailyLoss > rule.value) {
          triggered.push(rule.id)
          reasons.push(
            `Daily loss limit exceeded ($${snapshot.dailyLoss.toFixed(
              0
            )} > $${rule.value}).`
          )
          violationType = 'DAILY_LOSS_EXCEEDED'
          nextLevel = Math.max(nextLevel, enforceStep(rule.enforcement) + 1)
        }
        break
      }

      case 'MAX_CONSECUTIVE_LOSSES': {
        if (snapshot.lossStreak >= rule.value) {
          triggered.push(rule.id)
          reasons.push(
            `Loss streak hit (${snapshot.lossStreak} consecutive losses).`
          )
          violationType = 'LOSS_STREAK'
          nextLevel = Math.max(nextLevel, enforceStep(rule.enforcement))
        }
        break
      }

      case 'MAX_LOT_SIZE': {
        const lastTrade = snapshot.recentTrades[0]
        if (lastTrade && lastTrade.lotSize > rule.value) {
          triggered.push(rule.id)
          reasons.push(
            `Lot size ${lastTrade.lotSize} exceeded max ${rule.value}.`
          )
          violationType = 'LOT_SIZE_ESCALATION'
          nextLevel = Math.max(nextLevel, enforceStep(rule.enforcement))
        }
        break
      }

      case 'COOLDOWN_AFTER_LOSS': {
        const last = snapshot.recentTrades[0]
        const prev = snapshot.recentTrades[1]
        if (last && prev && prev.result === 'LOSS') {
          const t1 = new Date(prev.closedAt || prev.openedAt).getTime()
          const t2 = new Date(last.openedAt).getTime()
          const minutesBetween = (t2 - t1) / 1000 / 60
          if (minutesBetween < rule.value) {
            triggered.push(rule.id)
            reasons.push(
              `Trade taken only ${minutesBetween.toFixed(
                1
              )}m after a loss (min ${rule.value}m).`
            )
            violationType = 'REVENGE_TRADING'
            nextLevel = Math.max(nextLevel, enforceStep(rule.enforcement) + 1)
          }
        }
        break
      }

      case 'NO_REVENGE_TRADING': {
        const last = snapshot.recentTrades[0]
        const prev = snapshot.recentTrades[1]
        if (last && prev && prev.result === 'LOSS' && last.lotSize > prev.lotSize) {
          triggered.push(rule.id)
          reasons.push(
            `Revenge trade detected: lot size escalated after a loss.`
          )
          violationType = 'REVENGE_TRADING'
          nextLevel = Math.max(nextLevel, enforceStep(rule.enforcement) + 1)
        }
        break
      }

      case 'MAX_DAILY_DRAWDOWN': {
        if (snapshot.dailyPnl < 0 && Math.abs(snapshot.dailyPnl) > rule.value) {
          triggered.push(rule.id)
          reasons.push(
            `Drawdown exceeded ($${Math.abs(snapshot.dailyPnl).toFixed(
              0
            )} > $${rule.value}).`
          )
          violationType = 'DAILY_LOSS_EXCEEDED'
          nextLevel = Math.max(nextLevel, enforceStep(rule.enforcement) + 2)
        }
        break
      }
    }
  }

  // Cap at 6
  nextLevel = Math.min(6, Math.max(0, nextLevel)) as EnforcementState['level']

  // Derive cooldown and lock from level
  let cooldownEndsAt: string | null = null
  let locked = false

  if (nextLevel >= 3 && nextLevel < 5) {
    cooldownEndsAt = new Date(
      Date.now() + cooldownMinutes * 60 * 1000
    ).toISOString()
  }
  if (nextLevel >= 5) {
    locked = true
  }

  const message =
    reasons[0] ||
    (nextLevel === 0 ? 'All rules respected. Keep your edge.' : 'Rule breach.')

  return {
    state: {
      level: nextLevel as EnforcementState['level'],
      locked,
      cooldownEndsAt,
      message,
      action: LEVEL_ACTIONS[nextLevel],
      lastViolationType: violationType,
    },
    triggeredRules: triggered,
    violationType,
    reason: message,
  }
}

function enforceStep(
  enforcement: Rule['enforcement']
): 1 | 2 | 3 | 4 | 5 | 6 {
  switch (enforcement) {
    case 'WARNING':
      return 1
    case 'FRICTION':
      return 2
    case 'COOLDOWN':
      return 3
    case 'OVERLAY':
      return 4
    case 'LOCK':
      return 5
    case 'ALERT':
      return 6
    default:
      return 1
  }
}

export const LEVEL_LABELS: Record<number, string> = {
  0: 'Clean',
  1: 'Warning',
  2: 'Friction',
  3: 'Cooldown',
  4: 'Overlay',
  5: 'Session Lock',
  6: 'Partner Alert',
}

export const LEVEL_COLORS: Record<number, string> = {
  0: '#30D158',
  1: '#30D158',
  2: '#5AC8FA',
  3: '#FF9F0A',
  4: '#FF6F0A',
  5: '#FF3B30',
  6: '#FF2D55',
}
