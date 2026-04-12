'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/ui/Icon'
import { GlassButton } from '@/components/ui/GlassButton'
import NightSky from '@/components/ui/NightSky'
import { BackgroundOrbs } from '@/components/layout/BackgroundOrbs'

/* ============================================================
   Pricing Page — /pricing
   Two audiences (Traders / Mentors), monthly/annual toggle,
   FAQ accordion, bottom CTA. Uses liquid glass cards throughout.
   ============================================================ */

export default function PricingPage() {
  const router = useRouter()
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [audience, setAudience] = useState<'traders' | 'mentors'>('traders')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const isAnnual = billing === 'annual'

  const handleSelect = (planId: string) => {
    router.push(`/register?plan=${planId}`)
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <NightSky />
      <BackgroundOrbs dim />

      {/* Floating nav — same as landing */}
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
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
        >
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
        </Link>
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
            }}
          >
            Get Started
          </a>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-5 pt-28 pb-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <h1
            className="font-extrabold text-label mb-4"
            style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
            }}
          >
            Simple pricing.
          </h1>
          <p className="text-[17px] text-label-secondary max-w-md mx-auto mb-10">
            Start free. Scale when you&apos;re ready. No hidden fees.
          </p>

          {/* Audience toggle */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 100,
              padding: 4,
              border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: 24,
            }}
          >
            {(['traders', 'mentors'] as const).map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setAudience(tab)}
                style={{
                  padding: '8px 24px',
                  borderRadius: 100,
                  border: 'none',
                  background: audience === tab ? '#4F6EF7' : 'transparent',
                  color: audience === tab ? 'white' : 'rgba(255,255,255,0.5)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                whileTap={{ scale: 0.97 }}
              >
                {tab === 'traders' ? 'For Traders' : 'For Mentors'}
              </motion.button>
            ))}
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <span
              className="text-[13px] font-semibold"
              style={{
                color:
                  billing === 'monthly'
                    ? 'rgba(255,255,255,0.9)'
                    : 'rgba(255,255,255,0.4)',
              }}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBilling(billing === 'monthly' ? 'annual' : 'monthly')
              }
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                border: 'none',
                background: isAnnual ? '#4F6EF7' : 'rgba(255,255,255,0.15)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <motion.span
                style={{
                  position: 'absolute',
                  top: 2,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  background: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
                animate={{ left: isAnnual ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span
              className="text-[13px] font-semibold"
              style={{
                color:
                  billing === 'annual'
                    ? 'rgba(255,255,255,0.9)'
                    : 'rgba(255,255,255,0.4)',
              }}
            >
              Annual
            </span>
            {isAnnual && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[11px] font-bold text-success px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(48,209,88,0.15)' }}
              >
                Save 2 months
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Pricing cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={audience}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-24"
          >
            {(audience === 'traders' ? TRADER_PLANS : MENTOR_PLANS).map(
              (plan, i) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  billing={billing}
                  index={i}
                  onSelect={handleSelect}
                />
              )
            )}
          </motion.div>
        </AnimatePresence>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto mb-24"
        >
          <h2 className="text-title-1 text-label text-center mb-8">
            Questions
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="glass overflow-hidden"
                style={{ borderRadius: 14, padding: 0 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <span className="text-[15px] font-semibold text-label pr-4">
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 45 : 0 }}
                    className="text-label-tertiary shrink-0"
                  >
                    <Icon name="plus" className="w-4 h-4" strokeWidth={2.5} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-[14px] text-label-secondary leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center glass p-10 md:p-16"
          style={{ borderRadius: 24 }}
        >
          <h2 className="text-title-1 text-label mb-3">Still not sure?</h2>
          <p className="text-[16px] text-label-secondary mb-8 max-w-md mx-auto">
            Start free — no credit card required. Full Pro features free for 14
            days.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <GlassButton
              variant="primary"
              size="lg"
              onClick={() => router.push('/register')}
            >
              Start Free Trial
              <Icon name="arrow-right" className="w-4 h-4" strokeWidth={2.5} />
            </GlassButton>
            <GlassButton
              variant="ghost"
              size="lg"
              onClick={() =>
                (window.location.href = 'mailto:hello@trepid.app')
              }
            >
              Talk to us
            </GlassButton>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-[12px] text-label-tertiary mt-12">
          Trepid &middot; Discipline Engine &middot; All prices in USD
        </p>
      </div>
    </main>
  )
}

/* ============================================================
   PRICING CARD COMPONENT
   ============================================================ */

interface PricingPlan {
  id: string
  name: string
  price: { monthly: number; annual: number }
  description: string
  features: { text: string; included: boolean }[]
  cta: string
  popular?: boolean
  badge?: string
}

function PricingCard({
  plan,
  billing,
  index,
  onSelect,
}: {
  plan: PricingPlan
  billing: 'monthly' | 'annual'
  index: number
  onSelect: (id: string) => void
}) {
  const price =
    billing === 'annual' ? plan.price.annual : plan.price.monthly
  const isAnnual = billing === 'annual'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`glass relative ${plan.popular ? 'glow-accent' : ''}`}
      style={{
        borderRadius: 20,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      {/* Popular top bar */}
      {plan.popular && (
        <div
          style={{
            position: 'absolute',
            top: -1,
            left: 0,
            right: 0,
            height: 2,
            background:
              'linear-gradient(90deg, transparent, #4F6EF7, transparent)',
            borderRadius: '20px 20px 0 0',
          }}
        />
      )}

      <div style={{ padding: 28 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[18px] font-bold text-label">{plan.name}</h3>
          {plan.badge && (
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(79,110,247,0.15)',
                color: '#4F6EF7',
              }}
            >
              {plan.badge}
            </span>
          )}
        </div>
        <p className="text-[13px] text-label-secondary mb-5">
          {plan.description}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-6">
          <motion.span
            key={price}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="text-[44px] font-extrabold text-label tabular-nums tracking-tight"
          >
            ${price}
          </motion.span>
          <span className="text-[14px] text-label-tertiary font-medium">
            /mo
          </span>
          {isAnnual && plan.price.monthly > 0 && (
            <span
              className="text-[12px] text-label-tertiary ml-1"
              style={{ textDecoration: 'line-through' }}
            >
              ${plan.price.monthly}
            </span>
          )}
        </div>

        {/* CTA */}
        <GlassButton
          variant={plan.popular ? 'primary' : 'ghost'}
          className="w-full !rounded-[12px] mb-6"
          onClick={() => onSelect(plan.id)}
        >
          {plan.cta}
        </GlassButton>

        {/* Features */}
        <div>
          {plan.features.map((f, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 0',
                borderBottom:
                  i < plan.features.length - 1
                    ? '1px solid rgba(255,255,255,0.05)'
                    : 'none',
                opacity: f.included ? 1 : 0.4,
              }}
            >
              <span
                style={{
                  color: f.included ? '#30D158' : 'rgba(255,255,255,0.3)',
                  fontSize: 14,
                  flexShrink: 0,
                  width: 16,
                  textAlign: 'center',
                }}
              >
                {f.included ? '✓' : '×'}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: f.included
                    ? 'rgba(255,255,255,0.85)'
                    : 'rgba(255,255,255,0.35)',
                  textDecoration: f.included ? 'none' : 'line-through',
                }}
              >
                {f.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ============================================================
   DATA
   ============================================================ */

const TRADER_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    description: 'For traders just getting started with discipline.',
    cta: 'Start Free',
    features: [
      { text: 'Manual trade logging (20/month)', included: true },
      { text: 'Up to 3 trading rules', included: true },
      { text: 'Basic violation warnings', included: true },
      { text: 'Daily session summary', included: true },
      { text: 'Discipline score tracking', included: true },
      { text: '1 accountability partner', included: true },
      { text: '7 day trade history', included: true },
      { text: 'AI companion', included: false },
      { text: 'Full enforcement ladder', included: false },
      { text: 'Behavioral analytics', included: false },
      { text: 'MT5 trade import', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 19, annual: 16 },
    description: 'For serious traders who want full enforcement.',
    cta: 'Start 14-day Trial',
    popular: true,
    badge: 'Most Popular',
    features: [
      { text: 'Unlimited trade logging', included: true },
      { text: 'Unlimited trading rules', included: true },
      { text: 'Full enforcement ladder (all 6 levels)', included: true },
      { text: 'AI companion (50 messages/day)', included: true },
      { text: 'Emotional behavior tracking', included: true },
      { text: 'Behavioral analytics (30 days)', included: true },
      { text: 'MT5 trade import (CSV)', included: true },
      { text: '3 accountability partners', included: true },
      { text: 'Push notifications', included: true },
      { text: 'Cooldown timers & session locks', included: true },
      { text: 'Prop firm challenge mode', included: true },
      { text: '90 day trade history', included: true },
      { text: 'MetaApi broker sync', included: false },
      { text: 'SMS alerts', included: false },
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: { monthly: 39, annual: 32 },
    description: 'For traders who treat trading as a business.',
    cta: 'Go Elite',
    badge: 'Best Value',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited AI companion messages', included: true },
      { text: 'Advanced analytics (unlimited)', included: true },
      { text: 'MetaApi broker connection (real-time)', included: true },
      { text: 'SMS accountability alerts', included: true },
      { text: 'Weekly AI behavioral report', included: true },
      { text: 'Custom enforcement rules', included: true },
      { text: 'Unlimited trade history', included: true },
      { text: 'White-glove onboarding call', included: true },
      { text: 'Early access to new features', included: true },
    ],
  },
]

const MENTOR_PLANS: PricingPlan[] = [
  {
    id: 'mentor_starter',
    name: 'Starter',
    price: { monthly: 29, annual: 24 },
    description: 'For coaches just starting to manage students.',
    cta: 'Start Coaching',
    features: [
      { text: 'Up to 5 students', included: true },
      { text: 'Student discipline dashboard', included: true },
      { text: 'Violation alerts (in-app)', included: true },
      { text: 'Daily student summaries', included: true },
      { text: 'Basic student analytics', included: true },
      { text: 'Students get Pro features free', included: true },
      { text: 'Real-time alerts', included: false },
      { text: 'Group session management', included: false },
      { text: 'Custom rule templates', included: false },
    ],
  },
  {
    id: 'mentor_growth',
    name: 'Growth',
    price: { monthly: 79, annual: 66 },
    description: 'For established coaches with a growing student base.',
    cta: 'Start Growing',
    popular: true,
    badge: 'Most Popular',
    features: [
      { text: 'Up to 25 students', included: true },
      { text: 'Full student dashboard', included: true },
      { text: 'Real-time violation alerts', included: true },
      { text: 'Push notifications for breaches', included: true },
      { text: 'Weekly behavioral reports', included: true },
      { text: 'Group session management', included: true },
      { text: 'Custom rule templates', included: true },
      { text: 'Student leaderboard', included: true },
      { text: 'Mentor profile page', included: true },
      { text: 'Students get Pro features free', included: true },
      { text: 'API access', included: false },
      { text: 'White-label branding', included: false },
    ],
  },
  {
    id: 'mentor_academy',
    name: 'Academy',
    price: { monthly: 199, annual: 166 },
    description: 'For prop firms, academies, and professional coaches.',
    cta: 'Contact Sales',
    badge: 'Enterprise',
    features: [
      { text: 'Unlimited students', included: true },
      { text: 'White-label dashboard', included: true },
      { text: 'SMS alerts for critical violations', included: true },
      { text: 'Full API access', included: true },
      { text: 'Custom branding', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Bulk student onboarding', included: true },
      { text: 'Advanced cohort analytics', included: true },
      { text: 'Students get Elite features free', included: true },
      { text: 'Custom contract & invoicing', included: true },
      { text: 'Priority phone support', included: true },
    ],
  },
]

const FAQS = [
  {
    q: 'Can I switch plans anytime?',
    a: 'Yes. Upgrade or downgrade at any time. Changes take effect immediately. Unused days are prorated.',
  },
  {
    q: 'What happens when I reach my trade limit on Free?',
    a: "You'll be notified and can upgrade to Pro or wait until the next month. Your existing data is never deleted.",
  },
  {
    q: 'Do my students need their own accounts?',
    a: 'Yes. Each student creates their own free Trepid account and links to you as their mentor. Their subscription is covered by your mentor plan.',
  },
  {
    q: 'Is my trading data private?',
    a: 'Completely. Your data is never shared with anyone except partners you explicitly link. We do not sell data.',
  },
  {
    q: 'Does Trepid work with MT4 and MT5?',
    a: 'Pro and Elite plans support CSV import from MT4/MT5. Elite adds real-time MetaApi broker connection for automatic trade syncing.',
  },
  {
    q: 'What is the prop firm challenge mode?',
    a: 'Pre-loaded rules matching FTMO, MyForexFunds, and other major prop firms. Trepid enforces challenge rules automatically so you never fail on an emotional day.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. No contracts, no cancellation fees. Cancel anytime from your settings page.',
  },
]
