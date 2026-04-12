import type { Trade, Violation, ViolationSeverity } from '@/types'
import { clamp } from '@/lib/utils'

/* ============================================================
   Discipline Scorer
   Start: 100
   Penalties: LOW -3, MEDIUM -8, HIGH -15, CRITICAL -25
   Rewards: clean journaled trades +1 each (cap 10)
   ============================================================ */

export function calculateDisciplineScore(
  trades: Trade[],
  violations: Violation[]
): number {
  let score = 100

  for (const v of violations) {
    score -= scoreDelta(v.severity)
  }

  // Reward clean journaled trades
  const cleanJournaled = trades.filter(
    (t) => (!t.ruleViolations || t.ruleViolations.length === 0) && t.note
  ).length
  score += Math.min(10, cleanJournaled)

  // Reward having any neutral / confident emotion trades (self-awareness)
  const awareTrades = trades.filter(
    (t) => t.emotion === 'NEUTRAL' || t.emotion === 'CONFIDENT'
  ).length
  score += Math.min(5, Math.floor(awareTrades / 2))

  return clamp(score, 0, 100)
}

function scoreDelta(sev: ViolationSeverity): number {
  switch (sev) {
    case 'LOW':
      return 3
    case 'MEDIUM':
      return 8
    case 'HIGH':
      return 15
    case 'CRITICAL':
      return 25
  }
}

export function severityFromLevel(level: number): ViolationSeverity {
  if (level >= 5) return 'CRITICAL'
  if (level >= 4) return 'HIGH'
  if (level >= 2) return 'MEDIUM'
  return 'LOW'
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Disciplined'
  if (score >= 65) return 'Steady'
  if (score >= 50) return 'At Risk'
  if (score >= 30) return 'Tilted'
  return 'Critical'
}

export function scoreColor(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 70) return 'success'
  if (score >= 40) return 'warning'
  return 'danger'
}

export function generateBehavioralNarrative(
  trades: Trade[],
  violations: Violation[]
): string {
  if (trades.length === 0 && violations.length === 0) {
    return 'Clean slate. Set your rules and start your session.'
  }
  const losses = trades.filter((t) => t.result === 'LOSS').length
  const wins = trades.filter((t) => t.result === 'WIN').length
  const crit = violations.filter((v) => v.severity === 'CRITICAL').length

  if (crit > 0) {
    return `Critical breach this session. ${crit} severe violation${
      crit === 1 ? '' : 's'
    } logged. Your edge is compromised — step away from the charts.`
  }
  if (violations.length >= 3) {
    return `${violations.length} violations in this session. Pattern of breakdown — review your rules.`
  }
  if (losses >= 3 && losses > wins) {
    return `${losses} losses, ${wins} wins. Sessions like this are when revenge trading kicks in. Stay grounded.`
  }
  if (wins > losses && violations.length === 0) {
    return `Clean session. ${wins} wins, ${losses} losses, zero violations. This is the standard.`
  }
  return `Active session: ${trades.length} trades, ${violations.length} violation${
    violations.length === 1 ? '' : 's'
  }. Stay sharp.`
}
