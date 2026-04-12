'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'

/* ============================================================
   TabTitleUpdater — live browser tab title ticker.
   Reflects discipline score + enforcement state as an ambient
   status indicator visible even when the app is backgrounded.
   Mount once inside the dashboard layout.
   ============================================================ */

const DEFAULT_TITLE = 'Trepid — Discipline Engine'

export function TabTitleUpdater() {
  const disciplineScore = useStore((s) => s.session.disciplineScore)
  const enforcementLevel = useStore((s) => s.enforcement.level)
  const locked = useStore((s) => s.session.locked)

  useEffect(() => {
    if (typeof document === 'undefined') return

    if (locked) {
      document.title = '🔴 LOCKED — Trepid'
      return
    }
    if (enforcementLevel >= 4) {
      document.title = `⚠ ${disciplineScore} — Trepid`
      return
    }
    if (disciplineScore >= 80) {
      document.title = `● ${disciplineScore} — Trepid`
    } else if (disciplineScore >= 50) {
      document.title = `◐ ${disciplineScore} — Trepid`
    } else {
      document.title = `○ ${disciplineScore} — Trepid`
    }
  }, [disciplineScore, enforcementLevel, locked])

  /* Reset to default title on unmount (when leaving dashboard routes) */
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.title = DEFAULT_TITLE
      }
    }
  }, [])

  return null
}
