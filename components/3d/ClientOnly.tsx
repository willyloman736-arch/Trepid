'use client'

import dynamic from 'next/dynamic'

/**
 * SSR-safe dynamic imports for 3D components.
 * React Three Fiber needs DOM + WebGL so these must be client-only.
 */

export const DisciplineOrb = dynamic(
  () => import('./DisciplineOrb').then((m) => m.DisciplineOrb),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full grid place-items-center">
        <div className="w-24 h-24 rounded-full bg-white/5 animate-pulse" />
      </div>
    ),
  }
)

export const EnforcementRing = dynamic(
  () => import('./EnforcementRing').then((m) => m.EnforcementRing),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full grid place-items-center">
        <div className="w-20 h-20 rounded-full border border-white/10" />
      </div>
    ),
  }
)

export const ParticleField = dynamic(
  () => import('./ParticleField').then((m) => m.ParticleField),
  {
    ssr: false,
    loading: () => null,
  }
)

export const AccountabilityGraph = dynamic(
  () => import('./AccountabilityGraph').then((m) => m.AccountabilityGraph),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full grid place-items-center">
        <div className="w-32 h-32 rounded-full border border-white/10 animate-pulse" />
      </div>
    ),
  }
)
