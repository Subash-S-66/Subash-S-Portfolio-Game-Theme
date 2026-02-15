import React, { useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  TARGETING RETICLE CURSOR — Boss Battle Edition
 *  Crosshair cursor with corner brackets, scan pulse on click,
 *  morph to lock-on when hovering interactive elements
 * ═══════════════════════════════════════════════════════════════ */

const CustomCursor = () => {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const glowRef = useRef(null)
  const mouse = useRef({ x: -100, y: -100 })
  const ringPos = useRef({ x: -100, y: -100 })
  const isHovering = useRef(false)
  const isDown = useRef(false)
  const isTouchDevice = useRef(false)
  const rafRef = useRef(null)
  const velocity = useRef({ x: 0, y: 0 })
  const prevMouse = useRef({ x: -100, y: -100 })

  useEffect(() => {
    const onTouch = () => { isTouchDevice.current = true }
    const onMouse = () => { isTouchDevice.current = false }
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('mousemove', onMouse, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  useEffect(() => {
    const onMove = (e) => {
      velocity.current.x = e.clientX - prevMouse.current.x
      velocity.current.y = e.clientY - prevMouse.current.y
      prevMouse.current = { x: e.clientX, y: e.clientY }
      mouse.current = { x: e.clientX, y: e.clientY }

      const dotEl = dotRef.current
      if (dotEl) {
        dotEl.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px) ${isDown.current ? 'scale(2)' : 'scale(1)'}`
      }
      const glowEl = glowRef.current
      if (glowEl) {
        glowEl.style.transform = `translate(${e.clientX - 60}px, ${e.clientY - 60}px)`
        const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2)
        glowEl.style.opacity = `${Math.min(0.06 + speed * 0.003, 0.15)}`
      }
    }
    const onDown = () => {
      isDown.current = true
      if (dotRef.current) dotRef.current.style.transform = `translate(${mouse.current.x - 3}px, ${mouse.current.y - 3}px) scale(2.5)`
      if (ringRef.current) ringRef.current.style.opacity = '0.3'
    }
    const onUp = () => {
      isDown.current = false
      if (dotRef.current) dotRef.current.style.transform = `translate(${mouse.current.x - 3}px, ${mouse.current.y - 3}px) scale(1)`
      if (ringRef.current) ringRef.current.style.opacity = '1'
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  useEffect(() => {
    const selectors = 'a, button, input, textarea, [role="button"], .magnetic, [data-cursor]'
    const enterHandler = () => {
      isHovering.current = true
      const ringEl = ringRef.current
      if (ringEl) {
        ringEl.style.width = '60px'
        ringEl.style.height = '60px'
        ringEl.style.borderColor = 'rgba(0, 240, 255, 0.6)'
        ringEl.style.boxShadow = '0 0 25px rgba(0,240,255,0.2), inset 0 0 25px rgba(0,240,255,0.05)'
        ringEl.style.clipPath = 'none'
        ringEl.style.borderRadius = '50%'
      }
      if (dotRef.current) {
        dotRef.current.style.backgroundColor = '#00f0ff'
        dotRef.current.style.boxShadow = '0 0 10px #00f0ff, 0 0 20px rgba(0,240,255,0.5)'
      }
    }
    const leaveHandler = () => {
      isHovering.current = false
      const ringEl = ringRef.current
      if (ringEl) {
        ringEl.style.width = '44px'
        ringEl.style.height = '44px'
        ringEl.style.borderColor = 'rgba(255, 0, 51, 0.5)'
        ringEl.style.boxShadow = '0 0 15px rgba(255,0,51,0.15), inset 0 0 15px rgba(255,0,51,0.05)'
        ringEl.style.clipPath = 'polygon(0 30%,0 0,30% 0,70% 0,100% 0,100% 30%,100% 70%,100% 100%,70% 100%,30% 100%,0 100%,0 70%)'
        ringEl.style.borderRadius = '0'
      }
      if (dotRef.current) {
        dotRef.current.style.backgroundColor = '#ff0033'
        dotRef.current.style.boxShadow = '0 0 8px #ff0033, 0 0 20px rgba(255,0,51,0.4)'
      }
    }
    const attached = new WeakSet()
    const attach = (el) => {
      if (attached.has(el)) return
      attached.add(el)
      el.addEventListener('mouseenter', enterHandler)
      el.addEventListener('mouseleave', leaveHandler)
    }
    document.querySelectorAll(selectors).forEach(attach)
    let debounceTimer
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => document.querySelectorAll(selectors).forEach(attach), 200)
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => { clearTimeout(debounceTimer); observer.disconnect() }
  }, [])

  useEffect(() => {
    const animate = () => {
      if (isTouchDevice.current) {
        if (dotRef.current) dotRef.current.style.opacity = '0'
        if (ringRef.current) ringRef.current.style.opacity = '0'
        if (glowRef.current) glowRef.current.style.opacity = '0'
        rafRef.current = requestAnimationFrame(animate)
        return
      }
      const lerp = isHovering.current ? 0.2 : 0.12
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * lerp
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * lerp
      const ringEl = ringRef.current
      if (ringEl) {
        const size = isHovering.current ? 60 : 44
        ringEl.style.transform = `translate(${ringPos.current.x - size / 2}px, ${ringPos.current.y - size / 2}px)`
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <>
      <div ref={glowRef} style={{
        position: 'fixed', top: 0, left: 0, width: 140, height: 140, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,0,51,0.12) 0%, rgba(255,0,51,0.04) 30%, transparent 70%)',
        pointerEvents: 'none', zIndex: 9996, opacity: 0, willChange: 'transform',
        filter: 'blur(2px)',
      }} />
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </>
  )
}

export default CustomCursor
