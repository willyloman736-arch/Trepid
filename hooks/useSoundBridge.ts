'use client'

import { useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'
import { sounds } from '@/lib/sounds'

/* ============================================================
   useSoundBridge — subscribes to store state transitions and
   plays the right sound effect at the right moment. This is the
   single place all audio cue wiring lives. Mount once in the
   dashboard layout alongside TabTitleUpdater.

   Transitions handled:
   - trades.length increases     → tradeLogged
   - enforcement.level rises     → violation / warning (by level)
   - session.locked becomes true → sessionLocked
   - cooldownEndsAt becomes set  → cooldownStarted
   - disciplineScore hits >=80   → cleanSession (one-shot per session)
   ============================================================ */

export function useSoundBridge() {
  const tradesCount = useStore((s) => s.trades.length)
  const enforcementLevel = useStore((s) => s.enforcement.level)
  const locked = useStore((s) => s.session.locked)
  const cooldownEndsAt = useStore((s) => s.enforcement.cooldownEndsAt)
  const disciplineScore = useStore((s) => s.session.disciplineScore)

  /* Refs for transition detection (previous values) */
  const prevTrades = useRef(tradesCount)
  const prevLevel = useRef(enforcementLevel)
  const prevLocked = useRef(locked)
  const prevCooldown = useRef(cooldownEndsAt)
  const cleanFired = useRef(false)
  const initialized = useRef(false)

  useEffect(() => {
    /* Skip the very first render so seed data doesn't trigger sounds */
    if (!initialized.current) {
      initialized.current = true
      prevTrades.current = tradesCount
      prevLevel.current = enforcementLevel
      prevLocked.current = locked
      prevCooldown.current = cooldownEndsAt
      return
    }

    /* --- Trade logged --- */
    if (tradesCount > prevTrades.current) {
      sounds.tradeLogged()
    }
    prevTrades.current = tradesCount

    /* --- Enforcement level rose --- */
    if (enforcementLevel > prevLevel.current) {
      if (enforcementLevel >= 5) {
        sounds.sessionLocked()
      } else if (enforcementLevel >= 3) {
        sounds.violation()
      } else {
        sounds.warning()
      }
    }
    prevLevel.current = enforcementLevel

    /* --- Session locked (catches manual lockSession calls) --- */
    if (locked && !prevLocked.current) {
      sounds.sessionLocked()
    }
    prevLocked.current = locked

    /* --- Cooldown started --- */
    if (cooldownEndsAt && !prevCooldown.current) {
      sounds.cooldownStarted()
    }
    prevCooldown.current = cooldownEndsAt

    /* --- High discipline (one-shot per session) --- */
    if (!cleanFired.current && disciplineScore >= 80 && tradesCount >= 3) {
      // Only fire once as a quiet reward
      cleanFired.current = true
      sounds.cleanSession()
    }
    if (disciplineScore < 80) {
      cleanFired.current = false
    }
  }, [tradesCount, enforcementLevel, locked, cooldownEndsAt, disciplineScore])
}
