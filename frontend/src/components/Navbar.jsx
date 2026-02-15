import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { navItems, personalInfo, portfolioLinks } from '../data/personal'

/* ═══════════════════════════════════════════════════════════════
 *  NAVBAR — TACTICAL HUD TABS
 *  Energy-bordered active tab, radar-style progress,
 *  holographic mobile menu, combat mode switching
 * ═══════════════════════════════════════════════════════════════ */

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [portfolioMenuOpen, setPortfolioMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const portfolioMenuRef = useRef(null)

  const { scrollYProgress } = useScroll()
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  // Intersection-based active section
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) })
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 })
    navItems.forEach(item => {
      const id = item.href?.replace('#', '') || item.id
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  // Scroll direction hide/show + scrolled state
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setScrolled(y > 30)
      setIsVisible(y < 100 || y < lastScrollY.current)
      lastScrollY.current = y
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (portfolioMenuRef.current && !portfolioMenuRef.current.contains(event.target)) {
        setPortfolioMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const scrollTo = useCallback((id) => {
    setMobileOpen(false)
    setPortfolioMenuOpen(false)
    const el = document.getElementById(id)
    if (el && window.__portfolioLenis) window.__portfolioLenis.scrollTo(el, { offset: -80, duration: 1.6 })
    else if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: isVisible ? 0 : -100, opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500
          ${scrolled
            ? 'bg-[#050508]/90 backdrop-blur-xl border-b border-[#ff003315]'
            : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo / Callsign — enhanced with glitch */}
          <motion.button onClick={() => scrollTo('home')}
            whileHover={{ scale: 1.03 }}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-8 h-8 border border-[#ff003330] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[#ff003308] group-hover:bg-[#ff003318] transition-colors duration-300" />
              {/* Scan sweep on hover */}
              <div className="absolute inset-0 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 bg-gradient-to-b from-transparent via-[#ff003320] to-transparent" />
              <span className="relative font-hud text-[13px] text-[#ff003380] group-hover:animate-chromatic">S</span>
              <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-[#ff003360]" />
              <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-[#ff003360]" />
            </div>
            <div className="hidden sm:block">
              <div className="font-hud text-[13px] tracking-[0.3em] text-white/90 group-hover:text-[#ff0033bb] group-hover:animate-chromatic transition-colors duration-300">
                {personalInfo.name.toUpperCase()}
              </div>
              <div className="font-mono text-[10px] tracking-[0.2em] text-white/55 animate-neon-flicker">BOSS_ENTITY // ACTIVE</div>
            </div>
          </motion.button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const itemId = item.href?.replace('#', '') || item.id
              const isActive = activeSection === itemId
              return (
                <button key={itemId} onClick={() => scrollTo(itemId)}
                  className="relative px-4 py-2 group"
                >
                  <span className={`font-mono text-[13px] tracking-[0.2em] uppercase transition-all duration-300
                    ${isActive ? 'text-[#ff0033dd]' : 'text-white/70 group-hover:text-white/90'}`}
                  >
                    {item.label}
                  </span>

                  {/* Active energy bar — enhanced with glow */}
                  {isActive && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-2 right-2 h-[1px]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      <div className="w-full h-full bg-gradient-to-r from-transparent via-[#ff0033] to-transparent" />
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ff0033] rounded-full blur-[4px]" />
                      {/* Side diamonds */}
                      <div className="absolute top-[-2px] left-0 w-1.5 h-1.5 bg-[#ff003360]" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                      <div className="absolute top-[-2px] right-0 w-1.5 h-1.5 bg-[#ff003360]" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                    </motion.div>
                  )}

                  {/* Hover bracket */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#ff003320]" />
                    <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#ff003320]" />
                  </div>
                </button>
              )
            })}

            {/* Portfolio switcher */}
            <div
              ref={portfolioMenuRef}
              className="relative ml-3"
              onMouseEnter={() => setPortfolioMenuOpen(true)}
              onMouseLeave={() => setPortfolioMenuOpen(false)}
            >
              <button
                onClick={() => setPortfolioMenuOpen(true)}
                className="px-4 py-1.5 border border-[#00f0ff2d] text-[#00f0ffcc] font-mono text-[12px] tracking-[0.2em] uppercase
                  hover:bg-[#00f0ff12] hover:border-[#00f0ff55] hover:text-[#00f0ffee] transition-all duration-300"
                aria-haspopup="menu"
                aria-expanded={portfolioMenuOpen}
              >
                PORTFOLIOS
              </button>

              <AnimatePresence>
                {portfolioMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-[calc(100%+10px)] w-72 border border-[#ff003330] bg-[#050508]/95 backdrop-blur-xl p-2 z-[120]"
                  >
                    {portfolioLinks.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setPortfolioMenuOpen(false)}
                        className="block px-3 py-2 border border-transparent hover:border-[#ff003325] hover:bg-[#ff00330d] transition-all duration-200"
                      >
                        <div className="font-hud text-[11px] tracking-[0.14em] text-white/90 uppercase">{link.label}</div>
                        <div className="font-mono text-[10px] tracking-[0.08em] text-[#00f0ffa8] uppercase">{link.theme}</div>
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Resume link */}
            {personalInfo.resumeUrl && (
              <a href={personalInfo.resumeUrl} target="_blank" rel="noopener noreferrer"
                className="ml-3 px-4 py-1.5 border border-[#ff003360] text-[#ff0033bb] font-mono text-[12px] tracking-[0.25em] uppercase
                  hover:bg-[#ff003320] hover:border-[#ff003380] hover:text-[#ff0033ee] transition-all duration-300
                  hover:shadow-[0_0_15px_rgba(255,0,51,0.08)]"
              >
                DOSSIER
              </a>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 border border-white/[0.06] flex flex-col items-center justify-center gap-1 hover:border-[#ff003330] transition-colors"
          >
            <motion.div animate={mobileOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
              className="w-4 h-[1px] bg-white/30" />
            <motion.div animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              className="w-4 h-[1px] bg-white/30" />
            <motion.div animate={mobileOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
              className="w-4 h-[1px] bg-white/30" />
          </button>
        </div>

        {/* Scroll progress bar — enhanced with glow */}
        <motion.div style={{ width: progressWidth }}
          className="h-[2px] relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff0033] via-[#ff003380] to-transparent" />
          {/* Glow on the leading edge */}
          <div className="absolute top-[-2px] right-0 w-3 h-[6px] bg-[#ff0033] blur-[3px] rounded-full" />
        </motion.div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] md:hidden"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#050508]/95 backdrop-blur-xl" onClick={() => setMobileOpen(false)} />

            {/* Menu content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
              <div className="mb-8">
                <div className="font-mono text-[11px] tracking-[0.4em] text-[#ff003340]">◁ TACTICAL MENU ▷</div>
              </div>
              {navItems.map((item, i) => {
                const itemId = item.href?.replace('#', '') || item.id
                const isActive = activeSection === itemId
                return (
                  <motion.button
                    key={itemId}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    onClick={() => scrollTo(itemId)}
                    className={`py-3 px-8 mb-2 font-hud text-sm tracking-[0.3em] uppercase transition-all duration-300
                      ${isActive
                        ? 'text-[#ff0033dd] border-l-2 border-[#ff003390] bg-[#ff003315]'
                        : 'text-white/60 hover:text-white/80'
                      }`}
                  >
                    <span className="text-[11px] mr-3 text-white/50 font-mono">[0{i + 1}]</span>
                    {item.label}
                  </motion.button>
                )
              })}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mt-4 w-full max-w-[280px]"
              >
                <div className="mb-2 text-center font-mono text-[11px] tracking-[0.32em] text-[#00f0ff80] uppercase">
                  Portfolio Switch
                </div>
                <div className="space-y-2">
                  {portfolioLinks.map((link, i) => (
                    <motion.a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.06, duration: 0.3 }}
                      onClick={() => setMobileOpen(false)}
                      className="block w-full px-4 py-2 border border-[#00f0ff25] text-center hover:border-[#00f0ff50] hover:bg-[#00f0ff0f] transition-all duration-300"
                    >
                      <div className="font-hud text-[11px] tracking-[0.14em] text-white/90 uppercase">{link.label}</div>
                      <div className="font-mono text-[10px] tracking-[0.08em] text-[#00f0ffa8] uppercase">{link.theme}</div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {personalInfo.resumeUrl && (
                <motion.a href={personalInfo.resumeUrl} target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  className="mt-8 px-6 py-2 border border-[#ff003320] text-[#ff003350] font-mono text-[12px] tracking-[0.3em] uppercase
                    hover:bg-[#ff003310] transition-all"
                >
                  ◇ VIEW DOSSIER ◇
                </motion.a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
