import type { Trade, Rule, Violation, TradingSession, EnforcementState } from '@/types'
import { fmtClock, fmtMoney } from './utils'
import { detectBehaviorPatterns } from './behavior-detector'
import { generateBehavioralNarrative } from './discipline-scorer'

type StoreState = {
  trades: Trade[]
  rules: Rule[]
  violations: Violation[]
  session: TradingSession
  enforcement: EnforcementState
}

/**
 * Mocked AI companion. In a real build this would call Anthropic API
 * with the system prompt defined in the spec. For the local prototype,
 * it pattern-matches against session data to produce firm, data-driven
 * responses.
 */
export function respondToMessage(message: string, state: StoreState): string {
  const text = message.toLowerCase().trim()
  const { trades, rules, violations, session, enforcement } = state

  const maxTradesRule = rules.find((r) => r.type === 'MAX_TRADES_PER_DAY')
  const maxLossRule = rules.find((r) => r.type === 'MAX_DAILY_LOSS')
  const maxTrades = maxTradesRule?.value ?? 3
  const maxLoss = maxLossRule?.value ?? 300

  const wins = trades.filter((t) => t.result === 'WIN').length
  const losses = trades.filter((t) => t.result === 'LOSS').length
  const pnl = trades.reduce((a, t) => a + t.pnl, 0)
  const dailyLoss = -trades
    .filter((t) => t.pnl < 0)
    .reduce((a, t) => a + t.pnl, 0)

  const cooldownRemaining = enforcement.cooldownEndsAt
    ? Math.max(
        0,
        Math.floor(
          (new Date(enforcement.cooldownEndsAt).getTime() - Date.now()) / 1000
        )
      )
    : 0

  // ---- Can I trade? ----
  if (/can i trade|should i trade|trade now|ok to trade/.test(text)) {
    if (session.locked) {
      return 'No. Session is locked. You are done for the day.'
    }
    if (cooldownRemaining > 0) {
      return `No. Cooldown active for ${fmtClock(cooldownRemaining)}. Step away from the screen.`
    }
    if (trades.length >= maxTrades) {
      return `No. You've hit the ${maxTrades}-trade daily cap. No more trades today.`
    }
    if (dailyLoss > maxLoss * 0.8) {
      return `You are ${Math.round((dailyLoss / maxLoss) * 100)}% into your daily loss cap. One more loss and you're done. Skip it.`
    }
    return `Yes. You have ${maxTrades - trades.length} trade${maxTrades - trades.length === 1 ? '' : 's'} left in your daily cap. Only take a valid setup.`
  }

  // ---- How many trades ----
  if (/how many trades|trade count|trades today/.test(text)) {
    return `You've taken ${trades.length} trade${trades.length === 1 ? '' : 's'}. ${maxTrades - trades.length} remaining in your cap.`
  }

  // ---- Am I overtrading ----
  if (/overtrading|too many trades|trading too much/.test(text)) {
    const flags = detectBehaviorPatterns(trades)
    const overtrading = flags.find((f) => f.type === 'OVERTRADING')
    if (overtrading) {
      return `Yes. ${overtrading.description} That's ${Math.round(overtrading.confidence * 100)}% confidence.`
    }
    if (trades.length >= maxTrades * 0.75) {
      return `You're close to your cap (${trades.length}/${maxTrades}). Slow down.`
    }
    return `Not yet. ${trades.length}/${maxTrades} trades, no rapid-fire pattern detected. Stay disciplined.`
  }

  // ---- Revenge trading ----
  if (/revenge/.test(text)) {
    const flags = detectBehaviorPatterns(trades)
    const revenge = flags.filter(
      (f) => f.type === 'REVENGE_TRADING' || f.type === 'LOT_ESCALATION'
    )
    if (revenge.length > 0) {
      return `Yes. ${revenge.length} revenge pattern${revenge.length === 1 ? '' : 's'} detected. ${revenge[0].description}`
    }
    return 'No revenge pattern detected. Keep your post-loss discipline.'
  }

  // ---- Cooldown ----
  if (/cooldown/.test(text)) {
    if (cooldownRemaining <= 0) {
      return 'No cooldown active right now. You are free to operate within your rules.'
    }
    return `Cooldown active. ${fmtClock(cooldownRemaining)} remaining. Stay off the charts.`
  }

  // ---- Score / discipline ----
  if (/score|discipline/.test(text)) {
    const s = session.disciplineScore
    const verdict =
      s >= 80
        ? "You're disciplined. Maintain it."
        : s >= 50
          ? "You're on thin ice. Next violation brings a cooldown."
          : "Your discipline is critical. Stop trading."
    return `Discipline score: ${s}/100. ${verdict}`
  }

  // ---- What did I do wrong / summary / review ----
  if (/what did i do wrong|review|summary|narrative/.test(text)) {
    return generateBehavioralNarrative(trades, violations)
  }

  // ---- PNL ----
  if (/p&?l|profit|loss|how am i doing/.test(text)) {
    return `Net P&L today: ${fmtMoney(pnl)}. Wins ${wins}, losses ${losses}. Daily loss exposure: ${fmtMoney(-dailyLoss)}.`
  }

  // ---- Rules ----
  if (/what.*rule|rule.*set|show.*rule|active rule/.test(text)) {
    const enabled = rules.filter((r) => r.enabled)
    return `${enabled.length} rules active: max ${maxTrades} trades, max $${maxLoss} daily loss, ${rules.find((r) => r.type === 'MAX_CONSECUTIVE_LOSSES')?.value ?? 2} loss streak limit. View the Rules page for more.`
  }

  // ---- Violations ----
  if (/violation/.test(text)) {
    if (violations.length === 0) return 'Zero violations. Clean session.'
    return `${violations.length} violation${violations.length === 1 ? '' : 's'} logged today. Most recent: ${violations[0].description}`
  }

  // ---- Close session ----
  if (/close.*session|end.*session|lock.*session/.test(text)) {
    return 'If you want to lock your session, click the red lock button on the dashboard. Session lock is final until reset.'
  }

  // ---- Greetings ----
  if (/^(hi|hello|hey|yo|sup)/.test(text)) {
    return 'Hey. How can I protect your edge?'
  }

  // ---- Help / tips ----
  if (/tip|help|advice/.test(text)) {
    return "The best trade is often the one you didn't take. Quality over quantity. Patience is an edge."
  }

  // ---- Thank you ----
  if (/thanks|thank you|thx/.test(text)) {
    return 'Stay sharp. The edge belongs to the disciplined.'
  }

  // ---- Default ----
  return 'I understand questions about: trading status, trade count, overtrading, cooldown, discipline score, violations, rules, and behavior analysis. What do you need?'
}
