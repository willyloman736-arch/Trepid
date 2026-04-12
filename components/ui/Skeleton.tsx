'use client'

import { cn } from '@/lib/utils'

/* ============================================================
   Skeleton — shimmer loading placeholder.
   Base primitive + purpose-built variants for the common
   surfaces in the app (stat card, trade row, rule card, etc).
   ============================================================ */

interface SkeletonProps {
  className?: string
  rounded?: string
}

export function Skeleton({ className, rounded = 'rounded-lg' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-white/[0.06]',
        rounded,
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}

/* --- StatCard skeleton (dashboard grid) --- */
export function StatCardSkeleton() {
  return (
    <div className="glass p-6 relative overflow-hidden">
      <div className="flex items-start justify-between mb-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-2.5 w-2.5 rounded-full" rounded="rounded-full" />
      </div>
      <Skeleton className="h-9 w-32 mb-2" />
      <Skeleton className="h-3 w-20 mb-5" />
      <Skeleton className="h-1.5 w-full rounded-full" rounded="rounded-full" />
    </div>
  )
}

/* --- Trade journal row skeleton --- */
export function TradeRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-3 py-4 border-t border-white/[0.06]">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-6 w-14 rounded-full" rounded="rounded-full" />
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-10" />
      <Skeleton className="h-4 w-12" />
      <Skeleton className="ml-auto h-4 w-16" />
      <Skeleton className="h-4 w-14" />
      <Skeleton className="h-6 w-16 rounded-full" rounded="rounded-full" />
    </div>
  )
}

/* --- Rule card skeleton (iOS Settings-style row) --- */
export function RuleCardSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <Skeleton
        className="h-9 w-9 shrink-0"
        rounded="rounded-[10px]"
      />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-4 w-12" />
      <Skeleton
        className="h-[31px] w-[50px]"
        rounded="rounded-full"
      />
    </div>
  )
}

/* --- Hero score skeleton (dashboard top card) --- */
export function HeroScoreSkeleton() {
  return (
    <div className="glass p-8 md:p-10 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-center">
        <div>
          <Skeleton className="h-3 w-32 mb-4" />
          <Skeleton className="h-24 w-56 mb-3" />
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-6" />
          <Skeleton className="h-2 w-full rounded-full" rounded="rounded-full" />
        </div>
        <div className="w-full h-[240px] lg:h-[280px] flex items-center justify-center">
          <Skeleton
            className="w-48 h-48"
            rounded="rounded-full"
          />
        </div>
      </div>
    </div>
  )
}

/* --- Chart placeholder skeleton --- */
export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="glass p-6">
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-3 w-48 mb-6" />
      <div className="flex items-end gap-2" style={{ height }}>
        {[0.3, 0.6, 0.5, 0.8, 0.4, 0.7, 0.9, 0.5, 0.6, 0.4, 0.7, 0.8].map(
          (h, i) => (
            <Skeleton
              key={i}
              className="flex-1"
              rounded="rounded-t-md"
              {...{
                // inline height since Skeleton doesn't take style
              }}
            />
          )
        )}
      </div>
    </div>
  )
}

/* --- Notification row skeleton --- */
export function NotificationRowSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4">
      <Skeleton
        className="h-8 w-8 shrink-0"
        rounded="rounded-full"
      />
      <div className="flex-1">
        <Skeleton className="h-3.5 w-40 mb-2" />
        <Skeleton className="h-3 w-56 mb-1.5" />
        <Skeleton className="h-2.5 w-20" />
      </div>
    </div>
  )
}
