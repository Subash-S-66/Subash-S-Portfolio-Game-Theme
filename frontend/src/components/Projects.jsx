import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects, downloadApkFiles } from '../data/projects'
import { ExternalLink, Download, ChevronRight, Zap, Shield, Code } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════════
 *  PROJECTS — WEAPON ARSENAL / ABILITY MODULES
 *  Each project is a "weapon system" or "ability module" card
 *  with power surge load, holographic tilt, energy ripple
 * ═══════════════════════════════════════════════════════════════ */

const categoryIcons = {
  'Full Stack': Zap,
  'AI / ML': Shield,
  default: Code,
}

/* ───── Weapon Card ───── */
function WeaponCard({ project, index }) {
  const cardRef = useRef(null)
  const isInView = useInView(cardRef, { once: true, margin: '-80px' })
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [scanActive, setScanActive] = useState(false)
  const [glitchFlash, setGlitchFlash] = useState(false)

  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }, [])

  // Trigger scan laser on hover
  useEffect(() => {
    if (isHovered) {
      setScanActive(true)
      // Brief glitch flash on enter
      setGlitchFlash(true)
      const t = setTimeout(() => setGlitchFlash(false), 150)
      return () => clearTimeout(t)
    } else {
      setScanActive(false)
    }
  }, [isHovered])

  const Icon = categoryIcons[project.category] || categoryIcons.default
  const isLeft = index % 2 === 0

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, x: isLeft ? -30 : 30 }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className="relative group"
    >
      {/* Weapon designation */}
      <div className="flex items-center gap-3 mb-3">
        <span className="font-mono text-[12px] tracking-[0.3em] text-[#ff0033aa]">
          WEAPON_0{project.id}
        </span>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-[#ff003320] to-transparent" />
        <span className="font-mono text-[11px] text-white/60">{project.category?.toUpperCase()}</span>
      </div>

      {/* Main card */}
      <div
        className="combat-card relative overflow-hidden animate-hud-breathe"
        style={{
          transform: isHovered
            ? `perspective(800px) rotateY(${(mousePos.x - 0.5) * 8}deg) rotateX(${(0.5 - mousePos.y) * 6}deg) scale(1.02)`
            : 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)',
          transition: 'transform 0.3s ease-out',
        }}
      >
        {/* ═══ SCANNING LASER — sweeps top to bottom on hover ═══ */}
        {scanActive && (
          <motion.div
            initial={{ top: '-2px', opacity: 0 }}
            animate={{ top: '100%', opacity: [0, 0.8, 0.8, 0] }}
            transition={{ duration: 1.5, ease: 'linear' }}
            className="absolute left-0 right-0 h-[2px] z-[5] pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${project.color || '#ff0033'}50 20%, ${project.color || '#ff0033'} 50%, ${project.color || '#ff0033'}50 80%, transparent 100%)`,
              boxShadow: `0 0 15px ${project.color || '#ff0033'}40, 0 0 30px ${project.color || '#ff0033'}20`,
            }}
          />
        )}

        {/* ═══ GLITCH FLASH on hover enter ═══ */}
        <AnimatePresence>
          {glitchFlash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute inset-0 z-[6] pointer-events-none bg-white"
            />
          )}
        </AnimatePresence>

        {/* Glow follow — enhanced */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none z-[1]" style={{
            background: `radial-gradient(400px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${project.color || '#ff0033'}15, transparent 60%)`,
          }} />
        )}

        {/* Holographic shimmer lines */}
        <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute left-0 right-0 h-[1px]" style={{
              top: `${20 + i * 15}%`,
              background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.04), transparent)',
              animation: `energy-flow ${2 + i * 0.5}s linear infinite`,
              backgroundSize: '200% 100%',
            }} />
          ))}
        </div>

        {/* Top bar */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-[#ff003325] flex items-center justify-center"
              style={{ borderColor: (project.color || '#ff0033') + '40' }}
            >
              <Icon size={14} strokeWidth={1.5} style={{ color: (project.color || '#ff0033') + '80' }} />
            </div>
            <div>
              <h3 className="font-hud text-sm tracking-[0.15em] text-white">{project.title}</h3>
              <div className="font-mono text-[11px] tracking-[0.2em] text-white/60">{project.subtitle?.toUpperCase()}</div>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="font-mono text-[11px] text-white/60">{project.role}</div>
            <div className="font-mono text-[11px] text-white/50">{project.date}</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-white/80 text-sm leading-relaxed font-tactical mb-4">
            {project.description}
          </p>

          {/* Features as ability list */}
          {project.features?.length > 0 && (
            <div className="mb-4">
              <div className="font-mono text-[11px] tracking-[0.3em] text-[#ff003399] mb-2">ABILITIES</div>
              {project.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2 mb-1.5">
                  <ChevronRight size={10} className="text-[#ff003340] mt-0.5 flex-shrink-0" />
                  <span className="text-white/70 text-[14px] font-mono leading-relaxed">{feat}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tech stack as components */}
          <div className="mb-4">
            <div className="font-mono text-[11px] tracking-[0.3em] text-[#ff003399] mb-2">COMPONENTS</div>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span key={tech}
                  className="px-2 py-0.5 text-[12px] font-mono tracking-wider border border-white/[0.12] text-white/70 bg-white/[0.03] hover:border-[#ff003340] hover:text-[#ff0033aa] transition-all duration-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Power level bar — enhanced with shimmer */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="font-mono text-[11px] text-white/60">POWER_LEVEL</span>
              <motion.span
                className="font-mono text-[11px]"
                style={{ color: (project.color || '#ff0033') + '60' }}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1.2 }}
              >
                {75 + project.id * 5}%
              </motion.span>
            </div>
            <div className="power-bar relative">
              <motion.div
                className="power-bar-fill relative overflow-hidden"
                initial={{ width: 0 }}
                animate={isInView ? { width: `${75 + project.id * 5}%` } : {}}
                transition={{ duration: 1.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ background: `linear-gradient(90deg, ${project.color || '#ff0033'}60, ${project.color || '#ff0033'}20)` }}
              >
                {/* Shimmer effect on bar */}
                <div className="absolute inset-0" style={{
                  background: `linear-gradient(90deg, transparent, ${project.color || '#ff0033'}30, transparent)`,
                  backgroundSize: '200% 100%',
                  animation: 'power-bar-shimmer 2s linear infinite',
                }} />
              </motion.div>
              {/* Energy glow at bar end */}
              <motion.div
                className="absolute top-0 bottom-0 w-1"
                initial={{ left: '0%', opacity: 0 }}
                animate={isInView ? { left: `${75 + project.id * 5}%`, opacity: 1 } : {}}
                transition={{ duration: 1.5, delay: 0.6 }}
                style={{
                  background: project.color || '#ff0033',
                  boxShadow: `0 0 8px ${project.color || '#ff0033'}, 0 0 15px ${project.color || '#ff0033'}60`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Action bar — enhanced with energy flow */}
        <div className="flex items-center border-t border-white/[0.03] divide-x divide-white/[0.03]">
          {project.liveDemo && (
            <a href={project.liveDemo} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 text-white/65 hover:text-[#00f0ffcc] hover:bg-[#00f0ff0a] transition-all duration-300 group/link relative overflow-hidden"
            >
              {/* Energy sweep */}
              <div className="absolute inset-0 translate-x-[-100%] group-hover/link:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-[#00f0ff08] to-transparent" />
              <ExternalLink size={12} className="relative z-10" />
              <span className="font-mono text-[12px] tracking-[0.2em] uppercase relative z-10">Deploy</span>
            </a>
          )}
          {project.apkDownloads?.length > 0 && (
            <button onClick={() => downloadApkFiles(project.apkDownloads)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-white/65 hover:text-[#00ff88cc] hover:bg-[#00ff880a] transition-all duration-300 relative overflow-hidden group/apk"
            >
              <div className="absolute inset-0 translate-x-[-100%] group-hover/apk:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-[#00ff8808] to-transparent" />
              <Download size={12} className="relative z-10" />
              <span className="font-mono text-[12px] tracking-[0.2em] uppercase relative z-10">Android</span>
            </button>
          )}
        </div>

        {/* HUD corner brackets */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#ff003315] pointer-events-none" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#ff003315] pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#ff003315] pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#ff003315] pointer-events-none" />
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
const Projects = () => {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-100px' })

  // GSAP entrance for section
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.weapon-grid > *', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, stagger: 0.12, duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.weapon-grid', start: 'top 85%', once: true }
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="projects" ref={sectionRef} className="relative py-32 px-6 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 hex-grid-bg opacity-30 pointer-events-none" />

      {/* Section header */}
      <div ref={headerRef} className="max-w-6xl mx-auto mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-2 h-2 bg-[#ff003340]" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
            <span className="font-mono text-[12px] tracking-[0.5em] text-[#ff0033cc] uppercase">
              Weapon Arsenal
            </span>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-[#ff003315] to-transparent" />
          </div>

          <h2 className="font-hud text-3xl md:text-5xl font-black tracking-wide">
            <span className="text-white/95">ABILITY </span>
            <span className="bg-gradient-to-r from-[#ff0033] to-[#ff4466] bg-clip-text text-transparent">MODULES</span>
          </h2>

          <p className="mt-3 text-white/70 font-tactical text-sm max-w-xl tracking-wide">
            Each project represents a deployed weapon system — battle-tested and operational.
          </p>
        </motion.div>
      </div>

      {/* Weapon grid */}
      <div className="weapon-grid max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {projects.map((project, i) => (
          <WeaponCard key={project.id} project={project} index={i} />
        ))}
      </div>

      {/* Section scan line */}
      <div className="hud-scan-line z-[3]" />
    </section>
  )
}

export default Projects
