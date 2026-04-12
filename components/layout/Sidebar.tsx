'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Icon, IconName } from '@/components/ui/Icon'
import { ProgressRing, scoreRingColor } from '@/components/ui/ProgressRing'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'
import { scoreLabel } from '@/lib/discipline-scorer'

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { href: '/rules', label: 'Rules', icon: 'shield-check' },
  { href: '/journal', label: 'Journal', icon: 'book-open' },
  { href: '/analytics', label: 'Analytics', icon: 'bar-chart' },
  { href: '/accountability', label: 'Accountability', icon: 'users' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const session = useStore((s) => s.session)
  const user = useStore((s) => s.user)
  const viewAsRole = useStore((s) => s.viewAsRole)
  const setViewAsRole = useStore((s) => s.setViewAsRole)
  const label = scoreLabel(session.disciplineScore)
  const [expanded, setExpanded] = useState(false)

  const toggleRole = () => {
    if (viewAsRole === 'MENTOR') {
      setViewAsRole('TRADER')
      router.push('/dashboard')
    } else {
      setViewAsRole('MENTOR')
      router.push('/mentor/dashboard')
    }
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? 240 : 72 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className="glass-rail hidden md:flex fixed left-0 top-0 bottom-0 z-30 flex-col"
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-4 overflow-hidden">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 shrink-0">
            <div className="absolute inset-0 rounded-xl liquid-gradient" />
            <div
              className="absolute inset-[2px] rounded-[10px] grid place-items-center"
              style={{
                background: 'rgba(255,255,255,0.3)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            >
              <Icon name="shield-check" className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.2 }}
                className="text-title-3 text-label tracking-tight whitespace-nowrap"
              >
                Trepid
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-hidden">
        {NAV.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.96 }}
                className={cn(
                  'relative h-12 flex items-center gap-3 px-3 rounded-[14px] text-[15px] font-medium transition-all cursor-pointer overflow-hidden',
                  active
                    ? 'text-accent'
                    : 'text-label-secondary hover:text-label hover:bg-white/[0.05]'
                )}
                style={
                  active
                    ? { background: 'rgba(0, 122, 255, 0.12)' }
                    : undefined
                }
              >
                <Icon
                  name={item.icon}
                  className="w-[22px] h-[22px] shrink-0"
                  strokeWidth={2}
                />
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Mentor toggle */}
      <div className="px-3 pb-3 overflow-hidden">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={toggleRole}
          className={cn(
            'w-full h-11 flex items-center gap-3 px-3 rounded-[14px] text-[13px] font-semibold transition-all',
            viewAsRole === 'MENTOR'
              ? 'bg-accent/12 text-accent'
              : 'text-label-tertiary hover:text-label hover:bg-white/[0.05]'
          )}
        >
          <Icon name="sparkles" className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap"
              >
                {viewAsRole === 'MENTOR' ? 'Exit mentor view' : 'Mentor view'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* User + discipline ring */}
      <div className="px-3 pb-4 overflow-hidden">
        <div
          className={cn(
            'h-14 flex items-center gap-3 px-2 rounded-[14px]',
            expanded && 'bg-white/[0.04]'
          )}
        >
          <div className="relative w-10 h-10 shrink-0">
            {/* Discipline score ring — Apple Watch style */}
            <ProgressRing
              value={session.disciplineScore}
              max={100}
              size={40}
              strokeWidth={3}
              color={scoreRingColor(session.disciplineScore)}
              bgColor="rgba(255,255,255,0.08)"
            />
            {/* User avatar centered in the ring */}
            <div className="absolute inset-[6px] rounded-full bg-gradient-to-br from-accent to-indigo grid place-items-center pointer-events-none">
              <Icon name="user" className="w-3.5 h-3.5 text-white" strokeWidth={2.2} />
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.2 }}
                className="min-w-0 flex-1"
              >
                <p className="text-[13px] font-semibold text-label truncate leading-tight">
                  {user?.name || 'Demo Trader'}
                </p>
                <p className="text-[11px] text-label-tertiary truncate">
                  {session.disciplineScore} · {label}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}
