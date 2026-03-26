/*
 * StrategySection.jsx
 *
 * LAYOUT: Full-height section. Centred headline above a 3-pillar grid.
 *         Illustration from teal-bg sits as a background layer behind the grid.
 *
 * ANIMATION:
 *   • Heading lines clip-reveal on scroll (once).
 *   • Each pillar flies up staggered after the heading settles.
 *   • Illustration scales from 1.15 → 1.0 with slight y-parallax.
 */

import { useEffect, useRef } from 'react'
import { gsap }              from 'gsap'
import { ScrollTrigger }     from 'gsap/ScrollTrigger'
import styles                from './StrategySection.module.css'

gsap.registerPlugin(ScrollTrigger)


const PILLARS = [
  {
    num:   '01',
    title: 'Clarity',
    body:  'We strip every brand down to its essential truth — then build outward from there.',
  },
  {
    num:   '02',
    title: 'Intention',
    body:  'Nothing we ship is accidental. Every choice answers a strategic "why."',
  },
  {
    num:   '03',
    title: 'Resonance',
    body:  'Strategy without emotion is a blueprint without a soul. We make people feel it.',
  },
]

export default function StrategySection() {
  const sectionRef  = useRef(null)
  const labelRef    = useRef(null)
  const head1Ref    = useRef(null)
  const head2Ref    = useRef(null)
  const pillarsRef  = useRef(null)
  const imgRef      = useRef(null)

  const pillarRefs  = useRef([])
  pillarRefs.current = []

  useEffect(() => {
    const ctx = gsap.context(() => {
      const trigger = { trigger: sectionRef.current, start: 'top 68%', once: true }

      gsap.set(labelRef.current, { opacity: 0, y: 16 })
      gsap.set([head1Ref.current, head2Ref.current], { clipPath: 'inset(0 0 100% 0)', y: 12 })
      pillarRefs.current.forEach(el => gsap.set(el, { opacity: 0, y: 40 }))
      gsap.set(imgRef.current, { opacity: 0 })

      gsap.timeline({ scrollTrigger: trigger })
        .to(imgRef.current, { opacity: 1, duration: 1.4, ease: 'power3.out' }, 0)
        .to(labelRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.2)
        .to([head1Ref.current, head2Ref.current], {
          clipPath: 'inset(0 0 -10% 0)', y: 0,
          duration: 0.9, ease: 'power3.out', stagger: 0.1,
        }, 0.4)
        .to(pillarRefs.current, {
          opacity: 1, y: 0,
          duration: 0.7, ease: 'power3.out', stagger: 0.12,
        }, 0.9)
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  /* No parallax on the illustration — it fills the section as a static bg */

  return (
    <section ref={sectionRef} className={styles.section} id="strategy">

      {/* Teal illustration — CSS background-image, no img sizing artefacts */}
      <div
        ref={imgRef}
        className={styles.imgWrap}
        aria-hidden="true"
      />

      {/* Content overlay */}
      <div className={styles.inner}>
        <p ref={labelRef} className={styles.label}>
          02&nbsp;—&nbsp;Our Strategy
        </p>

        <h2 className={styles.heading}>
          <span ref={head1Ref} className={styles.headLine}>Think deeper.</span>
          <span ref={head2Ref} className={styles.headLine}>Move further.</span>
        </h2>

        {/* Pillar grid */}
        <div ref={pillarsRef} className={styles.grid}>
          {PILLARS.map(({ num, title, body }, i) => (
            <div
              key={num}
              className={styles.pillar}
              ref={(el) => { if (el) pillarRefs.current[i] = el }}
            >
              <span className={styles.pillarNum}>{num}</span>
              <h3 className={styles.pillarTitle}>{title}</h3>
              <p  className={styles.pillarBody}>{body}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}
