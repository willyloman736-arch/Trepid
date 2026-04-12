'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Icon, IconName } from '@/components/ui/Icon'

/* ============================================================
   MobileTabBar — iOS-style fixed bottom tab bar.
   Edge-to-edge, 72px tall, respects safe-area-inset-bottom,
   only mounted on mobile (hidden md:block wrapper in layout).
   Uses the existing Icon component — no lucide-react dep.
   ============================================================ */

interface Tab {
  icon: IconName
  label: string
  path: string
}

const TABS: Tab[] = [
  { icon: 'layout-dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'shield-check', label: 'Rules', path: '/rules' },
  { icon: 'book-open', label: 'Journal', path: '/journal' },
  { icon: 'bar-chart', label: 'Analytics', path: '/analytics' },
  { icon: 'settings', label: 'Settings', path: '/settings' },
]

export function MobileTabBar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 72,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 200,
      }}
      aria-label="Primary navigation"
    >
      {TABS.map((tab) => {
        const active =
          pathname === tab.path ||
          (tab.path !== '/dashboard' && pathname.startsWith(tab.path + '/'))
        return (
          <button
            key={tab.path}
            onClick={() => router.push(tab.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 10px',
              borderRadius: 12,
              minWidth: 56,
              minHeight: 56,
              color: active ? '#4F6EF7' : 'rgba(255, 255, 255, 0.42)',
              transition: 'color 0.2s ease',
            }}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon
              name={tab.icon}
              className="w-[22px] h-[22px]"
              strokeWidth={active ? 2.4 : 1.8}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: active ? 600 : 500,
                letterSpacing: '0.02em',
                color: 'inherit',
                lineHeight: 1,
              }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
