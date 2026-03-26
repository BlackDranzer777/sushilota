/*
 * Section2.jsx
 *
 * LAYOUT: Two-column grid — text left (55%), 3D photo right (45%).
 *
 * TEXT:   GSAP ScrollTrigger — heading lines reveal via clipPath,
 *         label/body/CTA fade+slide up.
 *
 * PHOTO:  WebGL canvas renders section2_1.png with:
 *           - object-fit: cover cropping
 *           - mouse-reactive parallax UV shift (fake depth layers)
 *           - chromatic aberration (grows with mouse distance)
 *           - specular sheen that follows the mouse (physical photo feel)
 *           - edge vignette
 *         CSS 3D tilt (GSAP rotationX/Y on photoWrap) adds physical card feel.
 *
 * GRAIN:  256×256 animated noise canvas — hook kept, opacity 0 in CSS.
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
  const sectionRef   = useRef(null)
  const grainRef     = useRef(null)   /* film grain — hook kept, opacity 0 */
  const locationRef  = useRef(null)
  const line0Ref     = useRef(null)
  const line1Ref     = useRef(null)
  const line2Ref     = useRef(null)
  const bodyRef      = useRef(null)
  const ctaRef       = useRef(null)

  const photoRef     = useRef(null)   /* WebGL photo canvas */
  const photoWrapRef = useRef(null)   /* CSS 3D tilt container */

  const grainRafRef  = useRef(null)
  const mouseRafRef  = useRef(null)
  const photoRafRef  = useRef(null)
  const visibleRef   = useRef(false)

  /* ── GSAP text reveal ────────────────────────────────────────────── */
  useEffect(() => {
    const lineRefs = [line0Ref, line1Ref, line2Ref]
    const lines    = lineRefs.map(r => r.current).filter(Boolean)

    const ctx = gsap.context(() => {
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
    })
    return () => ctx.revert()
  }, [])

  /* ── Mouse parallax on text (x-axis only) ────────────────────────── */
  useEffect(() => {
    let tx = 0, cx = 0

    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2
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

  /* ── WebGL 3D photo (right column) ──────────────────────────────────
   *
   * Fragment shader:
   *   1. object-fit: cover — image fills canvas regardless of aspect ratio
   *   2. Mouse parallax UV offset — simulates depth layers shifting
   *   3. Subtle breathing wave distortion
   *   4. Chromatic aberration — color channels split toward mouse
   *   5. Vignette — darkened edges for photograph feel
   *   6. Specular sheen — bright spot follows mouse like light on a print
   *
   * CSS 3D tilt (GSAP rotationX/Y on photoWrap) adds the physical card feel.
   * Both effects share the same smoothed mouse values.
   * ────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = photoRef.current
    const wrap   = photoWrapRef.current
    if (!canvas || !wrap) return

    const gl = canvas.getContext('webgl', { alpha: false, premultipliedAlpha: false })
    if (!gl) return

    const VERT = `
      attribute vec2 a_pos;
      varying   vec2 v_uv;
      void main() {
        v_uv        = a_pos * 0.5 + 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `

    const FRAG = `
      precision highp float;

      varying   vec2      v_uv;
      uniform   sampler2D u_tex;
      uniform   float     u_time;
      uniform   float     u_aspect;     /* canvas w/h  */
      uniform   float     u_imgAspect;  /* image  w/h  */
      uniform   vec2      u_mouse;      /* smooth -1..1 xy */

      void main() {
        /* ── object-fit: cover ── */
        vec2 uv = v_uv;
        if (u_aspect > u_imgAspect) {
          float s = u_aspect / u_imgAspect;
          uv.y = (uv.y - 0.5) * s + 0.5;
        } else {
          float s = u_imgAspect / u_aspect;
          uv.x = (uv.x - 0.5) * s + 0.5;
        }

        /* ── Mouse parallax — fake depth ── */
        vec2 parallax = u_mouse * -0.022;

        /* ── Subtle breathing wave ── */
        float wave = sin(uv.x * 5.0 + u_time * 0.35) *
                     sin(uv.y * 4.0 + u_time * 0.28) * 0.003;

        vec2 distUV = uv + parallax + vec2(wave);

        /* ── Chromatic aberration — grows with mouse distance ── */
        float aberrStr = length(u_mouse) * 0.006 + 0.0015;
        vec2  aberrDir = normalize(u_mouse + vec2(0.0001, 0.0001));
        float r = texture2D(u_tex, clamp(distUV + aberrDir * aberrStr,  0.001, 0.999)).r;
        float g = texture2D(u_tex, clamp(distUV,                        0.001, 0.999)).g;
        float b = texture2D(u_tex, clamp(distUV - aberrDir * aberrStr,  0.001, 0.999)).b;
        vec3 col = vec3(r, g, b);

        /* ── Vignette ── */
        vec2  vigUV    = v_uv * 2.0 - 1.0;
        float vignette = 1.0 - smoothstep(0.55, 1.3, length(vigUV * vec2(0.85, 1.0)));
        col *= mix(0.55, 1.0, vignette);

        /* ── Specular sheen — light spot follows mouse ── */
        vec2  sheenUV  = v_uv - 0.5;
        vec2  lightPos = u_mouse * 0.36;
        float sheen    = pow(max(0.0, 1.0 - length(sheenUV - lightPos) * 2.4), 4.0) * 0.2;
        col += sheen;

        gl_FragColor = vec4(col, 1.0);
      }
    `

    const compile = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src); gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.error('Photo shader:', gl.getShaderInfoLog(s))
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
    const uMouse     = gl.getUniformLocation(prog, 'u_mouse')
    gl.uniform1i(gl.getUniformLocation(prog, 'u_tex'), 0)

    /* Texture — teal placeholder until image loads */
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([95, 134, 116, 255]))
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

    /* Resize canvas to its CSS size × dpr */
    const resize = () => {
      canvas.width  = canvas.offsetWidth  * devicePixelRatio
      canvas.height = canvas.offsetHeight * devicePixelRatio
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    /* Smooth mouse */
    let mx = 0, my = 0, cmx = 0, cmy = 0
    const onMove = (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2
      my = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    /* Combined render + CSS tilt loop */
    let start = null
    const tick = (ts) => {
      photoRafRef.current = requestAnimationFrame(tick)
      if (!visibleRef.current) return
      if (!start) start = ts
      const t = (ts - start) * 0.001

      /* Smooth mouse */
      cmx += (mx - cmx) * 0.05
      cmy += (my - cmy) * 0.05

      /* CSS 3D tilt on the photo wrap */
      gsap.set(wrap, {
        rotationX:           -cmy * 9,
        rotationY:            cmx * 13,
        transformPerspective: 1200,
      })

      /* WebGL draw */
      gl.uniform1f(uTime,      t)
      gl.uniform1f(uAspect,    canvas.width / canvas.height)
      gl.uniform1f(uImgAspect, imgAspect)
      gl.uniform2f(uMouse,     cmx, cmy)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    photoRafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(photoRafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  /* ── Grain canvas (hook kept, opacity 0 in CSS) ──────────────────── */
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

      {/* Film grain (hook kept, invisible) */}
      <canvas ref={grainRef} className={styles.grain} aria-hidden="true" />

      {/* Text column */}
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

      {/* Photo column */}
      <div className={styles.photoCol}>
        <div ref={photoWrapRef} className={styles.photoWrap}>
          <canvas ref={photoRef} className={styles.photoCanvas} aria-hidden="true" />
        </div>
      </div>

    </section>
  )
}
