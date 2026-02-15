import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { navItems } from '../data/personal'

/* ═══════════════════════════════════════════════════════════════
 *  SceneIndicator → Tactical Section Indicator
 *  Fixed side indicator showing current "combat zone" /
 *  section, styled as a HUD waypoint tracker.
 * ═══════════════════════════════════════════════════════════════ */

const SceneIndicator = () => {
  const [activeSection, setActiveSection] = useState('home')
  const [scrollPercent, setScrollPercent] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) })
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 })

    navItems.forEach(item => {
      const id = item.href?.replace('#', '') || item.id
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    const handleScroll = () => {
      const p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
      setScrollPercent(Math.round(p * 100))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => { observer.disconnect(); window.removeEventListener('scroll', handleScroll) }
  }, [])

  const activeIndex = navItems.findIndex(item => {
    const id = item.href?.replace('#', '') || item.id
    return id === activeSection
  })

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[50] hidden lg:flex flex-col items-end gap-3">
      {navItems.map((item, i) => {
        const id = item.href?.replace('#', '') || item.id
        const isActive = id === activeSection

        return (
          <motion.div key={id} className="flex items-center gap-2 group"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i + 0.5, duration: 0.6 }}
          >
            {/* Label (appears on active) */}
            <AnimatePresence>
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="font-mono text-[10px] tracking-[0.3em] text-[#ff003350]"
                >
                  {item.label.toUpperCase()}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Dot */}
            <div className={`w-1.5 h-1.5 transition-all duration-300 ${
              isActive
                ? 'bg-[#ff003380] shadow-[0_0_8px_rgba(255,0,51,0.3)]'
                : 'bg-white/[0.06] group-hover:bg-white/[0.15]'
            }`} style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
          </motion.div>
        )
      })}

      {/* Scroll percent */}
      <div className="mt-2 font-mono text-[10px] text-white/40">
        {scrollPercent}%
      </div>
    </div>
  )
}

export default SceneIndicator
