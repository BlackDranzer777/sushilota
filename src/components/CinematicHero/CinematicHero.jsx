/*
 * CinematicHero.jsx
 *
 * SCROLL ARCHITECTURE:
 *   .outer  — 250vh tall, provides scroll distance
 *   .scene  — position: sticky, top: 0, height: 100vh — stays fixed in view
 *             while the user scrolls through the 250vh outer container.
 *
 * AS USER SCROLLS (progress 0 → 1):
 *   0.00 → 0.30  — hero illustration visible, mouse parallax active
 *   0.30 → 1.00  — ink rises from bottom (WebGL FBM shader)
 *                  illustration scales down subtly (1.0 → 0.93)
 *
 * MOUSE PARALLAX:
 *   bgLeft + bgRight: slow drift (-14px / -10px)
 *   effectLayer:      fast drift opposite direction (+28px / +18px)
 *   rAF + lerp for smooth motion.
 *
 * INK SHADER:
 *   Domain-warped FBM (fbm of fbm) — organic ink blob texture.
 *   Ink rises bottom-up: uv.y=0 (bottom) fills first, uv.y=1 (top) last.
 *   Scattered blobs race ahead of main ink front.
 *   Color = --teal-deep (#026b64).
 */

import { useRef, useEffect, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './CinematicHero.module.css'

/* ── Ink color: #026b64 teal-deep in 0-1 RGB ──────────────────────── */
const INK_RGB = [0.008, 0.420, 0.392]

/* ── Vertex shader ────────────────────────────────────────────────── */
const VERT = `
  attribute vec2 a_pos;
  varying   vec2 v_uv;
  void main() {
    v_uv        = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`

/* ── Fragment shader: bottom-up domain-warped FBM ink ─────────────── */
const FRAG = `
  precision highp float;
  varying vec2  v_uv;
  uniform float u_progress;
  uniform vec3  u_color;

  float hash(vec2 p) {
    p  = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 74.4);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),               hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    vec2  s = vec2(3.14159, 1.618);
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p  = p * 2.1 + s;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = v_uv;
    /* uv.y = 0 at bottom, 1 at top — no flip, ink rises from bottom */

    /* Domain warp: two passes of fbm feeding each other */
    vec2 q = vec2(
      fbm(uv * 2.2),
      fbm(uv * 2.2 + vec2(5.2, 1.3))
    );
    vec2 r = vec2(
      fbm(uv * 1.8 + 3.0 * q + vec2(1.7, 9.2)),
      fbm(uv * 1.8 + 3.0 * q + vec2(8.3, 2.8))
    );
    float n = fbm(uv * 1.5 + 2.5 * r);

    /* wave: low at bottom (uv.y=0), high at top (uv.y=1), noise-distorted */
    float wave = uv.y * 0.65 + n * 0.45;

    /* covered = 1 where wave < threshold — bottom fills first */
    float covered = 1.0 - smoothstep(
      u_progress * 1.2 - 0.10,
      u_progress * 1.2 + 0.10,
      wave
    );

    /* scattered ink blobs that race ahead of the main front */
    float blobs = step(1.0 - n * 0.4, u_progress * 1.5) * 0.65;

    float ink = clamp(covered + blobs, 0.0, 1.0);
    gl_FragColor = vec4(u_color, ink);
  }
`

export default function CinematicHero() {
  const outerRef   = useRef(null)   /* 250vh scroll container          */
  const bgLeftRef  = useRef(null)
  const bgRightRef = useRef(null)
  const effectRef  = useRef(null)
  const canvasRef  = useRef(null)
  const drawRef    = useRef(null)   /* { draw(progress) } set by WebGL */

  /* ── Mouse parallax ──────────────────────────────────────────────── */
  useEffect(() => {
    let rafId
    let tx = 0, ty = 0
    let cx = 0, cy = 0

    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth  - 0.5) * 2
      ty = (e.clientY / window.innerHeight - 0.5) * 2
    }

    const tick = () => {
      cx += (tx - cx) * 0.07
      cy += (ty - cy) * 0.07
      gsap.set(bgLeftRef.current,  { x: cx * -14, y: cy * -10 })
      gsap.set(bgRightRef.current, { x: cx * -14, y: cy * -10 })
      gsap.set(effectRef.current,  { x: cx * 28,  y: cy * 18  })
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    rafId = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  /* ── WebGL ink canvas ─────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
    if (!gl) { console.warn('CinematicHero: WebGL unavailable'); return }

    const compile = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.error(gl.getShaderInfoLog(s))
      return s
    }

    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl.VERTEX_SHADER,   VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    /* Fullscreen quad */
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
    const posLoc = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const uProg = gl.getUniformLocation(prog, 'u_progress')
    const uCol  = gl.getUniformLocation(prog, 'u_color')
    gl.uniform3f(uCol, INK_RGB[0], INK_RGB[1], INK_RGB[2])
    gl.uniform1f(uProg, 0.0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const resize = () => {
      canvas.width  = window.innerWidth  * devicePixelRatio
      canvas.height = window.innerHeight * devicePixelRatio
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    drawRef.current = {
      draw(p) {
        gl.uniform1f(uProg, p)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      },
    }

    return () => window.removeEventListener('resize', resize)
  }, [])

  /* ── GSAP ScrollTrigger: scale + ink ────────────────────────────── */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: outerRef.current,
        start:   'top top',
        end:     'bottom top',   /* scroll through full 250vh */
        scrub:   true,

        onUpdate(self) {
          const p = self.progress   /* 0 → 1 */

          /* Subtle scale down: 1.0 → 0.93 */
          const scale = 1 - p * 0.07
          gsap.set(bgLeftRef.current,  { scale })
          gsap.set(bgRightRef.current, { scale })
          gsap.set(effectRef.current,  { scale })

          /* Ink starts rising at 30% scroll progress */
          const inkP = Math.max(0, (p - 0.3) / 0.7)
          drawRef.current?.draw(inkP)
        },
      })
    }, outerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={outerRef} className={styles.outer} id="hero" aria-label="Hero">
      <div className={styles.scene}>

        {/* Left half of hero.png */}
        <div ref={bgLeftRef} className={styles.bgLeft}>
          <img src="/illustrations/hero.png" alt="" aria-hidden="true" draggable="false" />
        </div>

        {/* Right half of hero.png */}
        <div ref={bgRightRef} className={styles.bgRight}>
          <img src="/illustrations/hero.png" alt="" aria-hidden="true" draggable="false" />
        </div>

        {/* effect.png overlay — mix-blend-mode: screen removes black */}
        <div ref={effectRef} className={styles.effectLayer} aria-hidden="true" />

        {/* WebGL ink canvas — above all illustration layers */}
        <canvas ref={canvasRef} className={styles.inkCanvas} aria-hidden="true" />

        {/* Scroll hint */}
        <div className={styles.scrollHint} aria-hidden="true">
          <span className={styles.scrollLine} />
          <span className={styles.scrollText}>Scroll</span>
        </div>

      </div>
    </section>
  )
}
