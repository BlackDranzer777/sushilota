/*
 * Section4.jsx — The Method (Process)
 *
 * Identical VFX architecture to Section3:
 *   per-character 3D scatter on titles, block scatter on secondaries,
 *   scrub: 1.8, travel: 320vh.
 *
 * Four steps — distinct dark/peach alternation for visual rhythm.
 */

import { useEffect, useRef } from 'react'
import { gsap }          from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles            from './Section4.module.css'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    id:    'method-listen',
    num:   '01',
    label: 'Discover',
    title: 'Listen before\nyou speak.',
    body:  'Every brief is a map. We immerse ourselves in your world — your customers, your competitors, your ambitions — before a single idea is sketched. Insight precedes everything.',
    tags:  ['Brand Audit', 'Market Research', 'Competitor Analysis', 'Audience Mapping'],
    bg:    '#0a1a18',
    text:  '#ffffff',
  },
  {
    id:    'method-define',
    num:   '02',
    label: 'Define',
    title: 'Strategy before\naesthetics.',
    body:  'A brand without direction is just decoration. We build the strategic foundation — positioning, voice, values — that makes every visual choice deliberate and every word count.',
    tags:  ['Positioning', 'Brand Voice', 'Visual Direction', 'Content Strategy'],
    bg:    '#ffe7d9',
    text:  '#0a1a18',
  },
  {
    id:    'method-create',
    num:   '03',
    label: 'Create',
    title: 'Craft that holds\nits ground.',
    body:  "Where intention meets execution. Every pixel, every word, every interaction — made with the care of an itamae who knows the difference between good and extraordinary is invisible until it isn't.",
    tags:  ['Design', 'Copywriting', 'Art Direction', 'Motion'],
    bg:    '#026b64',
    text:  '#ffffff',
  },
  {
    id:    'method-launch',
    num:   '04',
    label: 'Deliver',
    title: 'Precision at\nevery touchpoint.',
    body:  "We don't hand off and disappear. Launch is a beginning. We track, measure, refine — and stay with you through the moments that matter, until the work does exactly what it was made to do.",
    tags:  ['Launch Strategy', 'Performance Tracking', 'Iteration', 'Partnership'],
    bg:    '#0a1a18',
    text:  '#ffffff',
  },
]

/* ── Per-character positions (same formula as Section3) ──────────── */
function charEnter(i, n, dir) {
  const t = n > 1 ? i / (n - 1) : 0.5
  const a = t * Math.PI * 2.6 - 0.9
  const r = 180 + t * 420
  return {
    x:         Math.cos(a) * r * dir,
    y:         Math.sin(a) * r * 0.28,
    z:         -(280 + t * 620),
    rotationX: (t - 0.5) * 64,
    rotationY: dir * (t * 82 - 41),
    rotationZ: Math.sin(i * 0.75) * 32,
    opacity:   0,
    transformPerspective: 1400,
  }
}

function charExit(i, n, dir) {
  const t = n > 1 ? i / (n - 1) : 0.5
  const a = t * Math.PI * 2.6 + Math.PI * 0.7
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

const blockEnter = (dir) => [
  { key: 'eye',  from: { x: dir * -260, y: -55, rotationY: dir * -22, opacity: 0 }, exit: { x: dir *  280, y:  65, rotationY: dir *  24, opacity: 0 } },
  { key: 'num',  from: { x: dir *  160, y: -80, rotationX: -18, opacity: 0 },        exit: { x: dir * -180, y:  80, rotationX:  20, opacity: 0 } },
  { key: 'body', from: { x: dir *  180, y: -70, rotationY: dir *  16, opacity: 0 },  exit: { x: dir * -200, y:  78, rotationY: dir * -18, opacity: 0 } },
  { key: 'tags', from: { x: dir * -140, y: 110, rotationZ: dir *  -8, opacity: 0 },  exit: { x: dir *  160, y: -90, rotationZ: dir *  10, opacity: 0 } },
]

/* ── Step panel ───────────────────────────────────────────────────── */
function StepPanel({ step, index }) {
  const travelRef = useRef(null)
  const eyeRef    = useRef(null)
  const numRef    = useRef(null)
  const ruleRef   = useRef(null)
  const bodyRef   = useRef(null)
  const tagsRef   = useRef(null)
  const visualRef = useRef(null)

  const charRefs = useRef([])
  charRefs.current = []

  useEffect(() => {
    const ctx = gsap.context(() => {
    const dir    = index % 2 === 0 ? 1 : -1
    const chars  = charRefs.current.filter(Boolean)
    const n      = chars.length
    const blocks = blockEnter(dir)
    const bMap   = { eye: eyeRef, num: numRef, body: bodyRef, tags: tagsRef }

    /* Initial positions */
    chars.forEach((el, i) => gsap.set(el, charEnter(i, n, dir)))
    blocks.forEach(({ key, from }) => {
      const el = bMap[key]?.current
      if (el) gsap.set(el, { ...from, transformPerspective: 1400 })
    })
    gsap.set(ruleRef.current,   { scaleX: 0, transformOrigin: 'left center', opacity: 0 })
    gsap.set(visualRef.current, { opacity: 0, y: 36 })

    /* Scrub timeline */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: travelRef.current,
        start:   'top top',
        end:     'bottom bottom',
        scrub:   1.8,
      },
    })

    const CHAR_STAGGER = 0.007
    const CHAR_DUR     = 0.42

    /* Enter */
    chars.forEach((el, i) => {
      tl.to(el, {
        x: 0, y: 0, z: 0,
        rotationX: 0, rotationY: 0, rotationZ: 0,
        opacity: 1, transformPerspective: 1400,
        duration: CHAR_DUR, ease: 'power3.out',
      }, i * CHAR_STAGGER)
    })
    const charEnterEnd = (n - 1) * CHAR_STAGGER + CHAR_DUR

    tl.to(eyeRef.current, {
      x: 0, y: 0, rotationY: 0, opacity: 1, transformPerspective: 1400,
      duration: 0.38, ease: 'power2.out',
    }, charEnterEnd * 0.12)

    tl.to(numRef.current, {
      x: 0, y: 0, rotationX: 0, opacity: 1, transformPerspective: 1400,
      duration: 0.42, ease: 'power2.out',
    }, charEnterEnd * 0.22)

    tl.to(ruleRef.current, {
      scaleX: 1, opacity: 0.18, duration: 0.3, ease: 'power2.inOut',
    }, charEnterEnd * 0.38)

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

    /* Hold gap */
    const holdEnd = charEnterEnd + 0.85

    /* Exit */
    chars.forEach((el, i) => {
      tl.to(el, {
        ...charExit(i, n, dir),
        duration: CHAR_DUR, ease: 'power3.in',
      }, holdEnd + i * CHAR_STAGGER)
    })

    tl.to(eyeRef.current, {
      ...blocks[0].exit, transformPerspective: 1400,
      duration: 0.36, ease: 'power2.in',
    }, holdEnd + 0.04)

    tl.to(numRef.current, {
      ...blocks[1].exit, transformPerspective: 1400,
      duration: 0.38, ease: 'power2.in',
    }, holdEnd + 0.10)

    tl.to(ruleRef.current, {
      scaleX: 0, transformOrigin: 'right center', opacity: 0,
      duration: 0.25, ease: 'power2.in',
    }, holdEnd + 0.16)

    tl.to(bodyRef.current, {
      ...blocks[2].exit, transformPerspective: 1400,
      duration: 0.38, ease: 'power2.in',
    }, holdEnd + 0.22)

    tl.to(tagsRef.current, {
      ...blocks[3].exit, transformPerspective: 1400,
      duration: 0.34, ease: 'power2.in',
    }, holdEnd + 0.28)

    tl.to(visualRef.current, {
      opacity: 0, y: -36, duration: 0.4, ease: 'power2.in',
    }, holdEnd + 0.14)

    }) // end gsap.context
    return () => ctx.revert()
  }, [index])

  const lines = step.title.split('\n')

  return (
    <div ref={travelRef} className={styles.travel}>
      <section
        id={step.id}
        className={styles.scene}
        style={{ '--panel-bg': step.bg, '--panel-text': step.text }}
      >
        <div className={styles.content}>

          {/* Eyebrow */}
          <div ref={eyeRef} className={styles.eyebrow}>
            <span className={styles.eyeLabel}>The Method</span>
          </div>

          {/* Large step number */}
          <div ref={numRef} className={styles.stepNum} aria-hidden="true">
            {step.num}
          </div>

          {/* Step label + rule */}
          <div className={styles.stepMeta}>
            <span className={styles.stepLabel}>{step.label}</span>
            <div ref={ruleRef} className={styles.rule} aria-hidden="true" />
          </div>

          {/* Title — per-character 3D */}
          <h2 className={styles.title} aria-label={step.title.replace('\n', ' ')}>
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
            {step.body}
          </p>

          {/* Tags */}
          <p ref={tagsRef} className={styles.tags}>
            {step.tags.map((tag, i) => (
              <span key={tag}>
                {tag}
                {i < step.tags.length - 1 && (
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
  const ref     = useRef(null)
  const numRef  = useRef(null)
  const headRef = useRef(null)
  const bodyRef = useRef(null)

  useEffect(() => {
    const lines = headRef.current
      ? Array.from(headRef.current.querySelectorAll('span'))
      : []

    const ctx = gsap.context(() => {
    gsap.set(numRef.current,  { opacity: 0, y: 16 })
    gsap.set(lines,           { clipPath: 'inset(0 0 100% 0)', y: 12 })
    gsap.set(bodyRef.current, { opacity: 0, y: 20 })

    const tl = gsap.timeline({
      scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true },
    })
    tl.to(numRef.current,  { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' })
    tl.to(lines, {
      clipPath: 'inset(0 0 -10% 0)', y: 0,
      duration: 1, ease: 'power3.out', stagger: 0.12,
    }, '-=0.3')
    tl.to(bodyRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
    }) // end gsap.context
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className={styles.intro}>
      <div className={styles.introInner}>
        <p ref={numRef} className={styles.introNum}>04</p>
        <h2 ref={headRef} className={styles.introHead}>
          <span>The</span>
          <span>Method.</span>
        </h2>
        <p ref={bodyRef} className={styles.introBody}>
          Four steps. No shortcuts. No hand-offs.
        </p>
      </div>
    </section>
  )
}

export default function Section4() {
  return (
    <>
      <IntroPanel />
      {STEPS.map((step, i) => (
        <StepPanel key={step.id} step={step} index={i} />
      ))}
    </>
  )
}
