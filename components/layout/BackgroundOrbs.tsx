'use client'

import { cn } from '@/lib/utils'

interface BackgroundOrbsProps {
  tint?: 'default' | 'warning' | 'danger'
  /** When true, every orb opacity is capped at 0.06. Used for the
   *  night-sky dashboard where the background must feel near-pitch-black
   *  with only a whisper of color at the far edges. Landing / auth /
   *  mentor layouts leave this off so the orbs remain visible through
   *  the price wave backdrop. */
  dim?: boolean
}

/**
 * Four Apple-system gradient orbs that drift very slowly.
 * Normal opacities live in the 0.04–0.10 range. Pass `dim` to cap at
 * 0.06 for the authenticated dashboard where the night sky takes over.
 */
export function BackgroundOrbs({
  tint = 'default',
  dim = false,
}: BackgroundOrbsProps) {
  /* Opacity lookup — if `dim`, every value is lowered so the max
     any orb ever reaches is 0.06. These strings must be literal
     Tailwind arbitrary-value classes so Tailwind's JIT picks them up. */
  const indigo = dim
    ? tint === 'default'
      ? 'opacity-[0.06]'
      : tint === 'warning'
        ? 'opacity-[0.04]'
        : 'opacity-[0.03]'
    : tint === 'default'
      ? 'opacity-[0.10]'
      : tint === 'warning'
        ? 'opacity-[0.06]'
        : 'opacity-[0.04]'

  const green = dim
    ? tint === 'default'
      ? 'opacity-[0.04]'
      : tint === 'warning'
        ? 'opacity-[0.03]'
        : 'opacity-[0.02]'
    : tint === 'default'
      ? 'opacity-[0.07]'
      : tint === 'warning'
        ? 'opacity-[0.05]'
        : 'opacity-[0.03]'

  const blue = dim
    ? tint === 'default'
      ? 'opacity-[0.05]'
      : tint === 'warning'
        ? 'opacity-[0.03]'
        : 'opacity-[0.02]'
    : tint === 'default'
      ? 'opacity-[0.08]'
      : tint === 'warning'
        ? 'opacity-[0.05]'
        : 'opacity-[0.04]'

  const purple = dim
    ? tint === 'default'
      ? 'opacity-[0.03]'
      : tint === 'warning'
        ? 'opacity-[0.02]'
        : 'opacity-[0.02]'
    : tint === 'default'
      ? 'opacity-[0.05]'
      : tint === 'warning'
        ? 'opacity-[0.04]'
        : 'opacity-[0.03]'

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Orb 1 — Apple indigo, top-left. Main color source. */}
      <div
        className={cn(
          'absolute top-[-10%] left-[-5%] w-[900px] h-[900px] rounded-full blur-3xl animate-orb-1',
          indigo
        )}
        style={{
          background:
            'radial-gradient(circle, #5E5CE6 0%, rgba(94,92,230,0) 65%)',
        }}
      />

      {/* Orb 2 — Apple green, center-right */}
      <div
        className={cn(
          'absolute top-[30%] right-[-10%] w-[700px] h-[700px] rounded-full blur-3xl animate-orb-2',
          green
        )}
        style={{
          background:
            'radial-gradient(circle, #30D158 0%, rgba(48,209,88,0) 65%)',
        }}
      />

      {/* Orb 3 — Apple blue, bottom-left */}
      <div
        className={cn(
          'absolute bottom-[-10%] left-[10%] w-[800px] h-[800px] rounded-full blur-3xl animate-orb-3',
          blue
        )}
        style={{
          background:
            'radial-gradient(circle, #007AFF 0%, rgba(0,122,255,0) 65%)',
        }}
      />

      {/* Orb 4 — Apple purple, center. Adds chromatic variation. */}
      <div
        className={cn(
          'absolute top-[50%] left-[40%] w-[600px] h-[600px] rounded-full blur-3xl animate-orb-1',
          purple
        )}
        style={{
          background:
            'radial-gradient(circle, #BF5AF2 0%, rgba(191,90,242,0) 65%)',
          animationDelay: '-8s',
        }}
      />

      {/* Accent orb for danger/warning tints — also dimmed when `dim` is on */}
      {tint === 'danger' && (
        <div
          className={cn(
            'absolute top-[25%] left-[50%] -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-3xl animate-pulse-soft',
            dim ? 'opacity-[0.04]' : 'opacity-[0.08]'
          )}
          style={{
            background:
              'radial-gradient(circle, #FF3B30 0%, rgba(255,59,48,0) 60%)',
          }}
        />
      )}
      {tint === 'warning' && (
        <div
          className={cn(
            'absolute top-[40%] right-[20%] w-[600px] h-[600px] rounded-full blur-3xl animate-pulse-soft',
            dim ? 'opacity-[0.03]' : 'opacity-[0.06]'
          )}
          style={{
            background:
              'radial-gradient(circle, #FF9F0A 0%, rgba(255,159,10,0) 60%)',
          }}
        />
      )}
    </div>
  )
}
