import React, { useRef, useEffect, useState } from 'react'
import { motion, useInView, useMotionValue, useTransform } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { personalInfo, stats } from '../data/personal'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════════
 *  ABOUT — PLAYER STATS / BOSS PROFILE PANEL
 *  Animated stat counters, power meter, bio terminal readout,
 *  floating HUD fragments, rotating insignia
 * ═══════════════════════════════════════════════════════════════ */

function AnimatedCounter({ value, suffix = '', duration = 2, inView }) {
  const [count, setCount] = useState(0)
  const numVal = parseFloat(value)
  const isNumber = !isNaN(numVal)

  useEffect(() => {
    if (!inView || !isNumber) return
    let start = 0
    const step = numVal / (duration * 60)
    const hasDecimal = String(value).includes('.')
    let raf
    const animate = () => {
      start += step
      if (start >= numVal) { setCount(numVal); return }
      setCount(hasDecimal ? parseFloat(start.toFixed(1)) : Math.floor(start))
      raf = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(raf)
  }, [inView, numVal, isNumber, duration, value])

  if (!isNumber) return <span>{value}</span>
  return <span>{count}{suffix}</span>
}

/* ───── Stat Module ───── */
function StatModule({ stat, index, inView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: 0.3 + index * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.05, borderColor: 'rgba(255,0,51,0.15)' }}
      className="relative border border-white/[0.08] bg-white/[0.02] p-5 text-center group hover:border-[#ff003340] transition-all duration-500 overflow-hidden"
    >
      {/* Corner brackets */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#ff003315]" />
      <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#ff003315] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#ff003315] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#ff003315]" />

      {/* Background energy flow on hover */}
      <div className="absolute inset-0 animate-energy-flow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="font-hud text-xl md:text-2xl font-black mb-1 relative z-10"
        style={{ color: ['#ff0033', '#00f0ff', '#ffaa00', '#00ff88'][index % 4] + 'ee' }}
      >
        <AnimatedCounter value={stat.value} suffix="" duration={1.5} inView={inView} />
      </div>
      <div className="font-mono text-[11px] tracking-[0.3em] text-white/80 uppercase mb-1 relative z-10">{stat.label}</div>
      <div className="font-mono text-[11px] text-white/60 relative z-10">{stat.suffix}</div>

      {/* Bottom energy bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px]"
        initial={{ width: 0 }}
        animate={inView ? { width: '100%' } : {}}
        transition={{ delay: 0.5 + index * 0.15, duration: 1.2, ease: 'easeOut' }}
        style={{ background: `linear-gradient(90deg, transparent, ${['#ff0033', '#00f0ff', '#ffaa00', '#00ff88'][index % 4]}40, transparent)` }}
      />

      {/* Hover glow — enhanced */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#ff003308] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
const About = () => {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const statsRef = useRef(null)
  const bioRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' })
  const statsInView = useInView(statsRef, { once: true, margin: '-60px' })
  const bioInView = useInView(bioRef, { once: true, margin: '-60px' })

  // GSAP scroll reveal for bio lines
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.bio-line', { opacity: 0, y: 20, filter: 'blur(6px)' }, {
        opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.2, duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.bio-lines', start: 'top 80%', once: true }
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={sectionRef} className="relative py-32 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hex-grid-bg opacity-20 pointer-events-none" />

      {/* Floating HUD fragments */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['INTEL_SCAN', 'DATA_SYNC', 'CLASSIFIED', 'LVL_99', 'DMG:∞'].map((text, i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.04, y: [0, -60, 0], x: [0, 20 * (i % 2 === 0 ? 1 : -1), 0] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, delay: i * 1.5 }}
            className="absolute font-mono text-[16px] text-[#ff0033] tracking-[0.3em]"
            style={{ top: `${15 + i * 16}%`, left: `${5 + i * 18}%` }}
          >
            {text}
          </motion.div>
        ))}
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div ref={headerRef} className="mb-16">
          <motion.div initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-2 h-2 bg-[#00f0ff40]" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
              <span className="font-mono text-[14px] tracking-[0.5em] text-[#00f0ffcc] uppercase">Intelligence Report</span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-[#00f0ff15] to-transparent" />
            </div>
            <h2 className="font-hud text-3xl md:text-5xl font-black tracking-wide">
              <span className="text-white/95">BOSS </span>
              <span className="bg-gradient-to-r from-[#00f0ff] to-[#0088ff] bg-clip-text text-transparent">PROFILE</span>
            </h2>
            <p className="mt-3 text-white/70 font-tactical text-base max-w-xl tracking-wide">
              Target analysis — classified dossier on the final boss entity.
            </p>
          </motion.div>
        </div>

        {/* Stats grid */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
          {stats.map((stat, i) => (
            <StatModule key={stat.label} stat={stat} index={i} inView={statsInView} />
          ))}
        </div>

        {/* Bio terminal */}
        <div ref={bioRef} className="relative">
          <div className="combat-card overflow-hidden relative animate-hud-breathe">
            {/* Scanning overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 animate-threat-scan opacity-[0.06]" />

            {/* Terminal header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/[0.03] relative">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#ff003340] animate-arc-flicker" />
                <div className="w-2 h-2 rounded-full bg-[#ffaa0030]" />
                <div className="w-2 h-2 rounded-full bg-[#00ff8830]" />
              </div>
              <span className="font-mono text-[14px] tracking-[0.3em] text-white/60 animate-chromatic">BOSS_DOSSIER.exe — CLASSIFIED</span>
              <div className="ml-auto font-mono text-[13px] text-[#ff003320] animate-neon-flicker">● REC</div>
            </div>

            {/* Bio content */}
            <div className="p-6 bio-lines">
              {personalInfo.bio.map((paragraph, i) => (
                <div key={i} className="bio-line mb-4 last:mb-0">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-[15px] text-[#ff003330] mt-1 select-none">&gt;</span>
                    <p className="text-white/80 text-base leading-relaxed font-tactical tracking-wide">
                      {paragraph}
                    </p>
                  </div>
                </div>
              ))}

              {/* Cursor blink */}
              <motion.div initial={{ opacity: 0 }} animate={bioInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.5 }}
                className="flex items-center gap-2 mt-4"
              >
                <span className="font-mono text-[15px] text-[#ff003330]">&gt;</span>
                <span className="inline-block w-2 h-3 bg-[#ff003340]" style={{ animation: 'blink .8s step-end infinite' }} />
              </motion.div>
            </div>

            {/* Bottom status bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.03] bg-white/[0.005]">
              <span className="font-mono text-[13px] text-white/50">CLEARANCE: OMEGA</span>
              <span className="font-mono text-[13px] text-[#00ff88aa]">■ FILE INTEGRITY: VERIFIED</span>
              <span className="font-mono text-[13px] text-white/50">EOF</span>
            </div>
          </div>
        </div>

        {/* Designation */}
        <motion.div initial={{ opacity: 0 }} animate={headerInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <div className="font-mono text-[14px] tracking-[0.5em] text-white/50">
            ◁ {personalInfo.title.toUpperCase()} // {personalInfo.name.toUpperCase()} ▷
          </div>
        </motion.div>
      </div>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </section>
  )
}

export default About
