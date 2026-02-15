import React, { useRef, useState, useCallback, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { API_ENDPOINTS } from '../config/api'
import { contactInfo, socialLinks } from '../data/personal'
import { Send, Terminal, CheckCircle, AlertTriangle } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
 *  CONTACT — COMMUNICATION TERMINAL
 *  Terminal-style inputs, typing effects,
 *  signal transmission animation on submit,
 *  holographic success display
 * ═══════════════════════════════════════════════════════════════ */

/* ───── Signal Wave Canvas ───── */
function SignalCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const resize = () => { canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    let raf
    const waves = Array.from({ length: 4 }, (_, i) => ({
      amplitude: 15 + i * 8,
      frequency: 0.008 + i * 0.003,
      speed: 0.015 + i * 0.008,
      phase: i * Math.PI * 0.5,
      color: i % 2 === 0 ? 'rgba(0,255,136,' : 'rgba(0,240,255,',
      y: 0.6 + i * 0.08,
    }))

    const draw = () => {
      const w = canvas.width, h = canvas.height
      ctx.clearRect(0, 0, w, h)

      waves.forEach(wave => {
        wave.phase += wave.speed
        ctx.beginPath()
        const baseY = h * wave.y
        for (let x = 0; x < w; x += 2) {
          const y = baseY + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = wave.color + '0.03)'
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // Transmission pulses
      const time = Date.now() / 1000
      for (let i = 0; i < 3; i++) {
        const px = (Math.sin(time * 0.5 + i * 2) * 0.4 + 0.5) * w
        const py = (Math.cos(time * 0.3 + i * 1.5) * 0.3 + 0.5) * h
        ctx.beginPath()
        ctx.arc(px, py, 2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,255,136,0.04)'
        ctx.fill()
        // Ring around pulse
        const ringR = (time * 20 + i * 30) % 60
        ctx.beginPath()
        ctx.arc(px, py, ringR, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0,255,136,${Math.max(0, 0.03 - ringR * 0.0005)})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[1]" />
}

const Contact = () => {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const formRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' })
  const formInView = useInView(formRef, { once: true, margin: '-60px' })

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    const { name, email, subject, message } = formData

    // Validation
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error')
      setErrorMsg('All required fields must be completed.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error')
      setErrorMsg('Invalid communication frequency (email).')
      return
    }

    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch(API_ENDPOINTS.CONTACT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setStatus('idle'), 6000)
      } else {
        setStatus('error')
        setErrorMsg(data.message || 'Transmission failed.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Communication relay offline.')
    }
  }, [formData])

  const inputFields = [
    { name: 'name', label: 'CALLSIGN', type: 'text', required: true, placeholder: 'Enter designation...' },
    { name: 'email', label: 'FREQUENCY', type: 'email', required: true, placeholder: 'comm@channel.net' },
    { name: 'subject', label: 'SUBJECT_TAG', type: 'text', required: false, placeholder: 'Mission briefing...' },
  ]

  return (
    <section id="contact" ref={sectionRef} className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 hex-grid-bg opacity-20 pointer-events-none" />

      {/* Signal wave canvas */}
      <SignalCanvas />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="mb-16">
          <motion.div initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-2 h-2 bg-[#00ff8840]" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
              <span className="font-mono text-[12px] tracking-[0.5em] text-[#00ff88cc] uppercase">Communication Channel</span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-[#00ff8815] to-transparent" />
            </div>
            <h2 className="font-hud text-3xl md:text-5xl font-black tracking-wide">
              <span className="text-white/95">COMM </span>
              <span className="bg-gradient-to-r from-[#00ff88] to-[#00cc66] bg-clip-text text-transparent">TERMINAL</span>
            </h2>
            <p className="mt-3 text-white/70 font-tactical text-sm max-w-xl tracking-wide">
              Open a secure communication channel — all transmissions are encrypted.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact info sidebar */}
          <motion.div initial={{ opacity: 0, x: -30 }}
            animate={formInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="combat-card overflow-hidden">
              <div className="p-4 border-b border-white/[0.03] relative overflow-hidden">
                <div className="absolute inset-0 animate-energy-flow opacity-30" />
                <span className="font-mono text-[11px] tracking-[0.3em] text-white/60 relative z-10">RELAY_NODES</span>
                <span className="font-mono text-[10px] text-[#00ff88aa] ml-2 animate-arc-flicker relative z-10">● ACTIVE</span>
              </div>
              <div className="p-4 space-y-4">
                {contactInfo.map((info, i) => (
                  <motion.a key={info.label} href={info.href}
                    whileHover={{ x: 4, backgroundColor: 'rgba(255,0,51,0.02)' }}
                    className="block group p-2 -mx-2 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Hover energy sweep */}
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-[#00f0ff05] to-transparent" />
                    <div className="relative z-10">
                      <div className="font-mono text-[11px] tracking-[0.3em] text-[#ff003330] mb-1 flex items-center gap-2">
                        <div className="w-1 h-1 bg-[#ff003330]" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                        {info.label.toUpperCase()}
                      </div>
                      <div className="font-mono text-[14px] text-white/75 group-hover:text-[#00f0ffaa] transition-colors truncate">
                        {info.value}
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Social links */}
              <div className="p-4 border-t border-white/[0.03]">
                <div className="font-mono text-[11px] tracking-[0.3em] text-white/55 mb-3">CHANNELS</div>
                <div className="flex gap-2">
                  {socialLinks.map((link) => (
                    <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 border border-white/[0.12] flex items-center justify-center text-white/60 font-mono text-[12px]
                        hover:border-[#ff003345] hover:text-[#ff0033aa] transition-all duration-300"
                    >
                      {link.label.slice(0, 2).toUpperCase()}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form terminal */}
          <motion.div ref={formRef}
            initial={{ opacity: 0, y: 30 }}
            animate={formInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2"
          >
            <div className="combat-card overflow-hidden">
              {/* Terminal header */}
              <div className="flex items-center gap-3 p-4 border-b border-white/[0.03] relative overflow-hidden">
                <div className="absolute inset-0 animate-energy-flow opacity-20" />
                <Terminal size={12} className="text-[#00ff8840] animate-arc-flicker relative z-10" />
                <span className="font-mono text-[11px] tracking-[0.3em] text-white/60 animate-chromatic relative z-10">
                  SECURE_TRANSMISSION.exe
                </span>
                <div className="ml-auto flex items-center gap-2 relative z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00ff8850]" style={{ animation: 'energy-pulse 2s ease-in-out infinite' }} />
                  <span className="font-mono text-[10px] text-[#00ff88aa] animate-neon-flicker">ONLINE</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-5">
                {/* Input fields */}
                {inputFields.map((field, i) => (
                  <div key={field.name} className="mb-4">
                    <label className="block font-mono text-[11px] tracking-[0.3em] text-[#ff003399] mb-1.5">
                      {field.label} {field.required && <span className="text-[#ff003350]">*</span>}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="terminal-input w-full"
                    />
                  </div>
                ))}

                {/* Message */}
                <div className="mb-5">
                  <label className="block font-mono text-[11px] tracking-[0.3em] text-[#ff003399] mb-1.5">
                    PAYLOAD <span className="text-[#ff003380]">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Compose transmission..."
                    required
                    rows={5}
                    className="terminal-input w-full resize-none"
                  />
                </div>

                {/* Status messages */}
                <AnimatePresence mode="wait">
                  {status === 'error' && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 mb-4 p-3 border border-[#ff003320] bg-[#ff003308]"
                    >
                      <AlertTriangle size={12} className="text-[#ff003360]" />
                      <span className="font-mono text-[13px] text-[#ff003360]">{errorMsg}</span>
                    </motion.div>
                  )}
                  {status === 'success' && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 mb-4 p-3 border border-[#00ff8820] bg-[#00ff8808]"
                    >
                      <CheckCircle size={12} className="text-[#00ff8860]" />
                      <span className="font-mono text-[13px] text-[#00ff8860]">TRANSMISSION SUCCESSFUL — Message delivered.</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={status === 'sending'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className={`w-full py-3 font-hud text-[14px] tracking-[0.3em] uppercase border transition-all duration-300 flex items-center justify-center gap-3
                    ${status === 'sending'
                      ? 'border-[#ffaa0030] text-[#ffaa0060] bg-[#ffaa0008] cursor-wait'
                      : 'border-[#ff003350] text-[#ff003399] bg-[#ff003310] hover:bg-[#ff003320] hover:border-[#ff003370] hover:shadow-[0_0_20px_rgba(255,0,51,0.15)]'
                    }`}
                >
                  {status === 'sending' ? (
                    <>
                      <div className="w-3 h-3 border border-[#ffaa0040] border-t-[#ffaa0080] rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
                      <span className="animate-neon-flicker">TRANSMITTING...</span>
                    </>
                  ) : (
                    <>
                      <Send size={12} />
                      SEND TRANSMISSION
                      {/* Energy sweep on button */}
                      <div className="absolute inset-0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-[#ff003310] to-transparent" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Bottom bar */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.03] bg-white/[0.005]">
                <span className="font-mono text-[10px] text-white/55">ENCRYPTION: AES-256</span>
                <span className="font-mono text-[10px] text-[#00ff88aa]">■ CHANNEL SECURE</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </section>
  )
}

export default Contact
