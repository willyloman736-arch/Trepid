'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  AccountabilityLink,
  EnforcementState,
  NotificationRecord,
  NotificationSettings,
  PartnerPermissions,
  PartnerRole,
  Rule,
  Role,
  StudentSummary,
  Trade,
  TradingSession,
  User,
  Violation,
  ChatMessage,
} from '@/types'
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_RULES,
  DEFAULT_USER,
  MOCK_STUDENTS,
  SEED_PARTNERS,
  SEED_TRADES,
} from './seed-data'
import { evaluateEnforcement } from './enforcement-engine'
import {
  calculateDisciplineScore,
  severityFromLevel,
} from './discipline-scorer'
import { uid, fmtTime } from './utils'
import { detectBehaviorPatterns } from './behavior-detector'

/* ============================================================
   Trepid global store (Zustand + localStorage)
   ============================================================ */

type AddTradeInput = {
  pair: string
  direction: Trade['direction']
  entryPrice: number
  exitPrice?: number
  stopLoss?: number
  takeProfit?: number
  lotSize: number
  session: Trade['session']
  result?: Trade['result']
  pnl: number
  emotion: Trade['emotion']
  note?: string
}

type AddTradeResult = {
  trade: Trade
  violated: boolean
  newLevel: number
  reason: string
}

interface Store {
  /* auth */
  user: User | null
  authenticated: boolean
  login: (email: string, name?: string) => void
  logout: () => void

  /* rules */
  rules: Rule[]
  updateRule: (id: string, patch: Partial<Rule>) => void
  applyPreset: (overrides: Record<string, number>) => void
  resetRules: () => void

  /* trades + session */
  trades: Trade[]
  session: TradingSession
  addTrade: (input: AddTradeInput) => AddTradeResult
  clearTrades: () => void

  /* violations */
  violations: Violation[]

  /* enforcement state */
  enforcement: EnforcementState
  startCooldown: (minutes: number) => void
  overrideViolation: () => void
  lockSession: (reason: string) => void
  unlockSession: () => void
  tickCooldown: () => void

  /* accountability */
  partners: AccountabilityLink[]
  addPartner: (input: {
    email: string
    name: string
    role: PartnerRole
    permissions: PartnerPermissions
  }) => void
  removePartner: (id: string) => void
  updatePartner: (id: string, patch: Partial<AccountabilityLink>) => void
  acceptPartner: (id: string) => void

  /* mentor */
  viewAsRole: Role
  setViewAsRole: (role: Role) => void
  mockStudents: StudentSummary[]

  /* notifications */
  notifications: NotificationRecord[]
  notificationSettings: NotificationSettings
  pushNotification: (n: Omit<NotificationRecord, 'id' | 'timestamp' | 'read'>) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
  updateNotificationSettings: (patch: Partial<NotificationSettings>) => void

  /* UI state */
  showViolationOverlay: boolean
  pendingViolationReason: string | null
  showFrictionGate: boolean
  setShowViolationOverlay: (open: boolean) => void
  setShowFrictionGate: (open: boolean) => void

  /* chat */
  chatMessages: ChatMessage[]
  appendChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearChat: () => void

  /* system reset */
  resetDemo: () => void
}

const INITIAL_ENFORCEMENT: EnforcementState = {
  level: 0,
  locked: false,
  cooldownEndsAt: null,
  message: 'All rules respected. Keep your edge.',
  action: 'none',
}

function freshSession(): TradingSession {
  return {
    id: uid(),
    startedAt: new Date().toISOString(),
    status: 'ACTIVE',
    disciplineScore: 100,
    totalPnl: 0,
    totalTrades: 0,
    totalViolations: 0,
    enforcementLevel: 0,
    locked: false,
    cooldownEndsAt: null,
  }
}

function initialChatMessages(): ChatMessage[] {
  return [
    {
      id: uid(),
      from: 'bot',
      text: "I'm your Trepid companion. I see every trade, every rule, every violation.",
      timestamp: new Date().toISOString(),
    },
    {
      id: uid(),
      from: 'bot',
      text: 'Ask me: "can I trade", "how many trades", "am I overtrading", "score", or "what did I do wrong".',
      timestamp: new Date().toISOString(),
    },
  ]
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      /* ============================================================
         Auth
         ============================================================ */
      user: null,
      authenticated: false,
      login: (email, name) => {
        set({
          user: {
            ...DEFAULT_USER,
            email,
            name: name || email.split('@')[0],
          },
          authenticated: true,
        })
      },
      logout: () => {
        set({ authenticated: false })
      },

      /* ============================================================
         Rules
         ============================================================ */
      rules: DEFAULT_RULES,
      updateRule: (id, patch) =>
        set((s) => ({
          rules: s.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      applyPreset: (overrides) =>
        set((s) => ({
          rules: s.rules.map((r) => {
            const next = overrides[r.type]
            return next !== undefined ? { ...r, value: next, enabled: true } : r
          }),
        })),
      resetRules: () => set({ rules: DEFAULT_RULES }),

      /* ============================================================
         Trades
         ============================================================ */
      trades: SEED_TRADES,
      session: {
        ...freshSession(),
        totalTrades: SEED_TRADES.length,
        totalPnl: SEED_TRADES.reduce((a, t) => a + t.pnl, 0),
      },
      violations: [],
      enforcement: INITIAL_ENFORCEMENT,

      addTrade: (input) => {
        const state = get()
        const now = new Date()
        const openedAt = now.toISOString()

        const newTrade: Trade = {
          id: uid(),
          pair: input.pair,
          direction: input.direction,
          entryPrice: input.entryPrice,
          exitPrice: input.exitPrice,
          stopLoss: input.stopLoss,
          takeProfit: input.takeProfit,
          lotSize: input.lotSize,
          session: input.session,
          result: input.result,
          pnl: input.pnl,
          emotion: input.emotion,
          note: input.note,
          ruleViolations: [],
          openedAt,
          closedAt: input.result ? openedAt : undefined,
        }

        const nextTrades = [newTrade, ...state.trades]
        const dailyPnl = nextTrades.reduce((a, t) => a + t.pnl, 0)
        const dailyLoss = Math.max(
          0,
          -nextTrades.filter((t) => t.pnl < 0).reduce((a, t) => a + t.pnl, 0)
        )

        // Loss streak from most recent trades backwards
        let lossStreak = 0
        for (const t of nextTrades) {
          if (t.result === 'LOSS') lossStreak++
          else break
        }

        const snapshot = {
          tradesCount: nextTrades.length,
          dailyLoss,
          dailyPnl,
          lossStreak,
          violations: state.violations.length,
          rulesBroken: [],
          recentTrades: nextTrades.slice(0, 10),
        }

        const evaluation = evaluateEnforcement(
          snapshot,
          state.rules,
          state.enforcement.level
        )

        // Tag the trade with any rule violations
        if (evaluation.triggeredRules.length > 0) {
          newTrade.ruleViolations = evaluation.triggeredRules
        }

        // Build violation record if new one triggered
        const nextViolations = [...state.violations]
        if (evaluation.violationType && evaluation.state.level > state.enforcement.level) {
          nextViolations.unshift({
            id: uid(),
            sessionId: state.session.id,
            type: evaluation.violationType,
            severity: severityFromLevel(evaluation.state.level),
            description: evaluation.reason,
            enforcementApplied: levelToEnforcementLabel(evaluation.state.level),
            mentorNotified: evaluation.state.level >= 5,
            createdAt: openedAt,
            ruleId: evaluation.triggeredRules[0],
          })
        }

        const disciplineScore = calculateDisciplineScore(
          nextTrades,
          nextViolations
        )

        set({
          trades: nextTrades,
          violations: nextViolations,
          enforcement: evaluation.state,
          session: {
            ...state.session,
            totalTrades: nextTrades.length,
            totalPnl: dailyPnl,
            totalViolations: nextViolations.length,
            enforcementLevel: evaluation.state.level,
            disciplineScore,
            locked: evaluation.state.locked,
            cooldownEndsAt: evaluation.state.cooldownEndsAt,
            status: evaluation.state.locked ? 'LOCKED' : 'ACTIVE',
          },
          showViolationOverlay:
            evaluation.state.level >= 4 &&
            evaluation.state.level > state.enforcement.level,
        })

        // Generate a companion message on violation
        if (
          evaluation.violationType &&
          evaluation.state.level > state.enforcement.level
        ) {
          get().appendChatMessage({
            from: 'bot',
            text: `⚠ ${evaluation.reason} Stop. Re-center. Review your rules.`,
          })

          // Push notification for the violation
          const tone =
            evaluation.state.level >= 5
              ? 'danger'
              : evaluation.state.level >= 3
                ? 'warning'
                : 'info'
          get().pushNotification({
            title: `Level ${evaluation.state.level} violation`,
            message: evaluation.reason,
            tone,
            channel: 'IN_APP',
          })

          // If level 5+, notify accountability partners
          if (evaluation.state.level >= 5) {
            const partners = get().partners.filter(
              (p) => p.status === 'ACTIVE' && p.permissions.receiveAlerts
            )
            partners.forEach((p) => {
              get().updatePartner(p.id, {
                lastNotifiedAt: new Date().toISOString(),
                lastAlertReason: evaluation.reason,
              })
            })
            if (partners.length > 0) {
              get().pushNotification({
                title: `${partners.length} partner${partners.length === 1 ? '' : 's'} notified`,
                message: `Alert escalated to your accountability network.`,
                tone: 'danger',
                channel: 'PUSH',
              })
            }
          }
        }

        return {
          trade: newTrade,
          violated: evaluation.triggeredRules.length > 0,
          newLevel: evaluation.state.level,
          reason: evaluation.reason,
        }
      },

      clearTrades: () => set({ trades: [] }),

      /* ============================================================
         Enforcement actions
         ============================================================ */
      startCooldown: (minutes) => {
        const end = new Date(Date.now() + minutes * 60 * 1000).toISOString()
        set((s) => ({
          enforcement: {
            ...s.enforcement,
            level: 3,
            action: 'cooldown',
            cooldownEndsAt: end,
            message: `Cooldown for ${minutes} minutes. Step away.`,
          },
          session: {
            ...s.session,
            cooldownEndsAt: end,
            enforcementLevel: Math.max(3, s.session.enforcementLevel),
          },
          showViolationOverlay: false,
        }))
      },

      overrideViolation: () => {
        const s = get()
        set({
          showViolationOverlay: false,
          // Apply discipline penalty for override
          session: {
            ...s.session,
            disciplineScore: Math.max(0, s.session.disciplineScore - 15),
          },
          violations: [
            {
              id: uid(),
              sessionId: s.session.id,
              type: 'RULE_BYPASS_ATTEMPT',
              severity: 'HIGH',
              description:
                'Trader bypassed enforcement overlay. -15 discipline.',
              enforcementApplied: 'WARNING',
              mentorNotified: false,
              createdAt: new Date().toISOString(),
            },
            ...s.violations,
          ],
        })
        get().appendChatMessage({
          from: 'bot',
          text: 'Override accepted. -15 discipline. Ownership of this trade is fully on you.',
        })
      },

      lockSession: (reason) => {
        set((s) => ({
          enforcement: {
            ...s.enforcement,
            level: 5,
            locked: true,
            action: 'lock',
            message: reason,
          },
          session: {
            ...s.session,
            locked: true,
            status: 'LOCKED',
            enforcementLevel: 5,
          },
          showViolationOverlay: true,
        }))
      },

      unlockSession: () => {
        set((s) => ({
          enforcement: INITIAL_ENFORCEMENT,
          session: {
            ...s.session,
            locked: false,
            status: 'ACTIVE',
            enforcementLevel: 0,
            cooldownEndsAt: null,
          },
          showViolationOverlay: false,
        }))
      },

      tickCooldown: () => {
        const s = get()
        if (!s.enforcement.cooldownEndsAt) return
        const remaining =
          new Date(s.enforcement.cooldownEndsAt).getTime() - Date.now()
        if (remaining <= 0) {
          set({
            enforcement: INITIAL_ENFORCEMENT,
            session: {
              ...s.session,
              cooldownEndsAt: null,
              enforcementLevel: 0,
            },
          })
        }
      },

      /* ============================================================
         UI flags
         ============================================================ */
      showViolationOverlay: false,
      pendingViolationReason: null,
      showFrictionGate: false,
      setShowViolationOverlay: (open) => set({ showViolationOverlay: open }),
      setShowFrictionGate: (open) => set({ showFrictionGate: open }),

      /* ============================================================
         Accountability / partners
         ============================================================ */
      partners: SEED_PARTNERS,
      addPartner: ({ email, name, role, permissions }) =>
        set((s) => ({
          partners: [
            {
              id: uid(),
              partnerEmail: email,
              partnerName: name,
              role,
              status: 'PENDING',
              permissions,
              createdAt: new Date().toISOString(),
            },
            ...s.partners,
          ],
        })),
      removePartner: (id) =>
        set((s) => ({
          partners: s.partners.map((p) =>
            p.id === id ? { ...p, status: 'REVOKED' as const } : p
          ),
        })),
      updatePartner: (id, patch) =>
        set((s) => ({
          partners: s.partners.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      acceptPartner: (id) =>
        set((s) => ({
          partners: s.partners.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: 'ACTIVE' as const,
                  acceptedAt: new Date().toISOString(),
                }
              : p
          ),
        })),

      /* ============================================================
         Role switching + mentor
         ============================================================ */
      viewAsRole: 'TRADER',
      setViewAsRole: (role) => set({ viewAsRole: role }),
      mockStudents: MOCK_STUDENTS,

      /* ============================================================
         Notifications
         ============================================================ */
      notifications: [],
      notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
      pushNotification: (n) =>
        set((s) => ({
          notifications: [
            {
              ...n,
              id: uid(),
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...s.notifications,
          ].slice(0, 50),
        })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      clearNotifications: () => set({ notifications: [] }),
      updateNotificationSettings: (patch) =>
        set((s) => ({
          notificationSettings: { ...s.notificationSettings, ...patch },
        })),

      /* ============================================================
         Chat
         ============================================================ */
      chatMessages: initialChatMessages(),
      appendChatMessage: (msg) =>
        set((s) => ({
          chatMessages: [
            ...s.chatMessages,
            { ...msg, id: uid(), timestamp: new Date().toISOString() },
          ],
        })),
      clearChat: () => set({ chatMessages: initialChatMessages() }),

      /* ============================================================
         Reset
         ============================================================ */
      resetDemo: () => {
        const s = get()
        set({
          rules: DEFAULT_RULES,
          trades: SEED_TRADES,
          violations: [],
          enforcement: INITIAL_ENFORCEMENT,
          session: {
            ...freshSession(),
            totalTrades: SEED_TRADES.length,
            totalPnl: SEED_TRADES.reduce((a, t) => a + t.pnl, 0),
          },
          showViolationOverlay: false,
          showFrictionGate: false,
          chatMessages: initialChatMessages(),
          // preserve auth
          user: s.user,
          authenticated: s.authenticated,
        })
      },
    }),
    {
      name: 'trepid-store-v1',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return window.localStorage
      }),
      partialize: (s) => ({
        user: s.user,
        authenticated: s.authenticated,
        rules: s.rules,
        trades: s.trades,
        violations: s.violations,
        session: s.session,
        enforcement: s.enforcement,
        chatMessages: s.chatMessages,
        partners: s.partners,
        viewAsRole: s.viewAsRole,
        notifications: s.notifications,
        notificationSettings: s.notificationSettings,
      }),
    }
  )
)

function levelToEnforcementLabel(level: number) {
  switch (level) {
    case 1:
      return 'WARNING' as const
    case 2:
      return 'FRICTION' as const
    case 3:
      return 'COOLDOWN' as const
    case 4:
      return 'OVERLAY' as const
    case 5:
      return 'LOCK' as const
    case 6:
      return 'ALERT' as const
    default:
      return 'WARNING' as const
  }
}

/* ---------- Derived selectors ---------- */

export const useSnapshot = () => {
  const trades = useStore((s) => s.trades)
  const violations = useStore((s) => s.violations)
  const rules = useStore((s) => s.rules)
  const session = useStore((s) => s.session)
  const enforcement = useStore((s) => s.enforcement)

  const wins = trades.filter((t) => t.result === 'WIN').length
  const losses = trades.filter((t) => t.result === 'LOSS').length
  const totalPnl = trades.reduce((a, t) => a + t.pnl, 0)
  const dailyLoss = -trades
    .filter((t) => t.pnl < 0)
    .reduce((a, t) => a + t.pnl, 0)
  const winRate = trades.length
    ? Math.round((wins / trades.length) * 100)
    : 0
  let lossStreak = 0
  for (const t of trades) {
    if (t.result === 'LOSS') lossStreak++
    else break
  }

  return {
    trades,
    violations,
    rules,
    session,
    enforcement,
    wins,
    losses,
    totalPnl,
    dailyLoss,
    winRate,
    lossStreak,
    tradesCount: trades.length,
  }
}

/* used by companion */
export { detectBehaviorPatterns }
