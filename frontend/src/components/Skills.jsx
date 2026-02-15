import React, { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { skillGroups, techOrbit, highlights } from '../data/skills'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════════
 *  SKILLS — POWER SYSTEM / COMBAT ABILITIES
 *  Each skill group = weapon subsystem with power bars,
 *  tech orbit ring, highlight modules
 * ═══════════════════════════════════════════════════════════════ */

const groupColors = ['#ff0033', '#00f0ff', '#ffaa00', '#00ff88']

/* ───── Power Bar — ENHANCED with shimmer & glow ───── */
function PowerBar({ name, level, color, index, inView }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.6 }}
      className="mb-3 group/bar"
    >
      <div className="flex justify-between mb-1">
        <span className="font-mono text-[13px] tracking-wider text-white/80 group-hover/bar:text-white transition-colors">{name}</span>
        <motion.span
          className="font-mono text-[12px]"
          style={{ color: color + 'cc' }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 + index * 0.08 }}
        >
          {level}%
        </motion.span>
      </div>
      <div className="power-bar relative overflow-hidden">
        <motion.div
          className="power-bar-fill relative overflow-hidden"
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : {}}
          transition={{ duration: 1.2, delay: 0.2 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: `linear-gradient(90deg, ${color}60, ${color}20)` }}
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0" style={{
            background: `linear-gradient(90deg, transparent, ${color}25, transparent)`,
            backgroundSize: '200% 100%',
            animation: 'power-bar-shimmer 2.5s linear infinite',
          }} />
        </motion.div>
        {/* Energy glow at bar tip */}
        <motion.div
          className="absolute top-0 bottom-0 w-[3px] rounded-full"
          initial={{ left: '0%', opacity: 0 }}
          animate={inView ? { left: `${level}%`, opacity: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.2 + index * 0.08 }}
          style={{
            background: color,
            boxShadow: `0 0 6px ${color}, 0 0 12px ${color}60`,
          }}
        />
      </div>
    </motion.div>
  )
}

/* ───── Skill Group Module ───── */
function SkillModule({ group, groupIndex, inView }) {
  const color = groupColors[groupIndex % groupColors.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.15 * groupIndex, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.01 }}
      className="combat-card overflow-hidden relative group/skill animate-hud-breathe"
    >
      {/* Scan overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover/skill:opacity-30 transition-opacity duration-700 animate-threat-scan" />

      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/[0.03] relative overflow-hidden">
        {/* Energy flow in header */}
        <div className="absolute inset-0 animate-energy-flow opacity-30" />
        <div className="w-6 h-6 border flex items-center justify-center relative z-10" style={{ borderColor: color + '30' }}>
          <motion.div
            className="w-2 h-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{
              backgroundColor: color + '50',
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
          />
        </div>
        <div className="relative z-10">
          <span className="font-hud text-[14px] tracking-[0.2em] text-white/95">{group.title.toUpperCase()}</span>
          <div className="font-mono text-[10px] text-white/50">SUBSYSTEM_{String(groupIndex + 1).padStart(2, '0')}</div>
        </div>
        <div className="ml-auto relative z-10">
          <span className="font-mono text-[11px] px-2 py-0.5 border animate-arc-flicker" style={{
            borderColor: color + '25', color: color + '50',
          }}>ACTIVE</span>
        </div>
      </div>

      {/* Power bars */}
      <div className="p-4">
        {group.items.map((skill, i) => (
          <PowerBar key={skill.name} name={skill.name} level={skill.level} color={color} index={i} inView={inView} />
        ))}
      </div>

      {/* System average */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] text-white/55">AVG_POWER</span>
        <span className="font-mono text-[12px]" style={{ color: color + 'cc' }}>
          {Math.round(group.items.reduce((a, b) => a + b.level, 0) / group.items.length)}%
        </span>
      </div>

      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l" style={{ borderColor: color + '15' }} />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r" style={{ borderColor: color + '15' }} />
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
const Skills = () => {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const gridRef = useRef(null)
  const orbitRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' })
  const gridInView = useInView(gridRef, { once: true, margin: '-60px' })
  const orbitInView = useInView(orbitRef, { once: true, margin: '-60px' })

  return (
    <section id="skills" ref={sectionRef} className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 hex-grid-bg opacity-20 pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="mb-16">
          <motion.div initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-2 h-2 bg-[#ffaa0040]" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
              <span className="font-mono text-[12px] tracking-[0.5em] text-[#ffaa00cc] uppercase">Combat Systems</span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-[#ffaa0015] to-transparent" />
            </div>
            <h2 className="font-hud text-3xl md:text-5xl font-black tracking-wide">
              <span className="text-white/95">POWER </span>
              <span className="bg-gradient-to-r from-[#ffaa00] to-[#ff8800] bg-clip-text text-transparent">SYSTEMS</span>
            </h2>
            <p className="mt-3 text-white/70 font-tactical text-sm max-w-xl tracking-wide">
              Weapon subsystem analysis — all combat modules operational.
            </p>
          </motion.div>
        </div>

        {/* Skills grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {skillGroups.map((group, i) => (
            <SkillModule key={group.title} group={group} groupIndex={i} inView={gridInView} />
          ))}
        </div>

        {/* Tech orbit */}
        <div ref={orbitRef} className="mb-12">
          <div className="text-center mb-6">
            <span className="font-mono text-[12px] tracking-[0.4em] text-white/60 uppercase">◁ Equipped Tech ▷</span>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={orbitInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto"
          >
            {techOrbit.map((tech, i) => (
              <motion.span key={tech}
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={orbitInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                transition={{ delay: 0.05 * i, duration: 0.5, type: 'spring', stiffness: 200 }}
                whileHover={{
                  scale: 1.15,
                  borderColor: '#ff003340',
                  color: '#ff003380',
                  boxShadow: '0 0 15px rgba(255,0,51,0.1), inset 0 0 10px rgba(255,0,51,0.02)',
                  transition: { duration: 0.2 },
                }}
                className="px-3 py-1 border border-white/[0.12] text-white/70 font-mono text-[13px] tracking-wider
                  hover:bg-[#ff003305] transition-all duration-300 cursor-default relative overflow-hidden group/tech"
              >
                {/* Energy sweep on hover */}
                <div className="absolute inset-0 translate-x-[-100%] group-hover/tech:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-[#ff003308] to-transparent" />
                <span className="relative z-10">{tech}</span>
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Highlights */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <span className="font-mono text-[12px] tracking-[0.4em] text-white/60 uppercase">◁ Passive Abilities ▷</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {highlights.map((h, i) => (
              <motion.div key={h} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={orbitInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.08 * i + 0.3, duration: 0.6 }}
                className="flex items-center gap-2 py-2 px-3"
              >
                <div className="w-1 h-1 bg-[#00ff8840]" />
                <span className="font-mono text-[13px] text-white/70 tracking-wider">{h}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Skills
