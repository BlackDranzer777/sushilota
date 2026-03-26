/*
 * ObjectivesSection.jsx
 *
 * LAYOUT:  Fullscreen dark section. Three "posters" arranged across
 *          the viewport, each animating in like being slapped on a wall
 *          (flies in from off-screen with a slight overshoot + rotate settle).
 *
 * ANIMATION:
 *   • Each poster enters from a different origin (top-left, top-center, top-right)
 *   • Rotation eases from a tilted angle to a final slight tilt
 *   • Scale from 0.7 → 1.0 with elastic ease
 *   • Triggered once when section enters viewport
 *
 * IMAGES: mix-bg/Untitled_Artwork 14.png + mix-bg/Untitled_Artwork 2.png
 */

import { useEffect, useRef } from 'react'
import { gsap }              from 'gsap'
import { ScrollTrigger }     from 'gsap/ScrollTrigger'
import styles                from './ObjectivesSection.module.css'

gsap.registerPlugin(ScrollTrigger)

const OBJECTIVES = [
  {
    num:   '01',
    title: 'Build Recognition',
    body:  'Create a visual and verbal identity so consistent and compelling that your audience recognises you before they read your name.',
    img:   '/assets/mix-bg/Untitled_Artwork 14.png',
    rotate: -2.5,
    color:  '#E8490C',
  },
  {
    num:   '02',
    title: 'Drive Engagement',
    body:  'Move people from passive viewers to active participants. Content that earns attention, not just impressions.',
    img:   '/assets/teal-bg/Untitled_Artwork 11.png',
    rotate:  1.2,
    color:  '#026b64',
  },
  {
    num:   '03',
    title: 'Earn Trust',
    body:  'Trust is the rarest currency in marketing. We build it through honesty, quality, and the consistency of showing up — every time.',
    img:   '/assets/mix-bg/Untitled_Artwork 2.png',
    rotate: -1.0,
    color:  '#F6EDD8',
  },
]

export default function ObjectivesSection() {
  const sectionRef = useRef(null)
  const headRef    = useRef(null)
  const labelRef   = useRef(null)
  const posterRefs = useRef([])
  posterRefs.current = []

  useEffect(() => {
    const ctx = gsap.context(() => {
      const trigger = { trigger: sectionRef.current, start: 'top 65%', once: true }

      /* Initial states — posters fly in from above */
      posterRefs.current.forEach((el, i) => {
        const directions = [
          { x: -120, y: -180, rot: -18 },
          { x:    0, y: -220, rot:   4 },
          { x:  120, y: -180, rot:  16 },
        ]
        const d = directions[i]
        gsap.set(el, {
          x: d.x, y: d.y,
          rotation: d.rot,
          scale: 0.72,
          opacity: 0,
          transformOrigin: 'center top',
        })
      })

      gsap.set(labelRef.current, { opacity: 0, y: 16 })
      gsap.set(headRef.current,  { opacity: 0, y: 32 })

      gsap.timeline({ scrollTrigger: trigger })
        .to(labelRef.current, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' })
        .to(headRef.current,  { opacity: 1, y: 0, duration: 0.7,  ease: 'power3.out' }, '-=0.3')
        .to(posterRefs.current, {
          x: 0, y: 0,
          rotation: (i) => OBJECTIVES[i].rotate,
          scale:    1,
          opacity:  1,
          duration: 0.9,
          ease:     'back.out(1.4)',
          stagger:  0.14,
        }, '-=0.2')
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  /* Subtle float on hover */
  const onHoverIn  = (i) => gsap.to(posterRefs.current[i], { y: -12, scale: 1.03, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
  const onHoverOut = (i) => gsap.to(posterRefs.current[i], { y: 0,   scale: 1,    rotation: OBJECTIVES[i].rotate, duration: 0.5, ease: 'power3.out', overwrite: 'auto' })

  return (
    <section ref={sectionRef} className={styles.section} id="objectives">

      <div className={styles.header}>
        <p ref={labelRef} className={styles.label}>04&nbsp;—&nbsp;Our Objectives</p>
        <h2 ref={headRef} className={styles.heading}>
          Three things<br />we obsess over.
        </h2>
      </div>

      <div className={styles.posters}>
        {OBJECTIVES.map(({ num, title, body, img, color }, i) => (
          <div
            key={num}
            ref={(el) => { if (el) posterRefs.current[i] = el }}
            className={styles.poster}
            onMouseEnter={() => onHoverIn(i)}
            onMouseLeave={() => onHoverOut(i)}
          >
            {/* Pin effect */}
            <span className={styles.pin} style={{ background: color }} aria-hidden="true" />

            <div className={styles.posterImg}>
              <img src={img} alt="" aria-hidden="true" />
            </div>
            <div className={styles.posterContent}>
              <span className={styles.posterNum} style={{ color }}>{num}</span>
              <h3 className={styles.posterTitle}>{title}</h3>
              <p  className={styles.posterBody}>{body}</p>
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}
