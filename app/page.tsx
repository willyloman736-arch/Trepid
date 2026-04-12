'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackgroundOrbs } from '@/components/layout/BackgroundOrbs'
import { PriceWaves } from '@/components/ui/PriceWaves'

export default function LandingPage() {
  return (
    <main className="landing-hero relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
      <PriceWaves enforcementLevel={0} />
      <BackgroundOrbs />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="landing-hero-content relative z-10 max-w-3xl text-center"
      >
        <div className="hero-eyebrow inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/[0.05] border border-white/[0.1] text-[12px] font-semibold text-label-secondary backdrop-blur-xl">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Discipline Engine
        </div>

        <h1 className="landing-hero-title text-[72px] md:text-[96px] font-extrabold tracking-[-0.04em] text-label leading-[0.95] mb-6">
          Stop Overtrading.
          <br />
          <span className="text-gradient-accent">Protect Your Edge.</span>
        </h1>

        <p className="landing-hero-subtitle text-title-3 text-label-secondary max-w-2xl mx-auto mb-10 font-normal">
          A real-time discipline enforcement system for forex traders. Your rules,
          enforced automatically. Your companion, watching every move.
        </p>

        <div className="hero-cta-row flex flex-wrap items-center justify-center gap-3">
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary !px-7 !py-4 !text-[17px] !rounded-[16px]"
            >
              Get Started
              <Icon name="arrow-right" className="w-4 h-4" strokeWidth={2.5} />
            </motion.button>
          </Link>
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="btn-ghost !px-7 !py-4 !text-[17px] !rounded-[16px]"
            >
              Sign In
            </motion.button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="features-grid relative z-10 mt-24 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl w-full"
      >
        {[
          {
            icon: 'shield-check' as const,
            title: 'Rule Engine',
            desc: 'Define max trades, loss caps, cooldowns, and behavioral gates.',
            tint: '#007AFF',
          },
          {
            icon: 'bar-chart' as const,
            title: 'Live Enforcement',
            desc: '6-stage escalation ladder — from warnings to full session locks.',
            tint: '#FF9F0A',
          },
          {
            icon: 'sparkles' as const,
            title: 'AI Companion',
            desc: 'Every trade evaluated. Every violation flagged. Every session audited.',
            tint: '#30D158',
          },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlassCard padding="p-6" className="h-full">
              <div
                className="w-12 h-12 rounded-[14px] grid place-items-center mb-4"
                style={{
                  background: `${f.tint}18`,
                  color: f.tint,
                }}
              >
                <Icon name={f.icon} className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className="text-title-3 text-label mb-1">{f.title}</h3>
              <p className="text-callout text-label-secondary leading-relaxed">
                {f.desc}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </main>
  )
}
