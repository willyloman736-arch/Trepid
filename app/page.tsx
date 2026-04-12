'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'
import { GlassCard } from '@/components/ui/GlassCard'
import { BackgroundOrbs } from '@/components/layout/BackgroundOrbs'
import NightSky from '@/components/ui/NightSky'

export default function LandingPage() {
  return (
    <main className="landing-hero relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
      <NightSky />
      <BackgroundOrbs dim />

      {/* Floating navigation bar */}
      <nav
        style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          padding: '10px 20px',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRadius: 100,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(79,110,247,0.3)',
              border: '1px solid rgba(79,110,247,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: '#4F6EF7',
              fontWeight: 700,
            }}
          >
            T
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>
            Trepid
          </span>
        </div>

        {/* Nav links */}
        <a
          href="/pricing"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.6)',
            textDecoration: 'none',
          }}
        >
          Pricing
        </a>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href="/login"
            style={{
              padding: '7px 16px',
              borderRadius: 50,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.8)',
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            Sign In
          </a>
          <a
            href="/register"
            style={{
              padding: '7px 16px',
              borderRadius: 50,
              background: '#4F6EF7',
              border: 'none',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            Get Started
          </a>
        </div>
      </nav>

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

        <h1
          className="landing-hero-title font-extrabold text-label mb-6"
          style={{
            fontSize: 'clamp(40px, 5.5vw, 72px)',
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
          }}
        >
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
            tint: '#4F6EF7',
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
      {/* Pricing preview */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-20 max-w-4xl w-full text-center"
      >
        <h2
          className="text-title-1 text-label mb-3"
          style={{ letterSpacing: '-0.03em' }}
        >
          Simple pricing. Start free.
        </h2>
        <p className="text-[15px] text-label-secondary mb-8">
          No credit card required. Upgrade when you need more.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            {
              name: 'Free',
              price: '$0',
              desc: '3 rules, 20 trades/mo',
            },
            {
              name: 'Pro',
              price: '$19/mo',
              desc: 'Full enforcement + AI companion',
              popular: true,
            },
            {
              name: 'Elite',
              price: '$39/mo',
              desc: 'MetaApi sync + unlimited everything',
            },
          ].map((p) => (
            <div
              key={p.name}
              className={`glass ${p.popular ? 'glow-accent' : ''}`}
              style={{ borderRadius: 16, padding: 20, position: 'relative' }}
            >
              {p.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: -1,
                    left: 0,
                    right: 0,
                    height: 2,
                    background:
                      'linear-gradient(90deg, transparent, #4F6EF7, transparent)',
                    borderRadius: '16px 16px 0 0',
                  }}
                />
              )}
              <p className="text-[13px] font-semibold text-label-secondary mb-1">
                {p.name}
              </p>
              <p className="text-[28px] font-extrabold text-label tabular-nums tracking-tight mb-1">
                {p.price}
              </p>
              <p className="text-[12px] text-label-tertiary">{p.desc}</p>
            </div>
          ))}
        </div>

        <Link
          href="/pricing"
          className="text-[14px] font-semibold text-accent hover:text-accent-hover transition-colors"
        >
          See all plans &rarr;
        </Link>
      </motion.div>
    </main>
  )
}
