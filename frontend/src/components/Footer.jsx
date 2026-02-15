import React, { useCallback } from 'react'
import { motion } from 'framer-motion'
import { personalInfo, socialLinks, navItems } from '../data/personal'

/* ═══════════════════════════════════════════════════════════════
 *  FOOTER — HUD STATUS BAR
 *  Minimal boss-mode footer with nav links,
 *  social channels, system status, back-to-top
 * ═══════════════════════════════════════════════════════════════ */

const Footer = () => {
  const scrollToTop = useCallback(() => {
    if (window.__portfolioLenis) window.__portfolioLenis.scrollTo(0, { duration: 2 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id)
    if (el && window.__portfolioLenis) window.__portfolioLenis.scrollTo(el, { offset: -80, duration: 1.6 })
    else if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-white/[0.03] bg-[#050508]/80 overflow-hidden">
      {/* Separator glow line — enhanced with animated energy flow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ff003320] to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-[1px] animate-energy-flow" />

      {/* Subtle background scan */}
      <div className="absolute inset-0 animate-threat-scan opacity-[0.04] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Col 1: Identity */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 border border-[#ff003325] flex items-center justify-center">
                <span className="font-hud text-[12px] text-[#ff003370]">S</span>
              </div>
              <div>
                <div className="font-hud text-[13px] tracking-[0.25em] text-white/80">{personalInfo.name.toUpperCase()}</div>
                <div className="font-mono text-[10px] text-white/50 tracking-wider">{personalInfo.title.toUpperCase()}</div>
              </div>
            </div>
            <p className="font-mono text-[13px] text-white/55 leading-relaxed max-w-xs">
              {personalInfo.tagline}
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <div className="font-mono text-[11px] tracking-[0.3em] text-[#ff003399] mb-4">NAVIGATION</div>
            <div className="space-y-2">
              {navItems.map((item) => {
                const id = item.href?.replace('#', '') || item.id
                return (
                  <button key={id} onClick={() => scrollTo(id)}
                    className="block font-mono text-[13px] text-white/60 hover:text-[#ff0033aa] transition-colors tracking-wider"
                  >
                    &gt; {item.label.toUpperCase()}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Col 3: Channels + Back to top */}
          <div>
            <div className="font-mono text-[11px] tracking-[0.3em] text-[#ff003399] mb-4">CHANNELS</div>
            <div className="flex gap-2 mb-6">
              {socialLinks.map((link) => (
                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 border border-white/[0.12] flex items-center justify-center text-white/60 font-mono text-[12px]
                    hover:border-[#ff003345] hover:text-[#ff0033aa] transition-all duration-300"
                >
                  {link.label.slice(0, 2).toUpperCase()}
                </a>
              ))}
            </div>

            {/* Back to top */}
            <motion.button onClick={scrollToTop}
              whileHover={{ y: -2 }}
              className="flex items-center gap-2 text-white/40 hover:text-[#ff003380] transition-colors"
            >
              <div className="w-5 h-5 border border-white/[0.06] flex items-center justify-center hover:border-[#ff003320] transition-colors">
                <span className="text-[13px]">↑</span>
              </div>
              <span className="font-mono text-[11px] tracking-[0.2em]">RETURN_TO_TOP</span>
            </motion.button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.03] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-mono text-[11px] text-white/45 tracking-wider">
            © {year} {personalInfo.name.toUpperCase()} // ALL_RIGHTS_RESERVED
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff8830]" style={{ animation: 'energy-pulse 2s ease-in-out infinite' }} />
              <span className="font-mono text-[10px] text-[#00ff88aa] animate-neon-flicker">SYS_NOMINAL</span>
            </div>
            <span className="font-mono text-[10px] text-white/40 animate-arc-flicker">v2.0.0 // BOSS_MODE</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
