/*
 * Section2.jsx
 *
 * TEXT:   GSAP ScrollTrigger — more reliable than Framer Motion whileInView
 *         on mobile. Each heading line reveals via clipPath, label/body/CTA
 *         fade+slide up. All triggered when section enters viewport.
 *
 * BG:     Animated film grain canvas — 256×256 random noise, mix-blend-mode
 *         soft-light, paused via IntersectionObserver when off-screen.
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
  const grainRef    = useRef(null)
  const locationRef = useRef(null)
  const line0Ref    = useRef(null)
  const line1Ref    = useRef(null)
  const line2Ref    = useRef(null)
  const bodyRef     = useRef(null)
  const ctaRef      = useRef(null)

  const rafRef     = useRef(null)
  const visibleRef = useRef(false)

  /* ── GSAP text animations ─────────────────────────────────────── */
  useEffect(() => {
    const lineRefs = [line0Ref, line1Ref, line2Ref]
    const lines    = lineRefs.map(r => r.current).filter(Boolean)

    /* Set initial states */
    gsap.set(lines, { clipPath: 'inset(0 0 100% 0)', y: 10 })
    gsap.set(
      [locationRef.current, bodyRef.current, ctaRef.current],
      { opacity: 0, y: 24 }
    )

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger:  sectionRef.current,
        start:    'top 85%',   /* fires when top of section is 85% down the viewport */
        once:     true,
      },
    })

    /* Location label */
    tl.to(locationRef.current, {
      opacity: 1, y: 0,
      duration: 0.7, ease: 'power3.out',
    })

    /* Heading lines — clipPath reveal with stagger */
    tl.to(lines, {
      clipPath: 'inset(0 0 -10% 0)',
      y:        0,
      duration: 0.85,
      ease:     'power3.out',
      stagger:  0.1,
    }, '-=0.4')

    /* Body + CTA */
    tl.to([bodyRef.current, ctaRef.current], {
      opacity: 1, y: 0,
      duration: 0.7, ease: 'power3.out',
      stagger: 0.1,
    }, '-=0.4')

    return () => tl.scrollTrigger?.kill()
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
      rafRef.current = requestAnimationFrame(tick)
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

    rafRef.current = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(rafRef.current); io.disconnect() }
  }, [])

  return (
    <section ref={sectionRef} id="section-2" className={styles.section}>

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

        <a
          ref={ctaRef}
          href="#contact"
          className={styles.cta}
        >
          Work with us
        </a>

      </div>
    </section>
  )
}
