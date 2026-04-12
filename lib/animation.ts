/* ============================================================
   Trepid — shared animation configuration
   Apple-spec spring curves + eases + page transition preset.
   Import from any component to keep motion consistent.
   ============================================================ */

import type { Transition, Variants } from 'framer-motion'

/* --- Spring presets --- */
export const spring = {
  snappy: { type: 'spring', stiffness: 500, damping: 35 } as Transition,
  smooth: { type: 'spring', stiffness: 300, damping: 30 } as Transition,
  gentle: { type: 'spring', stiffness: 200, damping: 25 } as Transition,
  bouncy: { type: 'spring', stiffness: 400, damping: 20 } as Transition,
}

/* --- Bezier eases (Apple-calibrated) --- */
export const ease = {
  appleIn: [0.25, 0.46, 0.45, 0.94] as const,
  appleOut: [0.16, 1, 0.3, 1] as const,
  appleInOut: [0.45, 0, 0.55, 1] as const,
}

/* --- Page transition preset (wrap every page component) --- */
export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: ease.appleOut },
}

/* --- Stagger container — pass to parent with children that use pageTransition --- */
export const stagger = (delay = 0.05) => ({
  animate: { transition: { staggerChildren: delay } },
})

/* --- Button haptic variants --- */
export const buttonVariants: Variants = {
  idle: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
  tap: {
    scale: 0.96,
    transition: { type: 'spring', stiffness: 600, damping: 20 },
  },
}

/* --- Card haptic variants --- */
export const cardVariants: Variants = {
  idle: {
    y: 0,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  hover: {
    y: -3,
    boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
}

/* --- Violation shake (x oscillation) --- */
export const violationShake: Variants = {
  shake: {
    x: [0, -6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
}

/* --- Modal / overlay presets --- */
export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.97, y: 4, transition: { duration: 0.15 } },
}

/* --- Slide-from-right panel (notification center) --- */
export const slidePanelVariants: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 400, damping: 32 },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.25, ease: ease.appleIn },
  },
}
