/*
 * Section3.jsx — The Craft (Services)
 *
 * VFX cinematic scroll:
 *   • Title characters individually scattered in 3D space
 *     — each letter starts at a unique (x, y, z, rotX, rotY, rotZ) position
 *     — perspective depth (transformPerspective: 1400) makes distant chars small
 *     — tight stagger (0.007 per char) creates a "materialising from the void" feel
 *   • Eyebrow / body / tags animate as solid blocks (secondary hierarchy)
 *   • Rule draws left-to-right (scaleX 0→1)
 *   • Visual slides in gently (not 3D, so it anchors the eye)
 *
 * Scroll architecture: travel (320vh) + sticky scene (100vh) per service.
 * GSAP scrub: 1.8 — animation lags scroll slightly for camera-like smoothness.
 *
 * Timeline rhythm (mapped to 320vh):
 *   0  → ~35%   chars fly in from 3D scatter
 *   35 → 60%    hold (readable)
 *   60 → 100%   chars scatter out to different 3D positions
 */

import { useEffect, useRef } from 'react'
import { gsap }          from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SERVICES }      from '../../data/services'
import styles            from './Section3.module.css'

gsap.registerPlugin(ScrollTrigger)

/* ── Deterministic per-character scatter positions ────────────────
 *
 * i   = character index
 * n   = total chars in the title
 * dir = ±1 (alternated per panel for visual variety)
 *
 * Spread chars along a wide arc in 3D space.
 * z range –280 → –900: perspective scale ≈ 0.83 → 0.61  (visibly smaller)
 * ────────────────────────────────────────────────────────────────── */
function charEnter(i, n, dir) {
  const t = n > 1 ? i / (n - 1) : 0.5
  const a = t * Math.PI * 2.6 - 0.9          // spread angle across arc
  const r = 180 + t * 420                     // radius grows with index
  return {
    x:         Math.cos(a) * r * dir,
    y:         Math.sin(a) * r * 0.28,
    z:         -(280 + t * 620),              // depth: near → far
    rotationX: (t - 0.5) * 64,
    rotationY: dir * (t * 82 - 41),
    rotationZ: Math.sin(i * 0.75) * 32,
    opacity:   0,
    transformPerspective: 1400,
  }
}

function charExit(i, n, dir) {
  const t = n > 1 ? i / (n - 1) : 0.5
  const a = t * Math.PI * 2.6 + Math.PI * 0.7 // different arc for exit
  const r = 200 + t * 460
  return {
    x:         Math.cos(a) * r * (-dir),
    y:         Math.sin(a) * r * 0.24,
    z:         -(320 + t * 680),
    rotationX: -(t - 0.5) * 70,
    rotationY: -dir * (t * 88 - 44),
    rotationZ: -Math.sin(i * 0.75) * 35,
    opacity:   0,
    transformPerspective: 1400,
  }
}

/* ── Block scatter for secondary elements (eyebrow, body, tags) ─── */
const blockEnter = (dir) => [
  { key: 'eye',  from: { x: dir * -260, y: -55, rotationY: dir * -22, opacity: 0 }, exit: { x: dir *  280, y:  65, rotationY: dir *  24, opacity: 0 } },
  { key: 'body', from: { x: dir *  180, y: -70, rotationY: dir *  16, opacity: 0 }, exit: { x: dir * -200, y:  78, rotationY: dir * -18, opacity: 0 } },
  { key: 'tags', from: { x: dir * -140, y: 110, rotationZ: dir *  -8, opacity: 0 }, exit: { x: dir *  160, y: -90, rotationZ: dir *  10, opacity: 0 } },
]

/* ── Service panel ────────────────────────────────────────────────── */
function ServicePanel({ service, index }) {
  const travelRef = useRef(null)
  const ghostRef  = useRef(null)
  const eyeRef    = useRef(null)
  const ruleRef   = useRef(null)
  const bodyRef   = useRef(null)
  const tagsRef   = useRef(null)
  const visualRef = useRef(null)

  /* Collect char refs on every render (array rebuilt before useEffect) */
  const charRefs = useRef([])
  charRefs.current = []

  useEffect(() => {
    const ctx = gsap.context(() => {
    const dir   = index % 2 === 0 ? 1 : -1
    const chars = charRefs.current.filter(Boolean)
    const n     = chars.length
    const blocks = blockEnter(dir)
    const blockMap = { eye: eyeRef, body: bodyRef, tags: tagsRef }

    /* ── Set initial positions ──── */
    chars.forEach((el, i) => gsap.set(el, charEnter(i, n, dir)))

    blocks.forEach(({ key, from }) => {
      const el = blockMap[key]?.current
      if (el) gsap.set(el, { ...from, transformPerspective: 1400 })
    })

    gsap.set(ruleRef.current,   { scaleX: 0, transformOrigin: 'left center', opacity: 0 })
    gsap.set(ghostRef.current,  { opacity: 0 })
    gsap.set(visualRef.current, { opacity: 0, y: 36 })

    /* ── Scrub timeline ─────────── */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: travelRef.current,
        start:   'top top',
        end:     'bottom bottom',
        scrub:   1.8,
      },
    })

    /* Ghost fades in quietly first */
    tl.to(ghostRef.current, { opacity: 0.045, duration: 0.18 }, 0)

    /* ENTER — chars stagger in from 3D scatter */
    const CHAR_STAGGER = 0.007
    const CHAR_DUR     = 0.42
    chars.forEach((el, i) => {
      tl.to(el, {
        x: 0, y: 0, z: 0,
        rotationX: 0, rotationY: 0, rotationZ: 0,
        opacity: 1,
        transformPerspective: 1400,
        duration: CHAR_DUR,
        ease: 'power3.out',
      }, i * CHAR_STAGGER)
    })
    const charEnterEnd = (n - 1) * CHAR_STAGGER + CHAR_DUR  // ≈ 0.75 for ~50 chars

    /* Secondary elements follow as chars settle */
    tl.to(eyeRef.current, {
      x: 0, y: 0, rotationY: 0, opacity: 1, transformPerspective: 1400,
      duration: 0.38, ease: 'power2.out',
    }, charEnterEnd * 0.15)

    tl.to(ruleRef.current, {
      scaleX: 1, opacity: 0.22, duration: 0.3, ease: 'power2.inOut',
    }, charEnterEnd * 0.40)

    tl.to(bodyRef.current, {
      x: 0, y: 0, rotationY: 0, opacity: 1, transformPerspective: 1400,
      duration: 0.42, ease: 'power2.out',
    }, charEnterEnd * 0.55)

    tl.to(tagsRef.current, {
      x: 0, y: 0, rotationZ: 0, opacity: 1, transformPerspective: 1400,
      duration: 0.38, ease: 'power2.out',
    }, charEnterEnd * 0.72)

    tl.to(visualRef.current, {
      opacity: 1, y: 0, duration: 0.46, ease: 'power2.out',
    }, charEnterEnd * 0.3)

    /* ── HOLD gap: charEnterEnd → holdEnd ──── */
    const holdEnd = charEnterEnd + 0.85

    /* EXIT — chars scatter to different 3D positions */
    chars.forEach((el, i) => {
      tl.to(el, {
        ...charExit(i, n, dir),
        duration: CHAR_DUR,
        ease: 'power3.in',
      }, holdEnd + i * CHAR_STAGGER)
    })
    const charExitEnd = holdEnd + (n - 1) * CHAR_STAGGER + CHAR_DUR

    /* Block exits */
    tl.to(eyeRef.current, {
      ...blocks[0].exit, transformPerspective: 1400,
      duration: 0.36, ease: 'power2.in',
    }, holdEnd + 0.04)

    tl.to(ruleRef.current, {
      scaleX: 0, transformOrigin: 'right center', opacity: 0,
      duration: 0.25, ease: 'power2.in',
    }, holdEnd + 0.10)

    tl.to(bodyRef.current, {
      ...blocks[1].exit, transformPerspective: 1400,
      duration: 0.38, ease: 'power2.in',
    }, holdEnd + 0.16)

    tl.to(tagsRef.current, {
      ...blocks[2].exit, transformPerspective: 1400,
      duration: 0.34, ease: 'power2.in',
    }, holdEnd + 0.22)

    tl.to(visualRef.current, {
      opacity: 0, y: -36, duration: 0.4, ease: 'power2.in',
    }, holdEnd + 0.12)

    tl.to(ghostRef.current, {
      opacity: 0, duration: 0.2,
    }, charExitEnd)

    }) // end gsap.context
    return () => ctx.revert()
  }, [index])

  /* Split title into chars for individual 3D animation */
  const lines = service.title.split('\n')

  return (
    <div ref={travelRef} className={styles.travel}>
      <section
        id={service.id}
        className={styles.scene}
        style={{ '--panel-bg': service.bg, '--panel-text': service.textColor }}
      >
        {/* Ghost numeral */}
        <div ref={ghostRef} className={styles.ghost} aria-hidden="true">
          {service.numeral}
        </div>

        {/* Content */}
        <div className={styles.content}>

          {/* Eyebrow */}
          <div ref={eyeRef} className={styles.eyebrow}>
            <span className={styles.eyeNum}>{service.numeral}</span>
            <span className={styles.eyeSep} aria-hidden="true">—</span>
            <span className={styles.eyeLabel}>{service.label}</span>
          </div>

          {/* Rule — draws left to right */}
          <div ref={ruleRef} className={styles.rule} aria-hidden="true" />

          {/* Title — each character individually animated */}
          <h2 className={styles.title} aria-label={service.title.replace('\n', ' ')}>
            {lines.map((line, li) => (
              <span key={li} className={styles.titleLine} aria-hidden="true">
                {line.split('').map((char, ci) => (
                  <span
                    key={ci}
                    className={styles.char}
                    ref={(el) => { if (el) charRefs.current.push(el) }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </span>
            ))}
          </h2>

          {/* Body */}
          <p ref={bodyRef} className={styles.body}>
            {service.body}
          </p>

          {/* Tags */}
          <p ref={tagsRef} className={styles.tags}>
            {service.tags.map((tag, i) => (
              <span key={tag}>
                {tag}
                {i < service.tags.length - 1 && (
                  <span className={styles.tagSep} aria-hidden="true"> · </span>
                )}
              </span>
            ))}
          </p>

        </div>

        {/* Visual slot */}
        <div ref={visualRef} className={styles.visual}>
          <div className={styles.visualInner} />
        </div>

      </section>
    </div>
  )
}

/* ── Intro panel ──────────────────────────────────────────────────── */
function IntroPanel() {
  const ref      = useRef(null)
  const numRef   = useRef(null)
  const headRef  = useRef(null)
  const quoteRef = useRef(null)
  const bodyRef  = useRef(null)

  useEffect(() => {
    const headLines = headRef.current
      ? Array.from(headRef.current.querySelectorAll('span'))
      : []

    const ctx = gsap.context(() => {
    gsap.set(numRef.current,   { opacity: 0, y: 16 })
    gsap.set(headLines,        { clipPath: 'inset(0 0 100% 0)', y: 12 })
    gsap.set(quoteRef.current, { opacity: 0, y: 20 })
    gsap.set(bodyRef.current,  { opacity: 0, y: 20 })

    const tl = gsap.timeline({
      scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true },
    })

    tl.to(numRef.current,   { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
    tl.to(headLines, {
      clipPath: 'inset(0 0 -10% 0)', y: 0,
      duration: 1, ease: 'power3.out', stagger: 0.12,
    }, '-=0.35')
    tl.to(quoteRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
    tl.to(bodyRef.current,  { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
    }) // end gsap.context
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className={styles.intro}>
      <div className={styles.introInner}>
        <p ref={numRef} className={styles.introNum}>03</p>
        <h2 ref={headRef} className={styles.introHead}>
          <span>The</span>
          <span>Craft.</span>
        </h2>
        <p ref={quoteRef} className={styles.introQuote}>
          "The itamae masters one cut, then another —<br />
          until the whole is greater than the sum."
        </p>
        <p ref={bodyRef} className={styles.introBody}>
          Eight disciplines. Each one practised with the precision of a craftsman.<br />
          Together, they build brands that endure.
        </p>
      </div>
      <div className={styles.introRule} aria-hidden="true" />
    </section>
  )
}

export default function Section3() {
  return (
    <>
      <IntroPanel />
      {SERVICES.map((service, i) => (
        <ServicePanel key={service.id} service={service} index={i} />
      ))}
    </>
  )
}
