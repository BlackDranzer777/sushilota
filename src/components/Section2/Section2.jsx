/*
 * Section2.jsx
 *
 * TEXT:   GSAP ScrollTrigger — each heading line reveals via clipPath,
 *         label/body/CTA fade+slide up. Triggered when section enters viewport.
 *
 * BG:     WebGL canvas (mix-blend-mode: multiply) renders section2_1.png
 *         across the full section. Because white × teal-bg = teal, edges fade
 *         seamlessly. The illustration appears as if printed on teal paper.
 *         Features: horizontal auto-scroll via fract() tiling, mouse-X speed
 *         nudge, dual-frequency wave distortion, chromatic aberration.
 *
 * GRAIN:  256×256 animated noise canvas (soft-light, opacity 0.055).
 *
 * PARALLAX: Mouse X shifts each text layer at a different depth.
 */

import { useEffect, useRef } from 'react'
import { gsap }              from 'gsap'
import { ScrollTrigger }     from 'gsap/ScrollTrigger'
import styles                from './Section2.module.css'

gsap.registerPlugin(ScrollTrigger)

const HEADING_LINES = [
  "We don't just market",
  "brands. We make them",
  "matter.",
]

const GRAIN_SIZE = 256

export default function Section2() {
  const sectionRef  = useRef(null)
  const bgRef       = useRef(null)   /* WebGL bg canvas  */
  const grainRef    = useRef(null)   /* film grain canvas */
  const locationRef = useRef(null)
  const line0Ref    = useRef(null)
  const line1Ref    = useRef(null)
  const line2Ref    = useRef(null)
  const bodyRef     = useRef(null)
  const ctaRef      = useRef(null)

  const bgRafRef    = useRef(null)
  const grainRafRef = useRef(null)
  const mouseRafRef = useRef(null)
  const visibleRef  = useRef(false)

  /* ── GSAP text reveal ────────────────────────────────────────── */
  useEffect(() => {
    const lineRefs = [line0Ref, line1Ref, line2Ref]
    const lines    = lineRefs.map(r => r.current).filter(Boolean)

    gsap.set(lines, { clipPath: 'inset(0 0 100% 0)', y: 10 })
    gsap.set(
      [locationRef.current, bodyRef.current, ctaRef.current],
      { opacity: 0, y: 24 }
    )

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start:   'top 85%',
        once:    true,
      },
    })

    tl.to(locationRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
    tl.to(lines, {
      clipPath: 'inset(0 0 -10% 0)', y: 0,
      duration: 0.85, ease: 'power3.out', stagger: 0.1,
    }, '-=0.4')
    tl.to([bodyRef.current, ctaRef.current], {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1,
    }, '-=0.4')

    return () => tl.scrollTrigger?.kill()
  }, [])

  /* ── Mouse parallax (x-axis only, avoids conflict with y reveal) ─ */
  useEffect(() => {
    let tx = 0, ty = 0, cx = 0, cy = 0

    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth  - 0.5) * 2
      ty = (e.clientY / window.innerHeight - 0.5) * 2
    }

    const LAYERS = [
      { ref: locationRef, mx:  7  },
      { ref: line0Ref,    mx: -11 },
      { ref: line1Ref,    mx: -17 },
      { ref: line2Ref,    mx: -25 },
      { ref: bodyRef,     mx:  10 },
      { ref: ctaRef,      mx:  14 },
    ]

    const tick = () => {
      mouseRafRef.current = requestAnimationFrame(tick)
      if (!visibleRef.current) return
      cx += (tx - cx) * 0.06
      cy += (ty - cy) * 0.06
      LAYERS.forEach(({ ref, mx }) => {
        if (ref.current) gsap.set(ref.current, { x: cx * mx })
      })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    mouseRafRef.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(mouseRafRef.current)
    }
  }, [])

  /* ── WebGL full-section background ──────────────────────────────
   *
   * mix-blend-mode: multiply (CSS) composites this canvas over the
   * section's #5f8674 teal background. Key insight:
   *   white (1,1,1) × teal = teal  → white areas vanish into bg
   *   illustration colors × teal  → muted, tinted, editorial look
   *
   * Edge vignettes fade to WHITE so they multiply to pure teal.
   * ────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = bgRef.current
    if (!canvas) return

    /* alpha: true so CSS mix-blend-mode: multiply composites correctly */
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
    if (!gl) return

    const VERT = `
      attribute vec2 a_pos;
      varying   vec2 v_uv;
      void main() {
        v_uv        = a_pos * 0.5 + 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `

    /*
     * Fragment shader
     *
     * 1. Scale UV: image fills section height, tiles horizontally
     * 2. Auto-scroll (u_time) + mouse nudge (u_mouseX) via fract()
     * 3. Dual-frequency wave distortion (vertical)
     * 4. Chromatic aberration ∝ wave peak
     * 5. White edge vignettes → multiply with teal bg = seamless edges
     */
    const FRAG = `
      precision highp float;

      varying   vec2      v_uv;
      uniform   sampler2D u_tex;
      uniform   float     u_time;
      uniform   float     u_aspect;     /* canvas w/h          */
      uniform   float     u_imgAspect;  /* image  w/h          */
      uniform   float     u_mouseX;     /* lerped mouse -1..1  */

      void main() {
        vec2 uv = v_uv;

        /* Scale X so image fills height; fract() for seamless loop */
        float scale   = u_aspect / u_imgAspect;
        float scrollX = fract(uv.x * scale + u_time * 0.018 + u_mouseX * 0.035);
        float scrollY = uv.y;

        /* Dual-frequency vertical wave */
        float wave = sin(scrollX * 9.0  + u_time * 0.65) * 0.5
                   + sin(scrollX * 5.5  - u_time * 0.4 ) * 0.5;
        scrollY = clamp(scrollY + wave * 0.009, 0.001, 0.999);

        /* Chromatic aberration tied to wave peak */
        float aberr = abs(wave) * 0.005;
        float r = texture2D(u_tex, vec2(scrollX + aberr, scrollY)).r;
        float g = texture2D(u_tex, vec2(scrollX,         scrollY)).g;
        float b = texture2D(u_tex, vec2(scrollX - aberr, scrollY)).b;
        vec3 col = vec3(r, g, b);

        /* Edge vignettes — fade to 0.5 gray.
         * soft-light(0.5, any) = no change → edges vanish seamlessly. */
        float hFade = smoothstep(0.0, 0.06, uv.x)
                    * smoothstep(1.0, 0.94, uv.x);
        float vFade = smoothstep(0.0, 0.04, uv.y)
                    * smoothstep(1.0, 0.96, uv.y);
        col = mix(vec3(0.5), col, hFade * vFade);

        gl_FragColor = vec4(col, 1.0);
      }
    `

    const compile = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src); gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.error('BG shader:', gl.getShaderInfoLog(s))
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
    const uTime      = gl.getUniformLocation(prog, 'u_time')
    const uAspect    = gl.getUniformLocation(prog, 'u_aspect')
    const uImgAspect = gl.getUniformLocation(prog, 'u_imgAspect')
    const uMouseX    = gl.getUniformLocation(prog, 'u_mouseX')
    gl.uniform1i(gl.getUniformLocation(prog, 'u_tex'), 0)

    /* Texture — CLAMP_TO_EDGE required for non-power-of-2 images */
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([255, 255, 255, 255]))  /* white placeholder — invisible under multiply */
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    let imgAspect = 2.67
    const img = new Image()
    img.src = '/illustrations/section2_1.png'
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      imgAspect = img.naturalWidth / img.naturalHeight
    }

    /* Resize: size canvas to section dimensions */
    const resize = () => {
      canvas.width  = canvas.offsetWidth  * devicePixelRatio
      canvas.height = canvas.offsetHeight * devicePixelRatio
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    /* Mouse X (shared with parallax, tracked independently) */
    let mx = 0, cmx = 0
    const onMove = (e) => { mx = (e.clientX / window.innerWidth - 0.5) * 2 }
    window.addEventListener('mousemove', onMove, { passive: true })

    /* Render loop — pauses via visibleRef when off-screen */
    let start = null
    const tick = (ts) => {
      bgRafRef.current = requestAnimationFrame(tick)
      if (!visibleRef.current) return
      if (!start) start = ts
      const t = (ts - start) * 0.001

      cmx += (mx - cmx) * 0.05

      gl.uniform1f(uTime,      t)
      gl.uniform1f(uAspect,    canvas.width / canvas.height)
      gl.uniform1f(uImgAspect, imgAspect)
      gl.uniform1f(uMouseX,    cmx)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    bgRafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(bgRafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  /* ── Animated grain canvas ───────────────────────────────────── */
  useEffect(() => {
    const canvas = grainRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width  = GRAIN_SIZE
    canvas.height = GRAIN_SIZE

    let frame = 0
    const tick = () => {
      grainRafRef.current = requestAnimationFrame(tick)
      if (!visibleRef.current) return
      frame++
      if (frame % 2 !== 0) return

      const img  = ctx.createImageData(GRAIN_SIZE, GRAIN_SIZE)
      const data = img.data
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0
        data[i] = data[i + 1] = data[i + 2] = v
        data[i + 3] = 255
      }
      ctx.putImageData(img, 0, 0)
    }

    const io = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting },
      { threshold: 0 }
    )
    if (sectionRef.current) io.observe(sectionRef.current)

    grainRafRef.current = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(grainRafRef.current); io.disconnect() }
  }, [])

  return (
    <section ref={sectionRef} id="section-2" className={styles.section}>

      {/* WebGL illustration — mix-blend-mode: multiply in CSS */}
      <canvas ref={bgRef} className={styles.bgCanvas} aria-hidden="true" />

      {/* Film grain overlay */}
      <canvas ref={grainRef} className={styles.grain} aria-hidden="true" />

      <div className={styles.inner}>

        <p ref={locationRef} className={styles.label}>
          Jaipur&nbsp;·&nbsp;India
        </p>

        <h2 className={styles.heading}>
          {HEADING_LINES.map((line, i) => {
            const refs = [line0Ref, line1Ref, line2Ref]
            return (
              <div key={line} ref={refs[i]} className={styles.lineWrap}>
                <span className={styles.headingLine}>{line}</span>
              </div>
            )
          })}
        </h2>

        <p ref={bodyRef} className={styles.body}>
          Sushi Lota is a full-service creative and marketing agency rooted in
          Jaipur&apos;s artistic heritage. Strategy, design, and storytelling —
          crafted with the precision of an itamae.
        </p>

        <a ref={ctaRef} href="#contact" className={styles.cta}>
          Work with us
        </a>

      </div>
    </section>
  )
}
