/*
 * CursorPaint.jsx
 *
 * Dynamic paint-brush cursor effect.
 * Replaces CursorLens entirely — no SVG displacement filter on <main>.
 *
 * HOW IT WORKS:
 *   • Full-screen fixed canvas, pointer-events: none, z-index: 9999.
 *   • Tracks mouse position, records points with { x, y, width, time, color }.
 *   • Brush width = slow → thick, fast → thin  (like dipping brush in paint).
 *   • Color cycles through a vibrant palette every ~150px of travel.
 *   • Each segment is drawn as BRISTLES separate lines offset perpendicularly —
 *     outer bristles thinner + more transparent, centre bristle thickest.
 *   • Every point fades out over MAX_AGE ms using an eased alpha curve.
 *   • Cursor indicator: filled dot + faint outer ring (current color).
 */

import { useEffect, useRef } from 'react'

/* ── Brand-adjacent paint palette ────────────────────────────────── */
const PALETTE = [
  '#F4855F',   /* warm orange  */
  '#5DB8A8',   /* teal         */
  '#E8779C',   /* rose / pink  */
  '#C4A253',   /* golden       */
  '#9B7FD4',   /* lavender     */
  '#6FB8D4',   /* sky blue     */
]

const BRISTLES   = 7       /* lines drawn per segment                     */
const MAX_AGE    = 2600    /* ms until point is fully transparent          */
const COLOR_DIST = 150     /* px of cursor travel between color changes    */
const MAX_PTS    = 700     /* hard cap on stored points                    */

export default function CursorPaint() {
  const cvRef = useRef(null)

  useEffect(() => {
    const cv  = cvRef.current
    const ctx = cv.getContext('2d')

    /* ── Resize to full DPR-scaled canvas ──────────────────────── */
    const resize = () => {
      const dpr  = Math.min(devicePixelRatio || 1, 2)
      cv.width   = window.innerWidth  * dpr
      cv.height  = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    /* Hide default cursor */
    document.body.style.cursor = 'none'

    /* ── State ─────────────────────────────────────────────────── */
    let pts      = []   /* { x, y, w, t, color } */
    let cx = -1, cy = -1
    let prevX = -1, prevY = -1, prevT = 0
    let colorIdx = 0
    let distAcc  = 0

    /* ── Mouse handler ─────────────────────────────────────────── */
    const onMove = e => {
      const x = e.clientX
      const y = e.clientY
      const t = performance.now()

      cx = x
      cy = y

      if (prevX < 0) { prevX = x; prevY = y; prevT = t; return }

      const dx   = x - prevX
      const dy   = y - prevY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 1.5) return   /* skip sub-pixel jitter */

      const dt    = Math.max(1, t - prevT)
      const speed = dist / dt                        /* px / ms */

      /* Thick when slow, thin when fast */
      const w = Math.max(1.5, Math.min(24, 24 - speed * 80))

      distAcc += dist
      if (distAcc >= COLOR_DIST) {
        distAcc  = 0
        colorIdx = (colorIdx + 1) % PALETTE.length
      }

      pts.push({ x, y, w, t, color: PALETTE[colorIdx] })
      if (pts.length > MAX_PTS) pts.shift()

      prevX = x; prevY = y; prevT = t
    }

    window.addEventListener('mousemove', onMove, { passive: true })

    /* ── Draw one segment a→b with bristle lines ─────────────── */
    const drawSegment = (a, b, alpha) => {
      const angle = Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2
      const w     = (a.w + b.w) / 2

      for (let br = 0; br < BRISTLES; br++) {
        /* t: -0.5 (left edge) → +0.5 (right edge) */
        const t     = br / (BRISTLES - 1) - 0.5
        const edge  = Math.abs(t * 2)          /* 0 at centre, 1 at edge */

        const bOff  = t * w * 0.85
        const ox    = Math.cos(angle) * bOff
        const oy    = Math.sin(angle) * bOff

        /* Centre bristles: thicker + more opaque */
        const bAlpha = alpha * (0.72 - 0.46 * edge)
        const bW     = Math.max(0.4, (w / BRISTLES) * (0.9 - 0.5 * edge))

        if (bAlpha < 0.01) continue

        ctx.beginPath()
        ctx.moveTo(a.x + ox, a.y + oy)

        /* Slight quadratic nudge for a natural hand-painted curve */
        const mx = (a.x + b.x) / 2 + ox
        const my = (a.y + b.y) / 2 + oy
        ctx.quadraticCurveTo(a.x + ox + (b.x - a.x) * 0.25,
                             a.y + oy + (b.y - a.y) * 0.25,
                             mx, my)
        ctx.lineTo(b.x + ox, b.y + oy)

        ctx.strokeStyle = a.color
        ctx.globalAlpha = bAlpha
        ctx.lineWidth   = bW
        ctx.lineCap     = 'round'
        ctx.lineJoin    = 'round'
        ctx.stroke()
      }
    }

    /* ── rAF loop ──────────────────────────────────────────────── */
    let raf
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const now = performance.now()

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      ctx.globalAlpha = 1

      /* Expire old points from front */
      while (pts.length && now - pts[0].t > MAX_AGE) pts.shift()

      /* Draw all segments */
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1]
        const b = pts[i]

        /* Don't draw across a color boundary */
        if (a.color !== b.color) continue

        const age   = now - b.t
        const alpha = Math.pow(Math.max(0, 1 - age / MAX_AGE), 1.7)
        if (alpha < 0.01) continue

        drawSegment(a, b, alpha)
      }

      /* ── Cursor indicator ──────────────────────────────────── */
      if (cx >= 0) {
        const col = PALETTE[colorIdx]

        /* Filled dot */
        ctx.globalAlpha = 1
        ctx.beginPath()
        ctx.arc(cx, cy, 4.5, 0, Math.PI * 2)
        ctx.fillStyle = col
        ctx.fill()

        /* Outer ring */
        ctx.beginPath()
        ctx.arc(cx, cy, 9, 0, Math.PI * 2)
        ctx.strokeStyle = col
        ctx.globalAlpha = 0.38
        ctx.lineWidth   = 1.2
        ctx.stroke()

        ctx.globalAlpha = 1
      }
    }

    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      document.body.style.cursor = ''
    }
  }, [])

  return (
    <canvas
      ref={cvRef}
      aria-hidden="true"
      style={{
        position:      'fixed',
        inset:         0,
        width:         '100vw',
        height:        '100vh',
        pointerEvents: 'none',
        zIndex:        9999,
      }}
    />
  )
}
