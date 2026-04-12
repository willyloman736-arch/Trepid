import { ReactNode } from 'react'
import { BackgroundOrbs } from '@/components/layout/BackgroundOrbs'
import NightSky from '@/components/ui/NightSky'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      <NightSky />
      <BackgroundOrbs dim />
      {children}
    </div>
  )
}
