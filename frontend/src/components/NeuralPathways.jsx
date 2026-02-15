import React, { useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  NeuralPathways → FULL HUD COMBAT OVERLAY
 *  Matrix rain, hex particles, data streams, drifting scan lines,
 *  threat radar blips, ambient dust, energy arcs — the full works
 * ═══════════════════════════════════════════════════════════════ */

const NeuralPathways = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // ═══ DATA RAIN columns (matrix-style) ═══
    const fontSize = 12
    const getColumns = () => Math.floor(canvas.width / fontSize)
    let columns = getColumns()
    let drops = Array.from({ length: columns }, () => Math.random() * -100)
    const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%<>{}[]|/\\=+-*&^~'.split('')

    window.addEventListener('resize', () => {
      resize()
      columns = getColumns()
      drops = Array.from({ length: columns }, () => Math.random() * -100)
    })

    // ═══ HEX PARTICLES floating field ═══
    const hexParticles = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.15 - Math.random() * 0.3,
      size: 3 + Math.random() * 6,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.01,
      alpha: 0.02 + Math.random() * 0.03,
      color: Math.random() > 0.6 ? 'cyan' : 'red',
    }))

    // ═══ SCAN LINES ═══
    const scanLines = Array.from({ length: 10 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      isVertical: i % 2 === 0,
      speed: 0.12 + Math.random() * 0.3,
      alpha: 0.015 + Math.random() * 0.02,
    }))

    // ═══ THREAT BLIPS on radar ═══
    const blips = Array.from({ length: 12 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 0.2 + Math.random() * 0.4,
      size: 1 + Math.random() * 2,
      blink: Math.random() * Math.PI * 2,
    }))

    // ═══ AMBIENT DUST ═══
    const dust = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.15,
      size: 0.5 + Math.random() * 1,
      alpha: 0.03 + Math.random() * 0.04,
    }))

    // ═══ HORIZONTAL DATA STREAMS ═══
    const dataStreams = Array.from({ length: 4 }, () => ({
      y: Math.random() * window.innerHeight,
      x: -200,
      speed: 1 + Math.random() * 2,
      text: '',
      timer: Math.random() * 300,
      active: false,
    }))

    let frameCount = 0
    const draw = () => {
      const w = canvas.width, h = canvas.height
      frameCount++
      const time = Date.now() / 1000

      // Clear canvas each frame (no accumulating darkness)
      ctx.clearRect(0, 0, w, h)

      // ═══ MATRIX DATA RAIN ═══
      ctx.font = `${fontSize}px JetBrains Mono, monospace`
      for (let i = 0; i < columns; i++) {
        // Only render every 3rd column for subtlety
        if (i % 3 !== 0) continue
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        // Gradient: bright at head, fade behind
        const headAlpha = 0.08
        ctx.fillStyle = `rgba(255,0,51,${headAlpha})`
        ctx.fillText(char, x, y)

        // Occasionally use cyan
        if (Math.random() > 0.97) {
          ctx.fillStyle = 'rgba(0,240,255,0.06)'
          ctx.fillText(char, x, y)
        }

        if (y > h && Math.random() > 0.98) drops[i] = 0
        drops[i] += 0.4 + Math.random() * 0.2
      }

      // ═══ SCAN LINES ═══
      scanLines.forEach(line => {
        ctx.strokeStyle = `rgba(255,0,51,${line.alpha})`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        if (line.isVertical) {
          line.x = (line.x + line.speed) % w
          ctx.moveTo(line.x, 0); ctx.lineTo(line.x, h)
        } else {
          line.y = (line.y + line.speed) % h
          ctx.moveTo(0, line.y); ctx.lineTo(w, line.y)
        }
        ctx.stroke()
      })

      // ═══ HEX PARTICLES ═══
      hexParticles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotSpeed

        // Wrap around
        if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w }
        if (p.x < -20) p.x = w + 20
        if (p.x > w + 20) p.x = -20

        // Draw hexagon
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6
          const px = Math.cos(angle) * p.size
          const py = Math.sin(angle) * p.size
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.strokeStyle = p.color === 'cyan' ? `rgba(0,240,255,${p.alpha})` : `rgba(255,0,51,${p.alpha})`
        ctx.lineWidth = 0.6
        ctx.stroke()
        ctx.restore()
      })

      // ═══ AMBIENT DUST ═══
      dust.forEach(d => {
        d.x += d.vx
        d.y += d.vy
        if (d.x < 0) d.x = w
        if (d.x > w) d.x = 0
        if (d.y < 0) d.y = h
        if (d.y > h) d.y = 0

        ctx.fillStyle = `rgba(255,255,255,${d.alpha})`
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2)
        ctx.fill()
      })

      // ═══ CORNER HUD RADARS ═══
      const corners = [[80, 80], [w - 80, 80], [80, h - 80], [w - 80, h - 80]]
      corners.forEach(([cx, cy], ci) => {
        const miniR = 40
        // Radar ring
        ctx.strokeStyle = 'rgba(255,0,51,0.02)'
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.arc(cx, cy, miniR, 0, Math.PI * 2)
        ctx.stroke()
        // Cross
        ctx.beginPath()
        ctx.moveTo(cx - miniR, cy); ctx.lineTo(cx + miniR, cy)
        ctx.moveTo(cx, cy - miniR); ctx.lineTo(cx, cy + miniR)
        ctx.stroke()
        // Sweep
        const sweepAngle = time * 1.5 + ci * 1.5
        ctx.strokeStyle = 'rgba(255,0,51,0.04)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + Math.cos(sweepAngle) * miniR, cy + Math.sin(sweepAngle) * miniR)
        ctx.stroke()
        // Blips
        blips.slice(ci * 3, ci * 3 + 3).forEach(b => {
          b.blink += 0.05
          const bx = cx + Math.cos(b.angle) * miniR * b.dist
          const by = cy + Math.sin(b.angle) * miniR * b.dist
          const balpha = 0.03 + Math.sin(b.blink) * 0.02
          ctx.fillStyle = `rgba(0,240,255,${balpha})`
          ctx.beginPath()
          ctx.arc(bx, by, b.size, 0, Math.PI * 2)
          ctx.fill()
        })
      })

      // ═══ DATA STREAMS (horizontal text scrolling) ═══
      dataStreams.forEach(stream => {
        if (!stream.active) {
          stream.timer--
          if (stream.timer <= 0) {
            stream.active = true
            stream.x = -200
            stream.y = 50 + Math.random() * (h - 100)
            const hexChars = '0123456789ABCDEF'
            stream.text = Array.from({ length: 20 }, () => hexChars[Math.floor(Math.random() * 16)]).join(' ')
          }
        }
        if (stream.active) {
          stream.x += stream.speed
          ctx.font = '8px JetBrains Mono, monospace'
          ctx.fillStyle = 'rgba(0,240,255,0.04)'
          ctx.fillText(stream.text, stream.x, stream.y)
          if (stream.x > w + 200) {
            stream.active = false
            stream.timer = 200 + Math.random() * 400
          }
        }
      })

      // ═══ BORDER ENERGY LINES ═══
      const borderGlow = Math.sin(time * 2) * 0.01 + 0.015
      // Top
      ctx.strokeStyle = `rgba(255,0,51,${borderGlow})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, 2); ctx.lineTo(w, 2)
      ctx.stroke()
      // Bottom
      ctx.beginPath()
      ctx.moveTo(0, h - 2); ctx.lineTo(w, h - 2)
      ctx.stroke()
      // Left
      ctx.beginPath()
      ctx.moveTo(2, 0); ctx.lineTo(2, h)
      ctx.stroke()
      // Right
      ctx.beginPath()
      ctx.moveTo(w - 2, 0); ctx.lineTo(w - 2, h)
      ctx.stroke()

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ opacity: 0.35 }}
    />
  )
}

export default NeuralPathways
