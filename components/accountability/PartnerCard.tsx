'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassBadge } from '@/components/ui/GlassBadge'
import type { AccountabilityLink } from '@/types'
import { cn } from '@/lib/utils'

interface PartnerCardProps {
  partner: AccountabilityLink
  onRevoke: (id: string) => void
  onAccept: (id: string) => void
  onSelect?: (id: string) => void
  selected?: boolean
  index?: number
}

export function PartnerCard({
  partner,
  onRevoke,
  onAccept,
  onSelect,
  selected,
  index = 0,
}: PartnerCardProps) {
  const initials = partner.partnerName
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  const statusTone =
    partner.status === 'ACTIVE'
      ? 'success'
      : partner.status === 'PENDING'
        ? 'warning'
        : 'danger'

  const permissionCount = Object.values(partner.permissions).filter(Boolean).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard
        padding="p-5"
        glow={selected ? 'accent' : 'none'}
        className={cn(
          'h-full cursor-pointer',
          partner.status === 'REVOKED' && 'opacity-50'
        )}
        onClick={() => onSelect?.(partner.id)}
      >
        <div className="flex items-start gap-4 mb-4">
          <div
            className={cn(
              'w-12 h-12 rounded-[14px] grid place-items-center font-bold text-[16px] shrink-0',
              partner.role === 'MENTOR'
                ? 'bg-accent/12 text-accent'
                : 'bg-success/15 text-success'
            )}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-headline text-label truncate">
              {partner.partnerName}
            </h3>
            <p className="text-[12px] text-label-tertiary truncate">
              {partner.partnerEmail}
            </p>
          </div>
          <GlassBadge tone={partner.role === 'MENTOR' ? 'accent' : 'slate'}>
            {partner.role}
          </GlassBadge>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <GlassBadge tone={statusTone} pulse={partner.status === 'ACTIVE'}>
            {partner.status}
          </GlassBadge>
          <span className="text-[12px] text-label-tertiary font-medium">
            {permissionCount} permission{permissionCount === 1 ? '' : 's'}
          </span>
        </div>

        {partner.lastNotifiedAt && (
          <div className="rounded-[12px] bg-danger/8 p-3 mb-4">
            <p className="text-[11px] font-semibold text-danger mb-1">
              Last Alert Sent
            </p>
            <p className="text-[12px] text-label-secondary leading-snug">
              {partner.lastAlertReason || 'Violation escalated'}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-white/[0.08]">
          {partner.status === 'PENDING' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAccept(partner.id)
              }}
              className="flex-1 text-[13px] font-semibold py-2 rounded-[10px] bg-success/15 text-success hover:bg-success/22 transition-colors"
            >
              Accept
            </button>
          )}
          {partner.status !== 'REVOKED' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRevoke(partner.id)
              }}
              className="flex-1 text-[13px] font-semibold py-2 rounded-[10px] bg-danger/10 text-danger hover:bg-danger/15 transition-colors"
            >
              Revoke
            </button>
          )}
        </div>
      </GlassCard>
    </motion.div>
  )
}
