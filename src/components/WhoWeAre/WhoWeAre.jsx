/*
 * WhoWeAre.jsx
 *
 * LAYOUT: Two-column — left text, right editorial collage.
 * ANIMATION: Elements reveal one by one on scroll (ScrollTrigger, once).
 * IMAGE: mix-bg/Untitled_Artwork 2.png (framed, slight tilt).
 */

import { useEffect, useRef } from 'react'
import { gsap }              from 'gsap'
import { ScrollTrigger }     from 'gsap/ScrollTrigger'
import styles                from './WhoWeAre.module.css'

gsap.registerPlugin(ScrollTrigger)

const ILLUSTRATION = '/assets/mix-bg/Untitled_Artwork 2.png'

const STATS = [
  { value: '8+',  label: 'Years of craft' },
  { value: '60+', label: 'Brands built'   },
  { value: '3×',  label: 'Avg. growth'    },
]

export default function WhoWeAre() {
  const sectionRef = useRef(null)
  const labelRef   = useRef(null)
  const headRef    = useRef(null)
  const bodyRef    = useRef(null)
  const statsRef   = useRef(null)
  const ctaRef     = useRef(null)
  const imgRef     = useRef(null)
  const frameRef   = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const trigger = { trigger: sectionRef.current, start: 'top 72%', once: true }

      gsap.set(labelRef.current,  { opacity: 0, y: 20 })
      gsap.set(headRef.current,   { opacity: 0, y: 40 })
      gsap.set(bodyRef.current,   { opacity: 0, y: 28 })
      gsap.set(statsRef.current,  { opacity: 0, y: 24 })
      gsap.set(ctaRef.current,    { opacity: 0, y: 20 })
      gsap.set(imgRef.current,    { opacity: 0, scale: 1.06, y: 30 })
      gsap.set(frameRef.current,  { opacity: 0, scale: 0.96 })

      gsap.timeline({ scrollTrigger: trigger })
        .to(labelRef.current,  { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out' })
        .to(headRef.current,   { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }, '-=0.35')
        .to(bodyRef.current,   { opacity: 1, y: 0, duration: 0.7,  ease: 'power3.out' }, '-=0.45')
        .to(statsRef.current,  { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, '-=0.4')
        .to(ctaRef.current,    { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, '-=0.35')
        .to(frameRef.current,  { opacity: 1, scale: 1, duration: 1.0, ease: 'power3.out' }, 0.1)
        .to(imgRef.current,    { opacity: 1, scale: 1, y: 0, duration: 1.0, ease: 'power3.out' }, 0.2)
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  /* Subtle image parallax on scroll */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(imgRef.current, {
        y: '-12%',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start:   'top bottom',
          end:     'bottom top',
          scrub:   1.2,
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className={styles.section} id="who-we-are">

      {/* ── Text column ────────────────────────────────────────────── */}
      <div className={styles.text}>
        <p ref={labelRef} className={styles.label}>
          Who&nbsp;We&nbsp;Are
        </p>

        <h2 className={styles.heading}>
          <span ref={headRef}>
            Rooted in culture.<br />
            Built to endure.
          </span>
        </h2>

        <p ref={bodyRef} className={styles.body}>
          Sushi Lota is a full-service creative and marketing agency born out of
          Jaipur's rich artistic heritage. We blend the precision of an itamae
          with the ambition of modern branding — crafting identities that don't
          just look good, but carry meaning.
        </p>

        <div ref={statsRef} className={styles.stats}>
          {STATS.map(({ value, label }) => (
            <div key={label} className={styles.stat}>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>

        <a ref={ctaRef} href="#contact" className={styles.cta}>
          Our Story
          <span className={styles.ctaArrow} aria-hidden="true">→</span>
        </a>
      </div>

      {/* ── Image column ───────────────────────────────────────────── */}
      <div className={styles.imageCol}>
        <div ref={frameRef} className={styles.frame}>
          <div className={styles.frameInner}>
            <img
              ref={imgRef}
              src={ILLUSTRATION}
              alt="Sushi Lota — editorial collage"
              className={styles.illustration}
            />
          </div>
          {/* Decorative corner accents */}
          <span className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
          <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />
        </div>
      </div>

    </section>
  )
}
