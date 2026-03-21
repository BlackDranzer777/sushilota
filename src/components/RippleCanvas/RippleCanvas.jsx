/*
 * RippleCanvas.jsx
 *
 * A fixed, full-viewport Canvas2D layer that renders concentric ripple
 * rings wherever the mouse moves. Sits above every section with
 * mix-blend-mode: screen — visible on both dark and light content,
 * even over text. pointer-events: none so it never blocks interaction.
 *
 * Ripple lifecycle:
 *   progress 0 → 1 over ~0.85s (50 frames @ 60fps)
 *   radius   = easeOut(progress) × MAX_R  (fast expand, slows near edge)
 *   alpha    = (1 - progress) × PEAK      (linear fade)
 *   lineWidth shrinks as ring expands
 *
 * Spawn rule: new ripple when mouse moves > MIN_DIST px OR > INTERVAL ms.
 */

import { useEffect, useRef } from 'react'

const MAX_R     = 72    /* px — max ring radius          */
const SPEED     = 0.02  /* progress per frame            */
const PEAK_A    = 0.55  /* alpha at progress 0           */
const MIN_DIST  = 28    /* px — min movement to spawn    */
const INTERVAL  = 80    /* ms — max time between spawns  */

export default function RippleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    /* Size canvas to viewport at device resolution */
    const resize = () => {
      const dpr = devicePixelRatio || 1
      canvas.width  = window.innerWidth  * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    /* Active ripples pool */
    const ripples = []

    /* Spawn tracking */
    let lastX = -999, lastY = -999, lastSpawn = 0

    const spawn = (x, y) => {
      ripples.push({ x, y, progress: 0 })
      lastX = x; lastY = y; lastSpawn = Date.now()
    }

    const onMove = (e) => {
      const dx   = e.clientX - lastX
      const dy   = e.clientY - lastY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const now  = Date.now()

      if (dist >= MIN_DIST || now - lastSpawn >= INTERVAL) {
        spawn(e.clientX, e.clientY)
      }
    }

    let rafId
    const tick = () => {
      rafId = requestAnimationFrame(tick)

      /* Clear previous frame */
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]
        rp.progress += SPEED

        if (rp.progress >= 1) { ripples.splice(i, 1); continue }

        /* Ease-out expansion: fast at first, slows near edge */
        const eased = 1 - Math.pow(1 - rp.progress, 2.2)
        const r     = eased * MAX_R
        const alpha = (1 - rp.progress) * PEAK_A

        /* Outer ring */
        ctx.beginPath()
        ctx.arc(rp.x, rp.y, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 231, 217, ${alpha})`
        ctx.lineWidth   = 1.2 - rp.progress * 0.8   /* thickens → thins */
        ctx.stroke()

        /* Inner ghost ring — half-radius, softer */
        if (r > 14) {
          ctx.beginPath()
          ctx.arc(rp.x, rp.y, r * 0.52, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255, 231, 217, ${alpha * 0.35})`
          ctx.lineWidth   = 0.7
          ctx.stroke()
        }
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:      'fixed',
        inset:         0,
        width:         '100vw',
        height:        '100vh',
        pointerEvents: 'none',
        zIndex:        9000,
        mixBlendMode:  'screen',
      }}
    />
  )
}
