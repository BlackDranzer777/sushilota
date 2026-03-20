/*
 * CinematicHero.jsx
 *
 * SCROLL ARCHITECTURE:
 *   .outer  — 250vh tall, provides scroll distance
 *   .scene  — position: sticky, top: 0, height: 100vh
 *
 * RENDERING:
 *   Single WebGL canvas renders the full scene:
 *     - hero.png as a texture (object-fit: cover via u_coverScale)
 *     - Ink rises bottom-up via domain-warped FBM (same as before)
 *     - At the ink boundary: texture UVs are distorted by a second
 *       FBM pass — illustration melts / stretches into the ink.
 *   effectLayer div sits above with mix-blend-mode: screen for effect.png.
 *
 * DISTORTION DETAIL:
 *   edgeStr = bell curve peaking at inkCov ≈ 0.5 (the active boundary).
 *   Two extra FBM layers (d1, d2) drive lateral ripple + downward pull.
 *   The illustration appears to be absorbed / dragged into the rising ink.
 *
 * MOUSE PARALLAX:
 *   effectLayer: CSS transform (fast, opposite direction)
 *   Illustration texture: u_mouse uniform shifts UV (slow drift)
 *   Both lerped in shared rAF loop.
 */

import { useRef, useEffect, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './CinematicHero.module.css'

const INK_RGB = [0.373, 0.525, 0.455]   /* #5f8674 */

/* ── Vertex shader ─────────────────────────────────────────────────── */
const VERT = `
  attribute vec2 a_pos;
  varying   vec2 v_uv;
  void main() {
    v_uv        = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`

/*
 * ── Fragment shader ──────────────────────────────────────────────────
 *
 * Coordinate system:
 *   v_uv.y = 0 at bottom  (ink rises from here)
 *   v_uv.y = 1 at top
 *
 * Texture sampled with UNPACK_FLIP_Y_WEBGL = true so texture y=0
 * is also at the bottom → no y-flip needed in the shader.
 *
 * Distortion:
 *   edgeStr  — bell curve, peaks at inkCov ≈ 0.5 (the ink front)
 *   d1, d2   — high-freq FBM for fine boundary detail
 *   coverUV.x += lateral ripple (d1)
 *   coverUV.y -= downward pull toward ink (d2)   → image melts into ink
 */
const FRAG = `
  precision highp float;

  varying   vec2      v_uv;
  uniform   sampler2D u_hero;
  uniform   float     u_progress;
  uniform   vec3      u_inkColor;
  uniform   vec2      u_mouse;       /* lerped mouse, -1..1 */
  uniform   vec2      u_coverScale;  /* UV scale for object-fit: cover */

  /* ── Noise helpers ─────────────────────────────────────────────── */
  float hash(vec2 p) {
    p  = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 74.4);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
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
    for (int i = 0; i < 6; i++) { v += a * noise(p); p = p * 2.1 + s; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = v_uv;

    /* ── Domain-warped FBM for organic ink shape ─────────────────── */
    vec2 q = vec2(
      fbm(uv * 2.2),
      fbm(uv * 2.2 + vec2(5.2, 1.3))
    );
    vec2 r = vec2(
      fbm(uv * 1.8 + 3.0 * q + vec2(1.7, 9.2)),
      fbm(uv * 1.8 + 3.0 * q + vec2(8.3, 2.8))
    );
    float n = fbm(uv * 1.5 + 2.5 * r);

    /* ── Ink coverage ───────────────────────────────────────────── */
    float wave   = uv.y * 0.65 + n * 0.45;
    float inkCov = 1.0 - smoothstep(u_progress*1.2 - 0.10, u_progress*1.2 + 0.10, wave);
    float blobs  = step(1.0 - n * 0.4, u_progress * 1.5) * 0.65;
    float ink    = clamp(inkCov + blobs, 0.0, 1.0);

    /* ── Distortion: bell curve peaking at the ink front ─────────
     *   inkCov ≈ 0  → above ink, no distortion
     *   inkCov ≈ 0.5 → at the front, max distortion
     *   inkCov ≈ 1  → below ink, absorbed, no distortion needed  */
    float edgeStr = smoothstep(0.0, 0.5, inkCov)
                  * smoothstep(1.0, 0.5, inkCov)
                  * 2.2;

    /* Higher-freq noise layers for fine boundary detail */
    float d1 = fbm(uv * 5.2 + vec2(2.3, 7.1));  /* lateral */
    float d2 = fbm(uv * 4.1 + vec2(6.7, 1.8));  /* pull toward ink */

    /* ── Texture UV: cover + parallax + distortion ────────────── */
    vec2 coverUV = (uv - 0.5) * u_coverScale + 0.5;

    /* Slow mouse drift on illustration (opposite to effectLayer) */
    coverUV += u_mouse * vec2(-0.012, -0.008);

    /* Lateral ripple at boundary */
    coverUV.x += (d1 - 0.5) * edgeStr * 0.07;

    /* Downward pull: illustration stretches into rising ink */
    coverUV.y -= d2 * edgeStr * 0.12;

    coverUV = clamp(coverUV, 0.001, 0.999);

    vec4 tex = texture2D(u_hero, coverUV);

    /* ── Composite: illustration → melting tint → ink ─────────── */
    /* Tint illustration toward ink color at the boundary edge */
    vec3 tinted = mix(tex.rgb, u_inkColor, 0.55);
    vec3 col    = mix(tex.rgb, tinted, edgeStr * 0.35);

    /* Final blend: illustration fades into ink */
    col = mix(col, u_inkColor, ink);

    gl_FragColor = vec4(col, 1.0);
  }
`

export default function CinematicHero() {
  const outerRef  = useRef(null)
  const effectRef = useRef(null)  /* effect.png overlay (CSS, mix-blend-mode: screen) */
  const canvasRef = useRef(null)  /* WebGL canvas — full scene renderer               */

  /* Shared state between effects (no re-renders needed → refs) */
  const glStateRef = useRef(null) /* { gl, uProgress, uMouse, uCoverScale }           */
  const inkPRef    = useRef(0)    /* current ink progress, set by ScrollTrigger        */

  /* ── WebGL setup ───────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { alpha: false })
    if (!gl) { console.warn('CinematicHero: WebGL unavailable'); return }

    /* Clear to mint background so there's no black flash before texture loads */
    gl.clearColor(0.608, 0.863, 0.765, 1.0)   /* approx --mint */

    /* Compile helpers */
    const compile = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src); gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.error('Shader error:', gl.getShaderInfoLog(s))
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

    /* Uniforms */
    const uProgress   = gl.getUniformLocation(prog, 'u_progress')
    const uInkColor   = gl.getUniformLocation(prog, 'u_inkColor')
    const uMouse      = gl.getUniformLocation(prog, 'u_mouse')
    const uCoverScale = gl.getUniformLocation(prog, 'u_coverScale')
    const uHero       = gl.getUniformLocation(prog, 'u_hero')

    gl.uniform3f(uInkColor, INK_RGB[0], INK_RGB[1], INK_RGB[2])
    gl.uniform1f(uProgress, 0.0)
    gl.uniform2f(uMouse, 0.0, 0.0)
    gl.uniform2f(uCoverScale, 1.0, 1.0)
    gl.uniform1i(uHero, 0)

    /* Texture */
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    /* Placeholder 1×1 pixel while image loads */
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([155, 220, 195, 255]))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    const img = new Image()
    img.src = '/illustrations/hero.png'
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      /* UNPACK_FLIP_Y_WEBGL: rows flipped so y=0 is at bottom, matching v_uv */
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)

      /* Compute cover scale: fill viewport, crop excess (object-fit: cover).
       * sx/sy must be ≤ 1 — they define how much of the texture to sample.
       * Viewport wider than image → crop height (sy < 1, sx = 1).
       * Image wider than viewport → crop width  (sx < 1, sy = 1).        */
      const vpAspect  = canvas.width  / canvas.height
      const imgAspect = img.naturalWidth / img.naturalHeight
      const sx = vpAspect > imgAspect ? 1.0 : vpAspect / imgAspect
      const sy = vpAspect > imgAspect ? imgAspect / vpAspect : 1.0
      gl.uniform2f(uCoverScale, sx, sy)
    }

    /* Resize */
    const resize = () => {
      canvas.width  = window.innerWidth  * devicePixelRatio
      canvas.height = window.innerHeight * devicePixelRatio
      gl.viewport(0, 0, canvas.width, canvas.height)
      /* Recompute cover scale after resize */
      if (img.complete && img.naturalWidth > 0) {
        const vpA = canvas.width / canvas.height
        const imgA = img.naturalWidth / img.naturalHeight
        const sx   = vpA > imgA ? 1.0 : vpA / imgA
        const sy   = vpA > imgA ? imgA / vpA : 1.0
        gl.uniform2f(uCoverScale, sx, sy)
      }
    }
    resize()
    window.addEventListener('resize', resize)

    glStateRef.current = { gl, uProgress, uMouse }

    return () => window.removeEventListener('resize', resize)
  }, [])

  /* ── Mouse parallax + WebGL redraw (shared rAF loop) ────────────── */
  useEffect(() => {
    let rafId
    let tx = 0, ty = 0, cx = 0, cy = 0

    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth  - 0.5) * 2
      ty = (e.clientY / window.innerHeight - 0.5) * 2
    }

    const tick = () => {
      cx += (tx - cx) * 0.07
      cy += (ty - cy) * 0.07

      /* effect.png — fast drift, opposite direction */
      gsap.set(effectRef.current, { x: cx * 28, y: cy * 18 })

      /* WebGL: update mouse uniform + redraw every frame */
      const s = glStateRef.current
      if (s) {
        const { gl, uProgress, uMouse } = s
        gl.uniform2f(uMouse, cx, cy)
        gl.uniform1f(uProgress, inkPRef.current)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      }

      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    rafId = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  /* ── GSAP ScrollTrigger: ink progress ───────────────────────────── */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: outerRef.current,
        start:   'top top',
        end:     'bottom top',
        scrub:   true,
        onUpdate(self) {
          /* Ink starts at 30% scroll, completes at 100% */
          inkPRef.current = Math.max(0, (self.progress - 0.3) / 0.7)
        },
      })
    }, outerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={outerRef} className={styles.outer} id="hero" aria-label="Hero">
      <div className={styles.scene}>

        {/* Full-scene WebGL renderer: illustration + ink distortion */}
        <canvas ref={canvasRef} className={styles.inkCanvas} aria-hidden="true" />

        {/* effect.png overlay — mix-blend-mode: screen removes black bg */}
        <div ref={effectRef} className={styles.effectLayer} aria-hidden="true" />

        {/* Scroll hint */}
        <div className={styles.scrollHint} aria-hidden="true">
          <span className={styles.scrollLine} />
          <span className={styles.scrollText}>Scroll</span>
        </div>

      </div>
    </section>
  )
}
