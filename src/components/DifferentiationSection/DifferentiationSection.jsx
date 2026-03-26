/*
 * DifferentiationSection.jsx
 *
 * LAYOUT:  Outer container is 500vh. Inner track is a sticky horizontal
 *          scroll container that translates left as the user scrolls down.
 *          Four panels, each 100vw wide.
 *
 * ANIMATION:
 *   • Track translates X 0 → -(3 × 100vw) mapped to scroll progress.
 *   • Per-panel: heading + body reveal when panel enters viewport
 *     (using nested ScrollTrigger on the horizontal position).
 *   • Images scale from 1.1 → 1.0 as their panel arrives.
 *
 * IMAGES:  mix-bg × 2, teal-bg × 2
 */

import { useEffect, useRef } from 'react'
import { gsap }              from 'gsap'
import { ScrollTrigger }     from 'gsap/ScrollTrigger'
import styles                from './DifferentiationSection.module.css'

gsap.registerPlugin(ScrollTrigger)

const PANELS = [
  {
    num:   '01',
    title: 'We think first.',
    body:  'Before a single pixel is pushed, we spend time understanding your world. Research, empathy, strategy — the invisible work that makes visible work matter.',
    img:   '/assets/mix-bg/Untitled_Artwork 14.png',
    bg:    '#F6EDD8',
    text:  '#0a1a18',
  },
  {
    num:   '02',
    title: 'We build deep.',
    body:  'Surface-level work fades. We construct identities with structural integrity — every layer thought through, every element intentional.',
    img:   '/assets/teal-bg/Untitled_Artwork 5.png',
    bg:    '#026b64',
    text:  '#F6EDD8',
  },
  {
    num:   '03',
    title: 'We stay present.',
    body:  "Our relationship doesn't end at delivery. We remain in the work — iterating, adapting, growing with your brand through every phase.",
    img:   '/assets/teal-bg/Untitled_Artwork 9.png',
    bg:    '#0a1a18',
    text:  '#F6EDD8',
  },
  {
    num:   '04',
    title: 'We make you matter.',
    body:  'In a world of noise, we build meaning. Not just recognition — resonance. The kind of brand people remember and return to.',
    img:   '/assets/mix-bg/Untitled_Artwork 2.png',
    bg:    '#E8490C',
    text:  '#F6EDD8',
  },
]

export default function DifferentiationSection() {
  const outerRef = useRef(null)
  const trackRef = useRef(null)
  const panelRefs = useRef([])
  panelRefs.current = []

  /* ── Horizontal scroll ─────────────────────────────────────────── */
  useEffect(() => {
    const panels = panelRefs.current.filter(Boolean)

    const ctx = gsap.context(() => {
      const tween = gsap.to(trackRef.current, {
        x: () => -(trackRef.current.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger:  outerRef.current,
          start:    'top top',
          end:      () => `+=${outerRef.current.offsetHeight - window.innerHeight}`,
          scrub:    1,
          pin:      false,
          invalidateOnRefresh: true,
        },
      })

      /* Per-panel reveal using the horizontal scrub progress */
      panels.forEach((panel, i) => {
        const img     = panel.querySelector(`.${styles.panelImg}`)
        const head    = panel.querySelector(`.${styles.panelTitle}`)
        const body    = panel.querySelector(`.${styles.panelBody}`)
        const numEl   = panel.querySelector(`.${styles.panelNum}`)

        gsap.set([head, body, numEl], { opacity: 0, y: 32 })
        gsap.set(img, { scale: 1.12, opacity: 0 })

        ScrollTrigger.create({
          trigger:    outerRef.current,
          start:      () => `top+=${i * (window.innerHeight * (PANELS.length + 1) / (PANELS.length + 0.5))} top`,
          end:        () => `top+=${(i + 1.2) * (window.innerHeight * (PANELS.length + 1) / (PANELS.length + 0.5))} top`,
          onEnter:    () => {
            gsap.to(img,             { scale: 1, opacity: 1, duration: 1,    ease: 'power3.out' })
            gsap.to(numEl,           { opacity: 1, y: 0,    duration: 0.55,  ease: 'power3.out', delay: 0.1 })
            gsap.to(head,            { opacity: 1, y: 0,    duration: 0.75,  ease: 'power3.out', delay: 0.2 })
            gsap.to(body,            { opacity: 1, y: 0,    duration: 0.65,  ease: 'power3.out', delay: 0.35 })
          },
          once: true,
        })
      })
    }, outerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={outerRef} className={styles.outer} id="differentiation">

      {/* Sticky intro label */}
      <div className={styles.stickyLabel} aria-hidden="true">
        <span>03</span>
        <span>—</span>
        <span>Why&nbsp;Us</span>
      </div>

      {/* Horizontal track */}
      <div className={styles.sticky}>
        <div ref={trackRef} className={styles.track}>
          {PANELS.map((panel, i) => (
            <div
              key={panel.num}
              ref={(el) => { if (el) panelRefs.current[i] = el }}
              className={styles.panel}
              style={{ '--panel-bg': panel.bg, '--panel-text': panel.text }}
            >
              {/* Left: text */}
              <div className={styles.panelText}>
                <span className={styles.panelNum}>{panel.num}</span>
                <h2 className={styles.panelTitle}>{panel.title}</h2>
                <p  className={styles.panelBody}>{panel.body}</p>
              </div>

              {/* Right: image */}
              <div className={styles.panelVisual}>
                <img
                  src={panel.img}
                  alt=""
                  aria-hidden="true"
                  className={styles.panelImg}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
