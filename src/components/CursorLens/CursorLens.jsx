/*
 * CursorLens.jsx
 *
 * A glass-lens distortion effect that follows the cursor and actually
 * warps the DOM pixels beneath it — text, images, backgrounds, all of it.
 *
 * HOW IT WORKS:
 *   1. Precompute a 220×220 displacement map canvas (once on mount).
 *      Each pixel encodes an outward push vector:
 *        R channel → x displacement  (128 = none, >128 = right, <128 = left)
 *        G channel → y displacement  (128 = none)
 *      Profile: sin(nd·π) bell curve — zero at center + edge, peaks midway.
 *      This creates a magnification lens: content inside appears enlarged.
 *
 *   2. An SVG <filter> uses feFlood (neutral gray everywhere) + feImage
 *      (the precomputed lens at cursor position) composited together as
 *      the displacement map source for feDisplacementMap.
 *      Applied to <main> via CSS filter: url(#cursor-lens).
 *      Coordinates: pageX/pageY (document space) so it tracks through scroll.
 *
 *   3. A Canvas2D overlay (position: fixed) draws the glass lens visual:
 *        - Three chromatic rings (R, G, B offset) at lens boundary
 *        - Radial specular highlight (upper-left, like a glass sphere)
 *        - Subtle inner fill gradient
 *      mix-blend-mode: screen → visible over dark + light content and text.
 */

import { useEffect, useRef } from 'react'

const RADIUS = 100   /* lens radius in CSS px                           */
const SCALE  = 30    /* feDisplacementMap scale — distortion strength   */
const D      = RADIUS * 2

export default function CursorLens() {
  const feImageRef = useRef(null)
  const rimRef     = useRef(null)

  useEffect(() => {
    /* ── 1. Precompute lens displacement texture ──────────────────
     *
     * For each pixel (px, py) inside the circle:
     *   nd       = normalised dist from center (0..1)
     *   strength = sin(nd·π) · 0.55  — smooth bell, 0 at both ends
     *   R        = 128 - nx · strength · 127   (push outward)
     *   G        = 128 - ny · strength · 127
     *
     * "Push outward" means: pixels inside appear magnified —
     * the lens samples from a position closer to the center.
     * ──────────────────────────────────────────────────────────── */
    const offscreen = document.createElement('canvas')
    offscreen.width  = D
    offscreen.height = D
    const octx    = offscreen.getContext('2d')
    const imgData = octx.createImageData(D, D)
    const pxl     = imgData.data

    for (let py = 0; py < D; py++) {
      for (let px = 0; px < D; px++) {
        const dx   = px - RADIUS
        const dy   = py - RADIUS
        const dist = Math.sqrt(dx * dx + dy * dy)
        const i    = (py * D + px) * 4

        if (dist >= RADIUS) {
          pxl[i] = pxl[i + 1] = pxl[i + 2] = 128
        } else {
          const nd  = dist / RADIUS
          const str = Math.sin(nd * Math.PI) * 0.55
          const nx  = dist > 0 ? dx / dist : 0
          const ny  = dist > 0 ? dy / dist : 0
          pxl[i]     = Math.round(Math.max(0, Math.min(255, 128 - nx * str * 127)))
          pxl[i + 1] = Math.round(Math.max(0, Math.min(255, 128 - ny * str * 127)))
          pxl[i + 2] = 128
        }
        pxl[i + 3] = 255
      }
    }

    octx.putImageData(imgData, 0, 0)
    const lensURL = offscreen.toDataURL()

    /* Inject href into the SVG feImage — done once */
    if (feImageRef.current) {
      feImageRef.current.setAttribute('href', lensURL)
    }

    /* ── 2. Rim overlay canvas ────────────────────────────────────
     *    Canvas2D, position: fixed — draws the lens visual.
     *    Coordinates are viewport (clientX/Y), not document space.
     * ──────────────────────────────────────────────────────────── */
    const rim = rimRef.current
    if (!rim) return

    const rCtx = rim.getContext('2d')
    const resize = () => {
      const dpr     = devicePixelRatio || 1
      rim.width  = window.innerWidth  * dpr
      rim.height = window.innerHeight * dpr
      rCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    /* ── 3. Mouse tracking + rAF ──────────────────────────────── */
    let cx = -999, cy = -999   /* current viewport cursor pos     */
    let px = -999, py = -999   /* previous (for dirty check)      */
    let pcx = -999, pcy = -999 /* lerped (smooth rim)             */

    const onMove = (e) => {
      cx = e.clientX
      cy = e.clientY

      /* feDisplacementMap needs document-space coords */
      if (feImageRef.current) {
        feImageRef.current.setAttribute('x', e.pageX - RADIUS)
        feImageRef.current.setAttribute('y', e.pageY - RADIUS)
      }
    }

    let rafId
    const tick = () => {
      rafId = requestAnimationFrame(tick)
      if (cx === px && cy === py) return
      px = cx; py = cy

      /* Lerp rim position for smoothness */
      pcx += (cx - pcx) * 0.18
      pcy += (cy - pcy) * 0.18

      const w = window.innerWidth
      const h = window.innerHeight
      rCtx.clearRect(0, 0, w, h)

      /* ── Chromatic aberration rings ─────────────────────────── */
      const chromaticRings = [
        { offset: +4, color: 'rgba(255, 80,  80,  0.65)', lw: 0.9 },
        { offset:  0, color: 'rgba(80,  255, 160, 0.45)', lw: 1.1 },
        { offset: -4, color: 'rgba(80,  130, 255, 0.65)', lw: 0.9 },
      ]
      chromaticRings.forEach(({ offset, color, lw }) => {
        rCtx.beginPath()
        rCtx.arc(pcx, pcy, RADIUS + offset, 0, Math.PI * 2)
        rCtx.strokeStyle = color
        rCtx.lineWidth   = lw
        rCtx.stroke()
      })

      /* ── Inner lens tint (subtle fill) ─────────────────────── */
      const fill = rCtx.createRadialGradient(pcx, pcy, 0, pcx, pcy, RADIUS)
      fill.addColorStop(0,   'rgba(200, 240, 220, 0.04)')
      fill.addColorStop(0.6, 'rgba(150, 210, 200, 0.06)')
      fill.addColorStop(1,   'rgba(100, 180, 180, 0.0)')
      rCtx.beginPath()
      rCtx.arc(pcx, pcy, RADIUS, 0, Math.PI * 2)
      rCtx.fillStyle = fill
      rCtx.fill()

      /* ── Specular highlight (upper-left, glass sphere look) ─── */
      const sx    = pcx - RADIUS * 0.28
      const sy    = pcy - RADIUS * 0.32
      const sGrad = rCtx.createRadialGradient(sx, sy, 0, sx, sy, RADIUS * 0.42)
      sGrad.addColorStop(0,   'rgba(255, 255, 255, 0.28)')
      sGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)')
      sGrad.addColorStop(1,   'rgba(255, 255, 255, 0.0)')
      rCtx.beginPath()
      rCtx.arc(pcx, pcy, RADIUS, 0, Math.PI * 2)
      rCtx.fillStyle = sGrad
      rCtx.fill()
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
    <>
      {/* SVG filter — hidden, referenced via CSS filter: url(#cursor-lens) */}
      <svg
        style={{ position: 'fixed', width: 0, height: 0, overflow: 'hidden' }}
        aria-hidden="true"
      >
        <defs>
          <filter
            id="cursor-lens"
            filterUnits="userSpaceOnUse"
            x="0" y="0"
            width="5000" height="80000"
            colorInterpolationFilters="sRGB"
          >
            {/* Neutral gray everywhere — zero displacement baseline */}
            <feFlood floodColor="rgb(128,128,128)" result="neutral" />

            {/* Precomputed lens placed at cursor (x/y updated via ref) */}
            <feImage
              ref={feImageRef}
              x={-D} y={-D}
              width={D} height={D}
              preserveAspectRatio="none"
              result="lens"
            />

            {/* Merge: lens overwrites neutral only inside the lens circle */}
            <feComposite in="lens" in2="neutral" operator="atop" result="map" />

            {/* Apply displacement — this is what actually warps the DOM */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={SCALE}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Canvas2D — chromatic rim + specular, drawn in viewport coords */}
      <canvas
        ref={rimRef}
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
    </>
  )
}
