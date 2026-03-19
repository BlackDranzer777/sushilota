/*
 * InkReveal.jsx
 * WebGL canvas — full-viewport ink-spread transition.
 *
 * HOW IT WORKS:
 *   - A fixed canvas sits over the entire page (z-index 50, pointer-events none).
 *   - A GLSL fragment shader uses domain-warped FBM (fractal brownian motion) noise
 *     to create an organic ink-spreading pattern.
 *   - `u_progress` uniform (0 → 1) is driven by a GSAP ScrollTrigger.
 *   - At progress=0 the canvas is fully transparent (hero shows).
 *   - As progress increases, ink bleeds in from above in an organic pattern.
 *   - At progress=1 the canvas is fully covered (the next section's color).
 *   - After progress=1 the canvas opacity fades to 0 and the section content
 *     is visible below.
 *
 * SHADER TECHNIQUE:
 *   Domain warping: fbm(p + fbm(p)) — each octave of noise feeds the next.
 *   This creates the irregular, blob-like spread of real ink on paper.
 *   A top-down bias (uv.y) ensures ink flows from the top edge downward.
 *
 * `triggerEl` — a DOM element ref. ScrollTrigger watches this element.
 * `inkColor`  — RGB 0-1 tuple matching the first service section bg.
 */

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* ── Vertex shader — fullscreen quad passthrough ─────────────────── */
const VERT = `
  attribute vec2 a_pos;
  varying   vec2 v_uv;
  void main() {
    v_uv        = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`

/* ── Fragment shader — domain-warped FBM ink spread ─────────────── */
const FRAG = `
  precision highp float;
  varying vec2  v_uv;
  uniform float u_progress;   /* 0.0 → 1.0 from ScrollTrigger     */
  uniform vec3  u_color;      /* ink / section background colour   */

  /* ── Pseudo-random hash ─────────────────────────────────────── */
  float hash(vec2 p) {
    p  = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 74.4);
    return fract(p.x * p.y);
  }

  /* ── Smooth value noise ─────────────────────────────────────── */
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);          /* smoothstep */
    return mix(
      mix(hash(i),              hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  /* ── Fractal brownian motion — 6 octaves ────────────────────── */
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2  shift = vec2(3.14159, 1.618);
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p  = p * 2.1 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = v_uv;
    uv.y = 1.0 - uv.y;           /* flip Y so ink pours from top */

    /* ── Domain warp: fbm drives fbm ───────────────────────────
       q  = first warp pass (large scale structure)
       r  = second warp pass (fine ink veins)
       n  = final warped value — full organic ink texture         */
    vec2 q = vec2(
      fbm(uv * 2.2),
      fbm(uv * 2.2 + vec2(5.2, 1.3))
    );
    vec2 r = vec2(
      fbm(uv * 1.8 + 3.0 * q + vec2(1.7, 9.2)),
      fbm(uv * 1.8 + 3.0 * q + vec2(8.3, 2.8))
    );
    float n = fbm(uv * 1.5 + 2.5 * r);

    /* ── Top-down bias ──────────────────────────────────────────
       wave: 0 near top, ~1 near bottom — controls the ink front.
       FBM distorts the wave edge so it's ragged, not a clean line. */
    float wave = uv.y * 0.65 + n * 0.55;

    /* ── Ink coverage ───────────────────────────────────────────
       smoothstep threshold shifts with u_progress.
       Edge width 0.12 — wider = softer ink front.                 */
    float covered = 1.0 - smoothstep(
      u_progress * 1.3 - 0.12,
      u_progress * 1.3 + 0.12,
      wave
    );

    /* ── Scattered ink blobs ────────────────────────────────────
       Small blobs appear ahead of the main front, like ink
       droplets that race ahead on paper fibres.                   */
    float blobs = step(1.0 - n * 0.5, u_progress * 1.6) * 0.6;

    float ink = clamp(covered + blobs, 0.0, 1.0);

    gl_FragColor = vec4(u_color, ink);
  }
`

export default function InkReveal({ triggerSelector = '#branding', inkColor = [0.008, 0.420, 0.392] }) {
  const canvasRef  = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return

    /* ── WebGL init ─────────────────────────────────────────────── */
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
    if (!gl) { console.warn('InkReveal: WebGL not supported'); return }

    const compile = (type, src) => {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, src)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader))
      }
      return shader
    }

    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl.VERTEX_SHADER,   VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    /* Fullscreen quad: two triangles covering clip space */
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1, -1,  1, -1,  -1, 1,  1, 1]),
      gl.STATIC_DRAW
    )
    const posLoc = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    /* Uniforms */
    const uProgress = gl.getUniformLocation(prog, 'u_progress')
    const uColor    = gl.getUniformLocation(prog, 'u_color')

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.uniform3f(uColor, inkColor[0], inkColor[1], inkColor[2])
    gl.uniform1f(uProgress, 0.0)

    const draw = (p) => {
      gl.uniform1f(uProgress, p)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    /* Resize to actual pixel density */
    const resize = () => {
      canvas.width  = window.innerWidth  * devicePixelRatio
      canvas.height = window.innerHeight * devicePixelRatio
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    /* ── ScrollTrigger ──────────────────────────────────────────── */
    const triggerEl = document.querySelector(triggerSelector)

    const st = ScrollTrigger.create({
      trigger:  triggerEl,
      start:    'top 80%',
      end:      'top -5%',
      scrub:    1.2,

      onUpdate(self) {
        const p = self.progress
        /* Canvas visible only during the transition */
        wrapper.style.opacity = p > 0 && p < 1 ? '1' : '0'
        draw(p)
      },
      onLeave() {
        /* Transition complete — hide canvas, section visible below */
        wrapper.style.transition = 'opacity 0.5s ease'
        wrapper.style.opacity    = '0'
      },
      onEnterBack() {
        wrapper.style.transition = 'none'
        wrapper.style.opacity    = '1'
      },
      onLeaveBack() {
        wrapper.style.opacity = '0'
      },
    })

    return () => {
      window.removeEventListener('resize', resize)
      st.kill()
    }
  }, [triggerSelector, inkColor])

  return (
    <div
      ref={wrapperRef}
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        50,
        pointerEvents: 'none',
        opacity:       0,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  )
}
