'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { BackgroundOrbs } from '@/components/layout/BackgroundOrbs'
import { PriceWaves } from '@/components/ui/PriceWaves'
import { FloatingBubble } from '@/components/companion/FloatingBubble'
import { NotificationToaster } from '@/components/layout/NotificationToaster'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { useStore } from '@/lib/store'

export default function MentorLayout({ children }: { children: ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const id = setTimeout(() => {
      const state = useStore.getState()
      if (!state.authenticated) {
        router.push('/login')
        return
      }
      if (state.viewAsRole !== 'MENTOR') {
        router.push('/dashboard')
      }
    }, 200)
    return () => clearTimeout(id)
  }, [router])

  return (
    <div className="relative min-h-screen">
      <PriceWaves enforcementLevel={0} />
      <BackgroundOrbs />
      <Sidebar />
      <TopBar />

      <main className="relative z-10 md:pl-[72px] pb-24 md:pb-8">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 pt-24">
          {children}
        </div>
      </main>

      <NotificationToaster />
      <FloatingBubble />

      {/* Mobile tab bar — fixed bottom on phones only.
          .mobile-only matches the globals.css mobile breakpoint. */}
      <div className="mobile-only">
        <MobileTabBar />
      </div>
    </div>
  )
}
