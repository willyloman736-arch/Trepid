'use client'

import { useState } from 'react'
import { GlassModal } from '@/components/ui/GlassModal'
import { GlassButton } from '@/components/ui/GlassButton'
import { GlassInput } from '@/components/ui/GlassInput'
import { Icon } from '@/components/ui/Icon'
import { useStore } from '@/lib/store'
import type { PartnerPermissions, PartnerRole } from '@/types'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface LinkPartnerModalProps {
  open: boolean
  onClose: () => void
}

const PERMISSION_LABELS: Record<
  keyof PartnerPermissions,
  { label: string; desc: string }
> = {
  viewScore: { label: 'View discipline score', desc: 'See the numeric score' },
  viewViolations: { label: 'View violations', desc: 'See rule breach list' },
  viewTradeCount: { label: 'View trade count', desc: 'Count only — no details' },
  viewPnl: { label: 'View P&L', desc: 'Session profit/loss' },
  receiveAlerts: {
    label: 'Receive escalation alerts',
    desc: 'Get notified on stage 5+',
  },
}

export function LinkPartnerModal({ open, onClose }: LinkPartnerModalProps) {
  const addPartner = useStore((s) => s.addPartner)
  const pushNotification = useStore((s) => s.pushNotification)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<PartnerRole>('MENTOR')
  const [permissions, setPermissions] = useState<PartnerPermissions>({
    viewScore: true,
    viewViolations: true,
    viewTradeCount: true,
    viewPnl: false,
    receiveAlerts: true,
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    addPartner({ email, name: name || email.split('@')[0], role, permissions })
    pushNotification({
      title: 'Invitation sent',
      message: `${name || email} will receive a link to accept accountability.`,
      tone: 'success',
      channel: 'IN_APP',
    })
    setEmail('')
    setName('')
    onClose()
  }

  return (
    <GlassModal open={open} onClose={onClose} maxWidth="max-w-xl">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-accent to-indigo grid place-items-center shadow-button">
          <Icon name="users" className="w-8 h-8 text-white" strokeWidth={2} />
        </div>
      </div>

      <h2 className="text-title-1 text-label text-center mb-2">
        Add a Partner
      </h2>
      <p className="text-callout text-label-secondary text-center mb-8 max-w-sm mx-auto">
        Invite a mentor or partner to receive critical alerts about your discipline.
      </p>

      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassInput
            label="Partner name"
            placeholder="Alex Coach"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <GlassInput
            label="Email"
            type="email"
            placeholder="partner@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-[13px] font-semibold text-label mb-2 block">
            Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['MENTOR', 'PARTNER'] as PartnerRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  'p-4 rounded-[14px] text-left transition-all',
                  role === r
                    ? 'bg-accent/12 ring-2 ring-accent/50 text-accent'
                    : 'bg-white/[0.05] text-label-secondary hover:bg-white/[0.1]'
                )}
              >
                <p className="text-[15px] font-bold">
                  {r === 'MENTOR' ? 'Mentor' : 'Peer Partner'}
                </p>
                <p className="text-[12px] font-medium mt-0.5 opacity-70">
                  {r === 'MENTOR'
                    ? 'Full visibility + alerts'
                    : 'Peer support, selective access'}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[13px] font-semibold text-label mb-2 block">
            Permissions
          </label>
          <div className="rounded-[14px] bg-white/[0.04] overflow-hidden divide-y divide-white/[0.08]">
            {(Object.keys(PERMISSION_LABELS) as (keyof PartnerPermissions)[]).map(
              (key) => {
                const labelInfo = PERMISSION_LABELS[key]
                const checked = permissions[key]
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setPermissions({ ...permissions, [key]: !checked })
                    }
                    className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.03] text-left transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-label">
                        {labelInfo.label}
                      </p>
                      <p className="text-[12px] text-label-tertiary">
                        {labelInfo.desc}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPermissions({ ...permissions, [key]: !checked })
                      }}
                      className={cn(
                        'relative w-[50px] h-[31px] rounded-full transition-colors shrink-0',
                        checked ? 'bg-success' : 'bg-white/[0.15]'
                      )}
                    >
                      <motion.span
                        className="absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15)]"
                        animate={{ left: checked ? '21px' : '2px' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </button>
                )
              }
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <GlassButton
            variant="ghost"
            type="button"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </GlassButton>
          <GlassButton variant="primary" type="submit" className="flex-1">
            <Icon name="send" className="w-4 h-4" strokeWidth={2.2} />
            Send Invitation
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  )
}
