'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassButton } from '@/components/ui/GlassButton'
import { GlassInput } from '@/components/ui/GlassInput'
import { Icon } from '@/components/ui/Icon'
import { useStore } from '@/lib/store'

export default function LoginPage() {
  const router = useRouter()
  const login = useStore((s) => s.login)
  const [email, setEmail] = useState('trader@trepid.app')
  const [password, setPassword] = useState('demo')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      login(email)
      router.push('/dashboard')
    }, 500)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 mb-8 text-label-secondary hover:text-label transition-colors text-[14px] font-medium"
        >
          <Icon name="chevron-left" className="w-4 h-4" strokeWidth={2.2} />
          Back
        </Link>

        <GlassCard padding="p-10" hover={false}>
          <div className="flex justify-center mb-8">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-[20px] liquid-gradient" />
              <div
                className="absolute inset-[3px] rounded-[17px] grid place-items-center"
                style={{
                  background: 'rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                <Icon name="shield-check" className="w-8 h-8 text-white" strokeWidth={2.2} />
              </div>
            </div>
          </div>

          <h1 className="text-title-1 text-label text-center mb-2">Welcome back</h1>
          <p className="text-callout text-label-secondary text-center mb-8">
            Sign in to guard your edge.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <GlassInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              required
            />
            <GlassInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <GlassButton
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full !py-4 !text-[17px] !rounded-[16px]"
            >
              Sign In
              <Icon name="arrow-right" className="w-4 h-4" strokeWidth={2.5} />
            </GlassButton>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.1]" />
            <span className="text-[12px] font-semibold text-label-tertiary">OR</span>
            <div className="flex-1 h-px bg-white/[0.1]" />
          </div>

          <GlassButton
            variant="ghost"
            className="w-full !py-4 !text-[17px] !rounded-[16px]"
            onClick={() => {
              login('demo@google.com', 'Google Demo')
              router.push('/dashboard')
            }}
          >
            <Icon name="google" className="w-4 h-4" strokeWidth={2} />
            Continue with Google
          </GlassButton>

          <p className="mt-8 text-center text-[14px] text-label-secondary">
            No account?{' '}
            <Link
              href="/register"
              className="text-accent hover:text-accent-hover font-semibold"
            >
              Create one
            </Link>
          </p>
        </GlassCard>

        <p className="mt-6 text-center text-[12px] text-label-tertiary">
          Mock auth — any email / password works
        </p>
      </motion.div>
    </>
  )
}
