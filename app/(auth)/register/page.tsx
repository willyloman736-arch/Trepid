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
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const login = useStore((s) => s.login)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Sync to Zustand store
      login(data.user.email ?? email, name)
      router.push('/dashboard')
    }
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
          <div className="flex justify-center mb-6">
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'rgba(0, 122, 255, 0.15)',
                border: '1px solid rgba(0, 122, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 24px rgba(0,122,255,0.2)',
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#007AFF',
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '-0.04em',
                }}
              >
                T
              </span>
            </div>
          </div>

          <h1 className="text-title-1 text-label text-center mb-2">
            Start your discipline journey
          </h1>
          <p className="text-callout text-label-secondary text-center mb-8">
            Create your account. 30 seconds.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-[12px] bg-danger/10 border border-danger/20 text-danger text-[13px] font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <GlassInput
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Trader"
              required
            />
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
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />

            <GlassButton
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full !py-4 !text-[17px] !rounded-[16px]"
            >
              Create Account
              <Icon name="arrow-right" className="w-4 h-4" strokeWidth={2.5} />
            </GlassButton>
          </form>

          <p className="mt-8 text-center text-[14px] text-label-secondary">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-accent hover:text-accent-hover font-semibold"
            >
              Sign in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </>
  )
}
