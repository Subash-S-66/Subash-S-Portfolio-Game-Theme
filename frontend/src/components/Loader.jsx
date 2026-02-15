import React, { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { personalInfo } from '../data/personal'

/* ═══════════════════════════════════════════════════════════════
 *  BOSS ACTIVATION SEQUENCE — Final Boss Entry Loader
 *  Dark screen → System boot → Scanning grid → Power rising →
 *  TARGET LOCKED → Boss entity reveal → HUD interface transition
 * ═══════════════════════════════════════════════════════════════ */

const TOTAL_DURATION = 3700
const NAME = personalInfo.name
const FIRST = NAME.split(' ')[0]
const LAST = NAME.split(' ').slice(1).join(' ')

const BOOT_LINES = [
  { text: '> INITIALIZING COMBAT SYSTEMS...', delay: 0 },
  { text: '> LOADING WEAPON MATRICES [OK]', delay: 200 },
  { text: '> SCANNING THREAT DATABASE...', delay: 400 },
  { text: '> CALIBRATING TARGETING ARRAY [OK]', delay: 600 },
  { text: '> POWER CORE: CHARGING...', delay: 800 },
  { text: '> ANALYZING BIO-SIGNATURE...', delay: 1070 },
  { text: `> BOSS ENTITY DETECTED: ${NAME.toUpperCase()}`, delay: 1340 },
  { text: '> THREAT LEVEL: ████████████ MAXIMUM', delay: 1610 },
  { text: '> ⚠ WARNING: FINAL BOSS ACTIVATED ⚠', delay: 1880 },
  { text: '> COMBAT INTERFACE ONLINE ■', delay: 2150 },
]

const Loader = ({ onComplete }) => {
  const containerRef = useRef(null)
  const gridRef = useRef(null)
  const radarRef = useRef(null)
  const nameRef = useRef(null)

  const [percent, setPercent] = useState(0)
  const [phase, setPhase] = useState('boot')
  const [termLines, setTermLines] = useState([])
  const [glitchActive, setGlitchActive] = useState(false)
  const [targetLocked, setTargetLocked] = useState(false)

  /* ───── Scanning Grid Canvas ───── */
  useEffect(() => {
    const cvs = gridRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    const resize = () => { cvs.width = window.innerWidth; cvs.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    let raf, dead = false
    const startTime = performance.now()

    const draw = (now) => {
      if (dead) return
      const elapsed = now - startTime
      const progress = Math.min(elapsed / TOTAL_DURATION, 1)

      ctx.clearRect(0, 0, cvs.width, cvs.height)

      // Perspective grid floor
      const cx = cvs.width / 2
      const horizon = cvs.height * 0.35
      const gridAlpha = Math.min(progress * 2, 0.3)

      ctx.strokeStyle = `rgba(255, 0, 51, ${gridAlpha * 0.3})`
      ctx.lineWidth = 0.5

      // Horizontal lines with perspective
      for (let i = 0; i < 20; i++) {
        const t = i / 20
        const y = horizon + (cvs.height - horizon) * Math.pow(t, 0.7)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(cvs.width, y)
        ctx.stroke()
      }

      // Vertical converging lines
      for (let i = -15; i <= 15; i++) {
        const spread = i * (cvs.width / 8)
        ctx.beginPath()
        ctx.moveTo(cx + spread, cvs.height)
        ctx.lineTo(cx + i * 15, horizon)
        ctx.stroke()
      }

      // Hex grid overlay
      const hexSize = 30
      ctx.strokeStyle = `rgba(255, 0, 51, ${gridAlpha * 0.1})`
      for (let x = 0; x < cvs.width; x += hexSize * 1.75) {
        for (let y = 0; y < horizon; y += hexSize * 1.5) {
          const offset = (Math.floor(y / (hexSize * 1.5)) % 2) * hexSize * 0.875
          drawHex(ctx, x + offset, y, hexSize * 0.4)
        }
      }

      // Radar sweep at center
      if (progress > 0.2) {
        const radarRadius = Math.min(cvs.width, cvs.height) * 0.15
        const angle = (elapsed / 2000) * Math.PI * 2
        const radarAlpha = Math.min((progress - 0.2) * 3, 0.4)

        // Radar circle
        ctx.strokeStyle = `rgba(255, 0, 51, ${radarAlpha * 0.3})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(cx, cvs.height * 0.5, radarRadius, 0, Math.PI * 2)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(cx, cvs.height * 0.5, radarRadius * 0.6, 0, Math.PI * 2)
        ctx.stroke()

        // Sweep line
        ctx.strokeStyle = `rgba(255, 0, 51, ${radarAlpha})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(cx, cvs.height * 0.5)
        ctx.lineTo(
          cx + Math.cos(angle) * radarRadius,
          cvs.height * 0.5 + Math.sin(angle) * radarRadius
        )
        ctx.stroke()

        // Sweep trail
        const gradient = ctx.createConicGradient(angle - 0.5, cx, cvs.height * 0.5)
        gradient.addColorStop(0, 'transparent')
        gradient.addColorStop(0.1, `rgba(255, 0, 51, ${radarAlpha * 0.2})`)
        gradient.addColorStop(0.15, 'transparent')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(cx, cvs.height * 0.5, radarRadius, 0, Math.PI * 2)
        ctx.fill()

        // Crosshair
        ctx.strokeStyle = `rgba(255, 0, 51, ${radarAlpha * 0.5})`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(cx - radarRadius, cvs.height * 0.5)
        ctx.lineTo(cx + radarRadius, cvs.height * 0.5)
        ctx.moveTo(cx, cvs.height * 0.5 - radarRadius)
        ctx.lineTo(cx, cvs.height * 0.5 + radarRadius)
        ctx.stroke()
      }

      // Random noise/sparks
      if (progress > 0.1) {
        for (let i = 0; i < 5; i++) {
          const sx = Math.random() * cvs.width
          const sy = Math.random() * cvs.height
          ctx.fillStyle = `rgba(255, 0, 51, ${Math.random() * 0.3})`
          ctx.fillRect(sx, sy, Math.random() * 3, 1)
        }
      }

      raf = requestAnimationFrame(draw)
    }

    function drawHex(ctx, x, y, r) {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        const px = x + r * Math.cos(angle)
        const py = y + r * Math.sin(angle)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.stroke()
    }

    raf = requestAnimationFrame(draw)
    return () => { dead = true; cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  /* ───── Boot sequence ───── */
  useEffect(() => {
    const timers = BOOT_LINES.map(line =>
      setTimeout(() => setTermLines(prev => [...prev, line.text]), line.delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  /* ───── Progress ───── */
  useEffect(() => {
    const start = performance.now()
    let raf
    const tick = (now) => {
      const elapsed = now - start
      const p = Math.min(Math.round((elapsed / TOTAL_DURATION) * 100), 100)
      setPercent(p)

      if (p < 25) setPhase('boot')
      else if (p < 55) setPhase('scanning')
      else if (p < 80) setPhase('locking')
      else setPhase('activated')

      if (p >= 65 && !targetLocked) setTargetLocked(true)

      if (p < 100) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  /* ───── Glitch bursts ───── */
  useEffect(() => {
    const intervals = []
    const timer = setTimeout(() => {
      const id = setInterval(() => {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 60 + Math.random() * 100)
      }, 600 + Math.random() * 1500)
      intervals.push(id)
    }, 800)
    return () => { clearTimeout(timer); intervals.forEach(clearInterval) }
  }, [])

  /* ───── Exit sequence ───── */
  useEffect(() => {
    if (percent < 100) return
    const el = containerRef.current
    if (!el) return

    const tl = gsap.timeline({ onComplete: () => onComplete?.() })

    tl.to(el, { backgroundColor: '#ff0033', duration: 0.06 })
      .to(el, { backgroundColor: '#fff', duration: 0.04 })
      .to(el, { backgroundColor: '#000', duration: 0.08 })
      .to(el, { x: -10, duration: 0.04 })
      .to(el, { x: 10, duration: 0.04 })
      .to(el, { x: -5, duration: 0.03 })
      .to(el, { x: 0, duration: 0.03 })
      .to('.boss-name-main', { textShadow: '-8px 0 #00f0ff, 8px 0 #ff0033', duration: 0.1 }, '-=0.1')
      .to('.boss-name-main', { textShadow: '-15px 0 #00f0ff, 15px 0 #ff0033', duration: 0.08 })
      .to('.boss-name-main', { textShadow: '0 0 transparent', duration: 0.06 })
      .to('.loader-center-content', { scale: 1.2, opacity: 0.8, duration: 0.15 })
      .to('.loader-center-content', { scale: 0, opacity: 0, duration: 0.3, ease: 'power4.in' })
      .to('.emp-ring', { scale: 40, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 }, '-=0.4')
      .to(el, { clipPath: 'circle(0% at 50% 50%)', duration: 0.5, ease: 'power3.in' }, '-=0.3')

    return () => tl.kill()
  }, [percent, onComplete])

  return (
    <div ref={containerRef} className="fixed inset-0 z-[10000] flex items-center justify-center bg-black overflow-hidden" style={{ clipPath: 'circle(100% at 50% 50%)' }}>
      {/* Grid canvas */}
      <canvas ref={gridRef} className="absolute inset-0 z-[1]" />

      {/* Scanlines */}
      <div className="absolute inset-0 z-[4] pointer-events-none" style={{
        background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,0,51,0.015) 2px,rgba(255,0,51,0.015) 4px)'
      }} />

      {/* CRT vignette */}
      <div className="absolute inset-0 z-[4] pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)'
      }} />

      {/* Boot text */}
      <div className="absolute top-6 left-6 z-[6] max-w-md">
        {termLines.map((line, i) => (
          <div key={i} className="font-mono text-xs leading-relaxed" style={{
            color: line.includes('[OK]') ? '#00ff88' :
                   line.includes('DETECTED') ? '#ff0033' :
                   line.includes('WARNING') ? '#ffaa00' :
                   line.includes('ONLINE') ? '#00f0ff' :
                   line.includes('MAXIMUM') ? '#ff0033' : 'rgba(200,200,210,0.25)',
            textShadow: line.includes('WARNING') ? '0 0 10px rgba(255,170,0,0.4)' :
                        line.includes('DETECTED') ? '0 0 10px rgba(255,0,51,0.4)' : 'none',
          }}>
            {line}
          </div>
        ))}
        <div className="w-2 h-3 bg-[#ff0033]/40 mt-1" style={{ animation: 'blink .8s step-end infinite' }} />
      </div>

      {/* Phase indicators */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[6] flex items-center gap-6">
        {['boot', 'scanning', 'locking', 'activated'].map((p, i) => (
          <div key={p} className="flex items-center gap-2">
            <div className="w-2 h-2 transition-all duration-500" style={{
              backgroundColor: phase === p ? ['#ff0033', '#00f0ff', '#ffaa00', '#00ff88'][i] : 'rgba(255,255,255,0.08)',
              boxShadow: phase === p ? `0 0 10px ${['#ff0033', '#00f0ff', '#ffaa00', '#00ff88'][i]}80` : 'none',
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }} />
            <span className="text-[12px] font-mono uppercase tracking-[0.3em]" style={{
              color: phase === p ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.12)',
            }}>{p}</span>
          </div>
        ))}
      </div>

      {/* Power level display */}
      <div className="absolute top-6 right-6 z-[6] text-right">
        <div className="text-[12px] font-mono tracking-[0.3em] text-white/50 mb-1">POWER LEVEL</div>
        <div className="font-hud text-2xl font-bold" style={{
          color: percent > 80 ? '#ff0033' : percent > 50 ? '#ffaa00' : '#00f0ff',
          textShadow: `0 0 20px ${percent > 80 ? 'rgba(255,0,51,0.5)' : percent > 50 ? 'rgba(255,170,0,0.4)' : 'rgba(0,240,255,0.4)'}`,
        }}>
          {String(percent).padStart(3, '0')}
          <span className="text-xs text-white/50 ml-1">%</span>
        </div>
      </div>

      {/* Corner brackets */}
      {[
        'top-4 left-4 border-l-2 border-t-2',
        'top-4 right-4 border-r-2 border-t-2',
        'bottom-4 left-4 border-l-2 border-b-2',
        'bottom-4 right-4 border-r-2 border-b-2',
      ].map((pos, i) => (
        <div key={i} className={`absolute w-10 h-10 z-[6] ${pos}`} style={{
          borderColor: `rgba(255,0,51,${0.2 + Math.sin(Date.now() / 500 + i) * 0.15})`,
        }} />
      ))}

      {/* TARGET LOCKED overlay */}
      {targetLocked && (
        <div className="absolute inset-0 z-[7] flex items-center justify-center pointer-events-none">
          <div className="text-center" style={{ animation: 'targetFlash 0.5s ease-out' }}>
            <div className="font-hud text-sm tracking-[0.5em] mb-2" style={{
              color: '#ff0033', textShadow: '0 0 20px rgba(255,0,51,0.6)',
            }}>
              ◇ TARGET LOCKED ◇
            </div>
          </div>
        </div>
      )}

      {/* EMP rings */}
      <div className="absolute inset-0 flex items-center justify-center z-[8] pointer-events-none">
        {[0, 1, 2].map(i => (
          <div key={i} className="emp-ring absolute w-16 h-16 border-2" style={{
            borderColor: ['rgba(255,0,51,0.5)', 'rgba(0,240,255,0.4)', 'rgba(255,170,0,0.3)'][i],
          }} />
        ))}
      </div>

      {/* Center content */}
      <div className="relative z-[9] text-center loader-center-content">
        {/* Rotating targeting rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-52 h-52 border border-[#ff003320]" style={{
            animation: 'hud-ring-spin 8s linear infinite',
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          }} />
          <div className="absolute w-72 h-72 border border-dashed border-[#ff003315]" style={{
            animation: 'hud-ring-spin-reverse 15s linear infinite',
          }} />
          <div className="absolute w-40 h-40 border border-[#00f0ff15]" style={{
            animation: 'hud-ring-spin 6s linear infinite',
            borderRadius: '50%',
          }} />
        </div>

        {/* Boss name */}
        <div ref={nameRef} className="relative">
          <div className="text-[12px] font-mono tracking-[0.5em] text-[#ff003380] mb-4 uppercase">
            ⚠ Final Boss Encountered ⚠
          </div>
          <h1 className={`font-hud text-5xl md:text-7xl font-black leading-none boss-name-main ${glitchActive ? 'loader-glitch-active' : ''}`}>
            <span className="text-white">{FIRST}</span>
            <span className="bg-gradient-to-r from-[#ff0033] to-[#ff4466] bg-clip-text text-transparent"> {LAST}</span>
          </h1>

          {glitchActive && (
            <>
              <h1 className="font-hud text-5xl md:text-7xl font-black absolute top-0 left-0 w-full text-center opacity-50"
                style={{ color: '#00f0ff', transform: 'translate(-4px, -2px)', clipPath: 'inset(15% 0 55% 0)' }}>
                <span>{FIRST}</span><span> {LAST}</span>
              </h1>
              <h1 className="font-hud text-5xl md:text-7xl font-black absolute top-0 left-0 w-full text-center opacity-50"
                style={{ color: '#ff0033', transform: 'translate(4px, 2px)', clipPath: 'inset(50% 0 15% 0)' }}>
                <span>{FIRST}</span><span> {LAST}</span>
              </h1>
            </>
          )}
        </div>

        {/* Title */}
        <div className="font-mono text-[13px] tracking-[0.4em] text-white/50 mt-4 uppercase">
          {personalInfo.title}
        </div>

        {/* Threat stats */}
        <div className="flex justify-center gap-8 mt-6">
          {[
            { label: 'THREAT_LVL', value: percent > 60 ? 'EXTREME' : 'RISING', color: '#ff003360' },
            { label: 'COMBAT_SYS', value: percent > 40 ? 'ONLINE' : 'LOADING', color: '#00f0ff60' },
            { label: 'SHIELD_GEN', value: percent > 80 ? 'ACTIVE' : '-.--', color: '#00ff8860' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className="text-[12px] font-mono tracking-[0.2em] text-white/45">{label}</div>
              <div className="text-xs font-mono mt-0.5" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/[0.03] z-[9]">
        <div className="h-full transition-all duration-75 linear" style={{
          width: `${percent}%`,
          background: 'linear-gradient(to right, #ff0033, #ff4466)',
          boxShadow: '0 0 20px rgba(255,0,51,0.5)',
        }} />
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes targetFlash { 0%{opacity:0;transform:scale(2)}50%{opacity:1;transform:scale(1.1)}100%{opacity:1;transform:scale(1)} }
        .loader-glitch-active { animation: loader-heavy-glitch .1s steps(1) infinite; }
        @keyframes loader-heavy-glitch {
          0%{transform:translate(0)}20%{transform:translate(-3px,2px)}40%{transform:translate(3px,-2px)}
          60%{transform:translate(-2px,-2px)}80%{transform:translate(2px,2px)}100%{transform:translate(0)}
        }
      `}</style>
    </div>
  )
}

export default Loader
