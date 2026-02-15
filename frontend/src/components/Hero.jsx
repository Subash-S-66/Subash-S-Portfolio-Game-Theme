import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { personalInfo, socialLinks } from '../data/personal'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════════
 *  HERO — BOSS COMMAND CENTER
 *  Targeting reticle UI, rotating HUD rings, energy charge,
 *  ability-activation buttons, radar sweep background
 * ═══════════════════════════════════════════════════════════════ */

function useTextScramble(text, trigger = true, speed = 30) {
  const [display, setDisplay] = useState('')
  const chars = '!@#$%^&*<>[]{}|/\\ABCDEF0123456789'
  useEffect(() => {
    if (!trigger) return
    let frame = 0
    const totalFrames = text.length * 3
    let raf
    const scramble = () => {
      let result = ''
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') result += ' '
        else if (frame > i * 3) result += text[i]
        else result += chars[Math.floor(Math.random() * chars.length)]
      }
      setDisplay(result)
      frame++
      if (frame <= totalFrames + 5) raf = setTimeout(() => requestAnimationFrame(scramble), speed)
    }
    scramble()
    return () => clearTimeout(raf)
  }, [text, trigger, speed])
  return display
}

function useTypingEffect(strings, typeSpeed = 80, deleteSpeed = 40, pauseTime = 2200) {
  const [text, setText] = useState('')
  const [index, setIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  useEffect(() => {
    const current = strings[index]
    let timer
    if (!isDeleting && text === current) timer = setTimeout(() => setIsDeleting(true), pauseTime)
    else if (isDeleting && text === '') { setIsDeleting(false); setIndex(p => (p + 1) % strings.length) }
    else timer = setTimeout(() => setText(isDeleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1)), isDeleting ? deleteSpeed : typeSpeed)
    return () => clearTimeout(timer)
  }, [text, index, isDeleting, strings])
  return text
}

/* ───── Ability Button ───── */
function AbilityButton({ children, variant = 'primary', onClick }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 15 })
  const springY = useSpring(y, { stiffness: 200, damping: 15 })

  const handleMouse = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25)
  }, [x, y])
  const reset = useCallback(() => { x.set(0); y.set(0) }, [x, y])

  const isPrimary = variant === 'primary'
  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} style={{ x: springX, y: springY }} className="inline-block">
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }} onClick={onClick}
        className={`relative px-8 py-3 font-hud text-xs uppercase tracking-[0.3em] overflow-hidden group transition-all duration-300
          ${isPrimary
            ? 'bg-[#ff003318] border border-[#ff003370] text-[#ff0033] hover:bg-[#ff003328] hover:border-[#ff003399] hover:shadow-[0_0_30px_rgba(255,0,51,0.25)]'
            : 'bg-transparent border border-white/15 text-white/60 hover:border-[#00f0ff60] hover:text-[#00f0ffaa] hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]'
          }`}
      >
        {/* Energy sweep on hover */}
        <div className={`absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700
          ${isPrimary ? 'bg-gradient-to-r from-transparent via-[#ff003310] to-transparent' : 'bg-gradient-to-r from-transparent via-[#00f0ff08] to-transparent'}`}
        />
        <span className="relative z-10">{children}</span>
      </motion.button>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
const Hero = () => {
  const sectionRef = useRef(null)
  const nameRef = useRef(null)
  const canvasRef = useRef(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springMX = useSpring(mouseX, { stiffness: 40, damping: 18 })
  const springMY = useSpring(mouseY, { stiffness: 40, damping: 18 })

  const bgX = useTransform(springMX, [-500, 500], [-8, 8])
  const bgY = useTransform(springMY, [-300, 300], [-5, 5])

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.85])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const scrambledName = useTextScramble(personalInfo.name, true, 35)
  const typedRole = useTypingEffect(personalInfo.roles, 85, 40, 2200)

  // Mouse tracking
  useEffect(() => {
    let rafId = null
    const handleMouse = (e) => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        const rect = sectionRef.current?.getBoundingClientRect()
        if (rect) { mouseX.set(e.clientX - rect.width / 2); mouseY.set(e.clientY - rect.height / 2) }
        rafId = null
      })
    }
    window.addEventListener('mousemove', handleMouse, { passive: true })
    return () => { window.removeEventListener('mousemove', handleMouse); if (rafId) cancelAnimationFrame(rafId) }
  }, [mouseX, mouseY])

  // ENHANCED Radar + particle storm canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const resize = () => { canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    // Particle system - 80 particles with trails & connections
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0008,
      vy: (Math.random() - 0.5) * 0.0008,
      size: Math.random() * 2.5 + 0.5,
      color: Math.random() > 0.6 ? 'cyan' : Math.random() > 0.3 ? 'red' : 'yellow',
      trail: [],
      life: Math.random() * 100,
      pulse: Math.random() * Math.PI * 2,
    }))

    // Energy arc system
    const arcs = Array.from({ length: 6 }, () => ({
      x1: Math.random(), y1: Math.random(),
      x2: Math.random(), y2: Math.random(),
      life: 0, maxLife: 60 + Math.random() * 120,
      active: false, timer: Math.random() * 200,
    }))

    // EMP pulse rings
    const pulseRings = []

    let raf, frameCount = 0
    const draw = () => {
      const w = canvas.width, h = canvas.height
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2, cy = h / 2
      const time = Date.now() / 1000
      frameCount++

      // Grid floor with perspective fade
      ctx.lineWidth = 0.5
      const gridSize = 50
      for (let x = 0; x < w; x += gridSize) {
        const distFromCenter = Math.abs(x - cx) / cx
        ctx.strokeStyle = `rgba(255,0,51,${0.04 * (1 - distFromCenter * 0.7)})`
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      }
      for (let y = 0; y < h; y += gridSize) {
        const distFromCenter = Math.abs(y - cy) / cy
        ctx.strokeStyle = `rgba(255,0,51,${0.04 * (1 - distFromCenter * 0.7)})`
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }

      // Central radar - enhanced
      const radarR = Math.min(w, h) * 0.2
      const angle = time * 1.2

      // Multiple radar rings with pulsing
      for (let i = 1; i <= 5; i++) {
        const pulseScale = 1 + Math.sin(time * 2 + i) * 0.02
        ctx.strokeStyle = `rgba(255,0,51,${0.08 - i * 0.012})`
        ctx.lineWidth = i === 1 ? 1.2 : 0.6
        ctx.beginPath()
        ctx.arc(cx, cy, radarR * (i / 5) * pulseScale, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Double sweep
      ctx.strokeStyle = 'rgba(255,0,51,0.3)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(angle) * radarR, cy + Math.sin(angle) * radarR)
      ctx.stroke()
      // Second sweep opposite
      ctx.strokeStyle = 'rgba(0,240,255,0.12)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(angle + Math.PI) * radarR * 0.7, cy + Math.sin(angle + Math.PI) * radarR * 0.7)
      ctx.stroke()

      // Sweep trail gradient (wider, more dramatic)
      ctx.save()
      const sweepGrad = ctx.createConicGradient(angle - 0.6, cx, cy)
      sweepGrad.addColorStop(0, 'rgba(255,0,51,0)')
      sweepGrad.addColorStop(0.08, 'rgba(255,0,51,0.1)')
      sweepGrad.addColorStop(0.1, 'rgba(255,0,51,0)')
      ctx.globalAlpha = 0.6
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radarR, angle - 0.6, angle)
      ctx.closePath()
      ctx.fillStyle = sweepGrad
      ctx.fill()
      ctx.restore()

      // Enhanced crosshairs with tick marks
      ctx.strokeStyle = 'rgba(255,0,51,0.07)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(cx - radarR * 2, cy); ctx.lineTo(cx + radarR * 2, cy)
      ctx.moveTo(cx, cy - radarR * 2); ctx.lineTo(cx, cy + radarR * 2)
      ctx.stroke()
      // Tick marks on crosshairs
      for (let t = -5; t <= 5; t++) {
        if (t === 0) continue
        const tickLen = 4
        ctx.strokeStyle = 'rgba(255,0,51,0.08)'
        ctx.beginPath()
        ctx.moveTo(cx + t * radarR * 0.3, cy - tickLen)
        ctx.lineTo(cx + t * radarR * 0.3, cy + tickLen)
        ctx.moveTo(cx - tickLen, cy + t * radarR * 0.3)
        ctx.lineTo(cx + tickLen, cy + t * radarR * 0.3)
        ctx.stroke()
      }

      // ═══ PARTICLE STORM ═══
      const connectionDist = 120
      particles.forEach((p, idx) => {
        p.x += p.vx
        p.y += p.vy
        p.life += 0.5
        p.pulse += 0.05

        // Bounce off edges
        if (p.x < 0 || p.x > 1) p.vx *= -1
        if (p.y < 0 || p.y > 1) p.vy *= -1
        p.x = Math.max(0, Math.min(1, p.x))
        p.y = Math.max(0, Math.min(1, p.y))

        const px = p.x * w, py = p.y * h
        const pulseFactor = 0.7 + Math.sin(p.pulse) * 0.3

        // Store trail
        p.trail.push({ x: px, y: py })
        if (p.trail.length > 8) p.trail.shift()

        // Draw trail
        if (p.trail.length > 1) {
          ctx.beginPath()
          ctx.moveTo(p.trail[0].x, p.trail[0].y)
          p.trail.forEach(t => ctx.lineTo(t.x, t.y))
          ctx.strokeStyle = p.color === 'cyan' ? 'rgba(0,240,255,0.06)' : p.color === 'red' ? 'rgba(255,0,51,0.06)' : 'rgba(255,170,0,0.05)'
          ctx.lineWidth = 0.5
          ctx.stroke()
        }

        // Draw particle with glow
        const alpha = 0.15 * pulseFactor
        const glowAlpha = 0.06 * pulseFactor
        if (p.color === 'cyan') {
          ctx.fillStyle = `rgba(0,240,255,${alpha})`
          ctx.shadowColor = 'rgba(0,240,255,0.3)'
        } else if (p.color === 'red') {
          ctx.fillStyle = `rgba(255,0,51,${alpha})`
          ctx.shadowColor = 'rgba(255,0,51,0.3)'
        } else {
          ctx.fillStyle = `rgba(255,170,0,${alpha})`
          ctx.shadowColor = 'rgba(255,170,0,0.3)'
        }
        ctx.shadowBlur = p.size * 3
        ctx.beginPath()
        ctx.arc(px, py, p.size * pulseFactor, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Connections to nearby particles
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = (p.x - p2.x) * w
          const dy = (p.y - p2.y) * h
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < connectionDist) {
            const lineAlpha = (1 - dist / connectionDist) * 0.04
            ctx.strokeStyle = `rgba(255,0,51,${lineAlpha})`
            ctx.lineWidth = 0.3
            ctx.beginPath()
            ctx.moveTo(px, py)
            ctx.lineTo(p2.x * w, p2.y * h)
            ctx.stroke()
          }
        }
      })

      // ═══ ENERGY ARCS (lightning bolts between random points) ═══
      arcs.forEach(arc => {
        arc.timer--
        if (arc.timer <= 0 && !arc.active) {
          arc.active = true
          arc.life = 0
          arc.x1 = 0.1 + Math.random() * 0.8
          arc.y1 = 0.1 + Math.random() * 0.8
          arc.x2 = 0.1 + Math.random() * 0.8
          arc.y2 = 0.1 + Math.random() * 0.8
        }
        if (arc.active) {
          arc.life++
          const progress = arc.life / arc.maxLife
          const alpha = progress < 0.1 ? progress * 10 : progress > 0.7 ? (1 - progress) / 0.3 : 1
          const ax1 = arc.x1 * w, ay1 = arc.y1 * h
          const ax2 = arc.x2 * w, ay2 = arc.y2 * h

          // Draw jagged lightning
          ctx.beginPath()
          ctx.moveTo(ax1, ay1)
          const segments = 8
          for (let s = 1; s <= segments; s++) {
            const t = s / segments
            const mx = ax1 + (ax2 - ax1) * t + (Math.random() - 0.5) * 40
            const my = ay1 + (ay2 - ay1) * t + (Math.random() - 0.5) * 40
            ctx.lineTo(mx, my)
          }
          ctx.strokeStyle = `rgba(0,240,255,${alpha * 0.12})`
          ctx.lineWidth = 1.5
          ctx.stroke()
          // Thin inner arc
          ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.06})`
          ctx.lineWidth = 0.5
          ctx.stroke()

          if (arc.life >= arc.maxLife) {
            arc.active = false
            arc.timer = 100 + Math.random() * 300
            arc.maxLife = 40 + Math.random() * 100
          }
        }
      })

      // ═══ EXPANDING EMP PULSE RINGS ═══
      if (frameCount % 180 === 0) {
        pulseRings.push({ x: cx, y: cy, r: 10, maxR: radarR * 2.5, life: 0 })
      }
      pulseRings.forEach((ring, i) => {
        ring.r += 2.5
        ring.life++
        const alpha = Math.max(0, 1 - ring.r / ring.maxR) * 0.15
        ctx.strokeStyle = `rgba(255,0,51,${alpha})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2)
        ctx.stroke()
        // Secondary ring
        if (ring.r > 30) {
          ctx.strokeStyle = `rgba(0,240,255,${alpha * 0.4})`
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.arc(ring.x, ring.y, ring.r - 20, 0, Math.PI * 2)
          ctx.stroke()
        }
      })
      // Remove dead rings
      while (pulseRings.length > 0 && pulseRings[0].r > pulseRings[0].maxR) pulseRings.shift()

      // ═══ FLOATING HUD DATA ═══
      const dataTexts = ['0x4F7A', 'SCAN', 'LOCK', '>>>', 'ERR', 'OK', ':::']
      for (let i = 0; i < 6; i++) {
        const dx = (Math.sin(time * 0.15 + i * 1.5) * 0.8 + 1) / 2 * w
        const dy = (Math.cos(time * 0.12 + i * 2.3) * 0.8 + 1) / 2 * h
        const textAlpha = 0.04 + Math.sin(time * 2 + i) * 0.02
        ctx.fillStyle = `rgba(0,240,255,${textAlpha})`
        ctx.font = '9px JetBrains Mono, monospace'
        ctx.fillText(dataTexts[i % dataTexts.length], dx, dy)
      }

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id)
    if (el && window.__portfolioLenis) window.__portfolioLenis.scrollTo(el, { offset: -80, duration: 1.6 })
  }, [])

  const [firstName, ...lastParts] = personalInfo.name.split(' ')
  const lastName = lastParts.join(' ')

  return (
    <section id="home" ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Radar/Grid canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-[1] pointer-events-none" />

      {/* Fog layer */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,0,51,0.03) 0%, transparent 70%)'
      }} />
      {/* Secondary energy haze */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        background: 'radial-gradient(circle at 30% 70%, rgba(0,240,255,0.015) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,170,0,0.01) 0%, transparent 50%)'
      }} />

      {/* Animated threat scanner overlay */}
      <div className="absolute inset-0 z-[2] pointer-events-none animate-threat-scan opacity-[0.08]" />

      {/* HUD frame borders */}
      <div className="absolute inset-8 z-[2] pointer-events-none">
        <div className="hud-corner hud-corner--tl" />
        <div className="hud-corner hud-corner--tr" />
        <div className="hud-corner hud-corner--bl" />
        <div className="hud-corner hud-corner--br" />
        {/* Edge lines */}
        <div className="absolute top-0 left-[20px] right-[20px] h-[1px] bg-gradient-to-r from-transparent via-[#ff003315] to-transparent" />
        <div className="absolute bottom-0 left-[20px] right-[20px] h-[1px] bg-gradient-to-r from-transparent via-[#ff003315] to-transparent" />
        <div className="absolute left-0 top-[20px] bottom-[20px] w-[1px] bg-gradient-to-b from-transparent via-[#ff003315] to-transparent" />
        <div className="absolute right-0 top-[20px] bottom-[20px] w-[1px] bg-gradient-to-b from-transparent via-[#ff003315] to-transparent" />
      </div>

      {/* Scan line */}
      <div className="hud-scan-line z-[3]" />

      {/* Parallax wrapper */}
      <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="relative z-[5] w-full max-w-5xl mx-auto px-6">

        {/* HUD side data */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:block">
          {[
            { label: 'SYS_STATUS', value: 'ONLINE', color: '#00ff88' },
            { label: 'THREAT_LVL', value: 'MAXIMUM', color: '#ff0033' },
            { label: 'SHIELD_PWR', value: '100%', color: '#00f0ff' },
            { label: 'COMBAT_RDY', value: 'TRUE', color: '#ffaa00' },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.8 }}
              className="mb-4 text-right"
            >
              <div className="text-[11px] font-mono tracking-[0.3em] text-white/60">{item.label}</div>
              <div className="text-[13px] font-mono" style={{ color: item.color + 'ee' }}>{item.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Main content center */}
        <div className="text-center">
          {/* Boss designation */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-3">
              <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#ff003380]" />
              <span className="font-mono text-[12px] tracking-[0.5em] text-[#ff0033cc] uppercase">⚠ Final Boss Encountered ⚠</span>
              <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#ff003380]" />
            </div>
          </motion.div>

          {/* Rotating HUD rings around name — ENHANCED */}
          <div className="relative inline-block">
            <div className="absolute -inset-16 flex items-center justify-center pointer-events-none">
              {/* Outer glow ring */}
              <div className="w-[320px] h-[320px] md:w-[440px] md:h-[440px] rounded-full opacity-20" style={{ animation: 'hud-ring-spin 30s linear infinite', border: '1px solid transparent', background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,0,51,0.15) 25%, transparent 50%, rgba(0,240,255,0.1) 75%, transparent 100%)', WebkitMask: 'radial-gradient(transparent 60%, black 61%)', mask: 'radial-gradient(transparent 60%, black 61%)' }} />
              <div className="absolute w-[280px] h-[280px] md:w-[400px] md:h-[400px] border border-[#ff003315] rounded-full" style={{ animation: 'hud-ring-spin 20s linear infinite' }} />
              <div className="absolute w-[240px] h-[240px] md:w-[350px] md:h-[350px] border border-dashed border-[#ff003308] rounded-full" style={{ animation: 'hud-ring-spin-reverse 15s linear infinite' }} />
              <div className="absolute w-[200px] h-[200px] md:w-[300px] md:h-[300px] border border-[#00f0ff0a] rounded-full" style={{ animation: 'hud-ring-spin 12s linear infinite' }} />
              <div className="absolute w-[160px] h-[160px] md:w-[250px] md:h-[250px] border border-dotted border-[#ff003306] rounded-full" style={{ animation: 'hud-ring-spin-reverse 8s linear infinite' }} />
              {/* Ring markers — enhanced with glow */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                <div key={deg} className="absolute w-2 h-2 bg-[#ff003350]" style={{
                  transform: `rotate(${deg}deg) translateY(-${window.innerWidth > 768 ? 200 : 140}px)`,
                  boxShadow: '0 0 12px rgba(255,0,51,0.4)',
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                  animation: `hud-ring-spin 20s linear infinite`,
                }} />
              ))}
              {/* Pulse rings emanating outward */}
              <div className="absolute rounded-full animate-pulse-ring" style={{ width: '200px', height: '200px', animationDelay: '0s' }} />
              <div className="absolute rounded-full animate-pulse-ring" style={{ width: '200px', height: '200px', animationDelay: '1s' }} />
              <div className="absolute rounded-full animate-pulse-ring" style={{ width: '200px', height: '200px', animationDelay: '2s' }} />
            </div>

            {/* Boss name — with chromatic aberration */}
            <motion.div ref={nameRef} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Chromatic ghost layers behind name */}
              <h1 aria-hidden="true" className="absolute inset-0 font-hud text-5xl md:text-7xl lg:text-8xl font-black leading-none opacity-[0.04] text-[#00f0ff]" style={{ transform: 'translate(-3px, -1px)' }}>
                {personalInfo.name}
              </h1>
              <h1 aria-hidden="true" className="absolute inset-0 font-hud text-5xl md:text-7xl lg:text-8xl font-black leading-none opacity-[0.04] text-[#ff0033]" style={{ transform: 'translate(3px, 1px)' }}>
                {personalInfo.name}
              </h1>
              <h1 className="font-hud text-5xl md:text-7xl lg:text-8xl font-black leading-none glitch-text animate-chromatic" data-text={personalInfo.name}>
                <span className="text-white">{firstName}</span>
                <span className="bg-gradient-to-r from-[#ff0033] to-[#ff4466] bg-clip-text text-transparent"> {lastName}</span>
              </h1>
            </motion.div>
          </div>

          {/* Typed role */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="mt-6 font-mono text-sm md:text-base"
          >
            <span className="text-[#ff003360]">&gt; </span>
            <span className="text-[#00f0ffee]">{typedRole}</span>
            <span className="inline-block w-2 h-4 bg-[#00f0ff60] ml-1" style={{ animation: 'blink .8s step-end infinite' }} />
          </motion.div>

          {/* Tagline */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="text-white/70 text-sm md:text-base max-w-lg mx-auto mt-4 font-tactical tracking-wide"
          >
            {personalInfo.tagline}
          </motion.p>

          {/* Action buttons */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <AbilityButton variant="primary" onClick={() => scrollTo('projects')}>
              ◇ View Arsenal ◇
            </AbilityButton>
            <AbilityButton variant="secondary" onClick={() => scrollTo('contact')}>
              ◇ Open Comms ◇
            </AbilityButton>
          </motion.div>

          {/* Social links */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            className="mt-8 flex justify-center gap-4"
          >
            {socialLinks.map((link, i) => (
              <motion.a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                whileHover={{ y: -3, boxShadow: '0 0 15px rgba(255,0,51,0.2)' }}
                className="w-9 h-9 border border-white/[0.12] flex items-center justify-center text-white/60 hover:text-[#ff0033bb] hover:border-[#ff003350] transition-all duration-300 font-mono text-[13px]"
              >
                {link.label.slice(0, 2).toUpperCase()}
              </motion.a>
            ))}
          </motion.div>
        </div>

        {/* Right side HUD data */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block">
          {[
            { label: 'ATK_POWER', value: '9999', color: '#ff0033' },
            { label: 'DEF_RATING', value: 'S+', color: '#00f0ff' },
            { label: 'EXP_LEVEL', value: '∞', color: '#ffaa00' },
            { label: 'KILLS', value: 'N/A', color: '#00ff88' },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.8 }}
              className="mb-4"
            >
              <div className="text-[11px] font-mono tracking-[0.3em] text-white/60">{item.label}</div>
              <div className="text-[13px] font-mono" style={{ color: item.color + 'ee' }}>{item.value}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator — enhanced */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[5] flex flex-col items-center gap-2"
      >
        {/* Pulsing danger zone lines */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#ff003330] animate-energy-flow" />
          <span className="text-[11px] font-mono tracking-[0.4em] text-white/60 uppercase animate-neon-flicker">⚡ Scroll to engage ⚡</span>
          <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#ff003330] animate-energy-flow" />
        </div>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-7 border border-[#ff003330] rounded-sm flex items-start justify-center pt-1.5 relative"
        >
          <div className="w-[2px] h-2.5 bg-[#ff003380] rounded-full" />
          {/* Glow under scroll icon */}
          <div className="absolute -bottom-2 w-8 h-2 bg-[#ff003310] blur-sm rounded-full" />
        </motion.div>
      </motion.div>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </section>
  )
}

export default Hero
