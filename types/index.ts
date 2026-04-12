/* ============================================================
   Trepid — shared types
   ============================================================ */

export type Role = 'TRADER' | 'MENTOR' | 'PARTNER'

export type User = {
  id: string
  email: string
  name: string
  role: Role
  createdAt: string
}

/* ---------- Rules ---------- */
export type RuleType =
  | 'MAX_TRADES_PER_DAY'
  | 'MAX_DAILY_LOSS'
  | 'MAX_RISK_PER_TRADE'
  | 'MAX_LOT_SIZE'
  | 'MAX_CONSECUTIVE_LOSSES'
  | 'ALLOWED_SESSIONS'
  | 'COOLDOWN_AFTER_LOSS'
  | 'NO_REVENGE_TRADING'
  | 'MAX_DAILY_DRAWDOWN'

export type EnforcementLevel =
  | 'WARNING'
  | 'FRICTION'
  | 'COOLDOWN'
  | 'OVERLAY'
  | 'LOCK'
  | 'ALERT'

export type RuleCategory = 'position' | 'session' | 'loss' | 'behavior'

export type Rule = {
  id: string
  name: string
  type: RuleType
  value: number
  unit?: string
  enabled: boolean
  enforcement: EnforcementLevel
  category: RuleCategory
  description: string
}

/* ---------- Trades ---------- */
export type TradeDirection = 'LONG' | 'SHORT'
export type TradeResult = 'WIN' | 'LOSS' | 'BREAKEVEN'
export type TradeSession = 'LONDON' | 'NY' | 'ASIAN' | 'OVERLAP'

export type Emotion =
  | 'NEUTRAL'
  | 'CONFIDENT'
  | 'FOMO'
  | 'REVENGE'
  | 'FEAR'
  | 'BOREDOM'
  | 'GREEDY'
  | 'FRUSTRATED'

export type Trade = {
  id: string
  pair: string
  direction: TradeDirection
  entryPrice: number
  exitPrice?: number
  stopLoss?: number
  takeProfit?: number
  lotSize: number
  session: TradeSession
  result?: TradeResult
  pnl: number
  emotion: Emotion
  note?: string
  ruleViolations: string[]
  openedAt: string
  closedAt?: string
}

/* ---------- Violations ---------- */
export type ViolationType =
  | 'MAX_TRADES_EXCEEDED'
  | 'DAILY_LOSS_EXCEEDED'
  | 'REVENGE_TRADING'
  | 'OVERTRADING'
  | 'LOT_SIZE_ESCALATION'
  | 'LOSS_STREAK'
  | 'SESSION_VIOLATION'
  | 'RULE_BYPASS_ATTEMPT'

export type ViolationSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type Violation = {
  id: string
  sessionId: string
  ruleId?: string
  type: ViolationType
  severity: ViolationSeverity
  description: string
  enforcementApplied: EnforcementLevel
  mentorNotified: boolean
  createdAt: string
}

/* ---------- Session ---------- */
export type SessionStatus = 'ACTIVE' | 'LOCKED' | 'COMPLETED'

export type TradingSession = {
  id: string
  startedAt: string
  endedAt?: string
  status: SessionStatus
  disciplineScore: number
  totalPnl: number
  totalTrades: number
  totalViolations: number
  enforcementLevel: number
  locked: boolean
  cooldownEndsAt?: string | null
  summary?: string
}

/* ---------- Enforcement ---------- */
export type EnforcementState = {
  level: number
  locked: boolean
  cooldownEndsAt: string | null
  message: string
  action: 'none' | 'warn' | 'friction' | 'cooldown' | 'overlay' | 'lock' | 'alert'
  lastViolationType?: ViolationType
}

export type SessionSnapshot = {
  tradesCount: number
  dailyLoss: number
  dailyPnl: number
  lossStreak: number
  violations: number
  rulesBroken: string[]
  recentTrades: Trade[]
}

/* ---------- Behavior ---------- */
export type BehaviorFlagType =
  | 'REVENGE_TRADING'
  | 'OVERTRADING'
  | 'LOT_ESCALATION'
  | 'RAPID_REENTRY'
  | 'SESSION_BREACH'
  | 'LOSS_CHASING'

export type BehaviorFlag = {
  type: BehaviorFlagType
  confidence: number
  description: string
  tradeIds: string[]
}

/* ---------- Chat ---------- */
export type ChatMessage = {
  id: string
  from: 'user' | 'bot'
  text: string
  timestamp: string
}

/* ---------- Accountability ---------- */
export type LinkStatus = 'PENDING' | 'ACTIVE' | 'REVOKED'
export type PartnerRole = 'MENTOR' | 'PARTNER'

export type PartnerPermissions = {
  viewScore: boolean
  viewViolations: boolean
  viewTradeCount: boolean
  viewPnl: boolean
  receiveAlerts: boolean
}

export type AccountabilityLink = {
  id: string
  partnerEmail: string
  partnerName: string
  role: PartnerRole
  status: LinkStatus
  permissions: PartnerPermissions
  createdAt: string
  acceptedAt?: string
  lastNotifiedAt?: string
  lastAlertReason?: string
}

/* ---------- Notifications ---------- */
export type NotificationChannel = 'IN_APP' | 'PUSH' | 'SMS'

export type NotificationRecord = {
  id: string
  title: string
  message: string
  tone: 'info' | 'success' | 'warning' | 'danger'
  channel: NotificationChannel
  read: boolean
  timestamp: string
}

export type NotificationSettings = {
  inApp: boolean
  push: boolean
  sms: boolean
  smsPhone: string
  notifyStage: number
  dailySummary: boolean
  morningPriming: boolean
}

/* ---------- Mentor dashboard ---------- */
export type StudentSummary = {
  id: string
  name: string
  email: string
  disciplineScore: number
  tradesToday: number
  maxTrades: number
  violations: number
  lossStreak: number
  enforcementLevel: number
  status: 'DISCIPLINED' | 'AT_RISK' | 'CRITICAL'
  lastAlertAt?: string
  recentViolation?: string
}
