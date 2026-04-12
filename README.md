# Trepid

> **Stop Overtrading. Protect Your Edge.**
>
> A real-time behavioral discipline enforcement system for forex traders.

High-fidelity working prototype. Not a mockup — every page is interactive, every rule actually fires, every violation cascades through the full 6-stage enforcement ladder.

## Quick Start

```bash
npm install
npm run dev
```

Opens on the first free port (usually http://localhost:3000 or :3001).

**Zero setup required.** No database, no auth credentials, no API keys.
All state is in Zustand + localStorage.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** with a custom glassmorphism design system
- **Framer Motion** for page transitions and overlay animations
- **React Three Fiber + Three.js** for the 3D DisciplineOrb, EnforcementRing, and ParticleField
- **Zustand** + localStorage persistence (stands in for Prisma/Postgres)
- **Mocked AI companion** — pattern-matched responses against real session state
- No backend, no auth — the spec calls for NextAuth + Prisma + Supabase + Anthropic but this build stubs those so the app runs with nothing but `npm install`.

## What's Built

### Views
1. **Landing page** — 3D particle field + animated orbs + call to action
2. **Login / Register** — glass auth cards, Google OAuth button (mocked), ParticleField background
3. **Dashboard** — 3D DisciplineOrb, 4 stat cards, enforcement ladder with 3D EnforcementRing, active rule status, live event feed, recent trades table
4. **Rules Engine** — 4 tabbed categories, 4 preset templates (Conservative, FTMO, Scalper, New Trader), per-rule enable/slider/enforcement level selector
5. **Trade Journal** — collapsible log form with emotion tagger (8 states), Win/Loss tracker, analytics strip, full history table with violation badges
6. **AI Companion** — full chat interface with session context sidebar, quick actions, typing indicator, pattern-matched responses

### Enforcement system
Every trade submission runs through `lib/enforcement-engine.ts` which escalates through **6 stages**:
| Level | Action      | Trigger |
|-------|-------------|---------|
| 0     | Clean       | No violations |
| 1     | Warning     | Soft rule breach |
| 2     | Friction    | Forces checklist gate (4 checks + 5s delay) |
| 3     | Cooldown    | Full-screen timer, blocks journal |
| 4     | Overlay     | Full-screen intervention modal (10s override delay, -15 discipline) |
| 5     | Session Lock | 3D padlock takeover, terminates session |
| 6     | Partner Alert | Escalates outside the trader (placeholder) |

### Behavior detection (`lib/behavior-detector.ts`)
Scans trades for these patterns:
- **Revenge trading** — new trade within 5 min of a loss
- **Overtrading** — >3 trades in a 30-minute window
- **Lot escalation** — lot size jump > 25% after a loss
- **Rapid re-entry** — same pair within 2 min of close
- **Loss chasing** — ≥3 losses with escalating size

### Discipline scoring (`lib/discipline-scorer.ts`)
Starts at 100, deducts:
- LOW violation: −3
- MEDIUM: −8
- HIGH: −15
- CRITICAL: −25
- Override penalty: −15

## Demo Flow

1. Open the landing page → click **Get Started**
2. Register with any email → redirects to dashboard
3. Dashboard loads with 3 seed trades, discipline 100, all rules green
4. Navigate to **Rules** — tweak the slider, click a preset
5. Back to **Dashboard** → click **Log Trade**
6. Submit a 4th trade (default rule is max 3/day)
7. **Violation overlay fires** — shows the 6-stage ladder, 10s override button, "Start Cooldown" red button
8. Click **Start Cooldown** → full-screen overlay closes, red cooldown banner appears bottom-center, the journal form shows a locked state with countdown
9. Open **Companion** (sidebar or the floating amber FAB) → type "can I trade" → it refuses with time remaining
10. Click the **Reset** button in the topbar to wipe demo state

## Project Structure

```
app/
├── layout.tsx                      root layout + global styles
├── globals.css                     design system tokens + glass utilities
├── page.tsx                        landing
├── (auth)/
│   ├── layout.tsx                  shared auth frame with orbs
│   ├── login/page.tsx
│   └── register/page.tsx
└── (dashboard)/
    ├── layout.tsx                  sidebar + topbar + all overlays
    ├── dashboard/page.tsx          main dashboard
    ├── rules/page.tsx              rule engine
    ├── journal/page.tsx            trade journal
    └── companion/page.tsx          AI companion chat

components/
├── ui/                             GlassCard, GlassButton, GlassInput, GlassModal, GlassBadge, GlassPanel, Icon
├── layout/                         Sidebar, TopBar, BackgroundOrbs
├── 3d/                             DisciplineOrb, EnforcementRing, ParticleField, ClientOnly (SSR-safe wrappers)
├── dashboard/                      SessionStats, RuleStatus, EnforcementLadder, LiveFeed
├── journal/                        TradeForm, EmotionTagger
├── companion/                      CompanionFab
└── enforcement/                    WarningOverlay, CooldownTimer, FrictionGate, SessionLock

lib/
├── store.ts                        Zustand store — orchestrates everything
├── enforcement-engine.ts           evaluate() → new state + level
├── behavior-detector.ts            pattern detection on trade history
├── discipline-scorer.ts            score math + narrative generator
├── ai-companion.ts                 mocked Claude responses
├── seed-data.ts                    default rules, trades, presets
└── utils.ts                        fmt helpers

types/index.ts                      full type system
```

## Not in this slice (deferred to next session)

The spec has 22 build steps — this session covered the **core discipline flow** (steps 1-14).
Intentionally stubbed or omitted:
- Real Prisma + Postgres backend (Zustand + localStorage stand in)
- Real NextAuth + Google OAuth (mock login accepts anything)
- Real Anthropic API (pattern-matched responses in `lib/ai-companion.ts`)
- Pusher / Supabase Realtime (local state updates suffice for single-user demo)
- Twilio SMS escalation
- Accountability partner system + Mentor dashboard
- Analytics page with Recharts
- Morning priming cron job
- Mobile bottom nav (sidebar just hides below 768px)
- Full PWA / push notifications

The architecture is ready for all of these — the type system, enforcement engine, and behavior detector are all production-shaped. Plugging in a real backend is a swap of the Zustand store with Prisma + API routes.
