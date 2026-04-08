'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

// ── Animation spec from system.md ──────────────────────────────────
const EASE = [0.25, 0.1, 0.25, 1] as const
const DURATION = 0.4
const STAGGER = 0.08

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATION, ease: EASE, delay },
  }
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* ── Video background ─────────────────────────────────────── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* ── Overlay gradient — exact spec ────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* ── Ambient fire glow ────────────────────────────────────── */}
      <div className="absolute inset-0 bg-fire-glow pointer-events-none opacity-60" />

      {/* ── Hero content ─────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="max-w-3xl w-full">

          {/* Eyebrow — tracking-[0.2em], text-primary, Outfit, uppercase */}
          <motion.p
            {...fadeUp(0)}
            className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-6 flex items-center justify-center gap-3"
          >
            <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-primary" />
            A Hostel Collective
            <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-primary" />
          </motion.p>

          {/* H1 — Playfair Display, 64px desktop */}
          <motion.h1
            {...fadeUp(STAGGER * 1)}
            className="font-display text-[clamp(3rem,8vw,5rem)] text-text-high font-bold leading-[1.05] mb-6"
          >
            Wander{' '}
            <span className="italic font-light text-primary">Lust.</span>
          </motion.h1>

          {/* Subheading — Outfit 300, text-medium */}
          <motion.p
            {...fadeUp(STAGGER * 2)}
            className="text-lg md:text-xl text-text-medium font-light max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Find your tribe. Book a bed. Live the journey.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            {...fadeUp(STAGGER * 3)}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Primary — exact Stitch class pattern */}
            <Link
              href="/locations"
              className="bg-button-gradient text-white px-8 py-3.5 rounded-full font-bold tracking-wide transition-all shadow-glow hover:shadow-glow-hover hover:-translate-y-0.5 active:translate-y-0 active:shadow-glow flex items-center justify-center gap-2"
            >
              Book Your Stay
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            {/* Secondary — ghost, gold border */}
            <Link
              href="/community/our-story"
              className="bg-transparent border border-gold-border/50 text-text-high hover:bg-white/5 hover:border-primary hover:text-primary px-8 py-3 rounded-full font-medium tracking-wide transition-all uppercase text-sm"
            >
              Explore More
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: STAGGER * 4 + 0.4, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-text-low font-bold">
            Scroll
          </span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-text-low to-transparent" />
        </motion.div>
      </div>
    </section>
  )
}
