/*
 * HeroSection.jsx
 *
 * Collage-style hero — distinct from CinematicHero's WebGL ink effect.
 *
 * LAYOUT:  Full-screen dark canvas with two illustrations floating
 *          at the periphery (mix-bg). Headline centred.
 *
 * ANIMATIONS:
 *   • Entrance: images scale+fade in, headline + subtitle slide up.
 *   • Scroll parallax: each image moves at a different speed (scrub).
 *   • Mouse parallax: images shift on cursor position (rAF loop).
 */

import { useEffect, useRef } from 'react'
import { gsap }              from 'gsap'
import { ScrollTrigger }     from 'gsap/ScrollTrigger'
import styles                from './HeroSection.module.css'

gsap.registerPlugin(ScrollTrigger)

const IMG_1 = '/assets/mix-bg/Untitled_Artwork 2.png'
const IMG_2 = '/assets/mix-bg/Untitled_Artwork 14.png'

export default function HeroSection() {
  const sectionRef    = useRef(null)
  const img1Ref       = useRef(null)
  const img2Ref       = useRef(null)
  const eyebrowRef    = useRef(null)
  const headRef       = useRef(null)
  const subtitleRef   = useRef(null)
  const scrollHintRef = useRef(null)
  const mouseRafRef   = useRef(null)

  /* ── Entrance animation ─────────────────────────────────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([img1Ref.current, img2Ref.current], { opacity: 0, scale: 1.08 })
      gsap.set([eyebrowRef.current, headRef.current, subtitleRef.current], { opacity: 0, y: 32 })
      gsap.set(scrollHintRef.current, { opacity: 0 })

      gsap.timeline({ delay: 0.4 })
        .to([img1Ref.current, img2Ref.current], {
          opacity: 1, scale: 1,
          duration: 1.6, ease: 'power3.out', stagger: 0.2,
        })
        .to(eyebrowRef.current, {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        }, '-=1.0')
        .to(headRef.current, {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        }, '-=0.55')
        .to(subtitleRef.current, {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        }, '-=0.55')
        .to(scrollHintRef.current, {
          opacity: 1, duration: 0.6,
        }, '-=0.3')
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  /* ── Scroll parallax (different depths per image) ───────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const base = {
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start:   'top top',
          end:     'bottom top',
          scrub:   true,
        },
      }
      gsap.to(img1Ref.current, { ...base, y: '-22%' })
      gsap.to(img2Ref.current, { ...base, y: '-38%' })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  /* ── Mouse parallax ─────────────────────────────────────────────── */
  useEffect(() => {
    let tx = 0, ty = 0, cx = 0, cy = 0

    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth  - 0.5) * 2
      ty = (e.clientY / window.innerHeight - 0.5) * 2
    }

    const tick = () => {
      mouseRafRef.current = requestAnimationFrame(tick)
      cx += (tx - cx) * 0.05
      cy += (ty - cy) * 0.05
      gsap.set(img1Ref.current, { x: cx *  22, y: cy *  12 })
      gsap.set(img2Ref.current, { x: cx * -32, y: cy * -18 })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    mouseRafRef.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(mouseRafRef.current)
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.hero} id="hero-new">

      {/* Collage illustration 1 — top-left */}
      <div ref={img1Ref} className={`${styles.collage} ${styles.collage1}`}>
        <img src={IMG_1} alt="" aria-hidden="true" />
      </div>

      {/* Collage illustration 2 — bottom-right */}
      <div ref={img2Ref} className={`${styles.collage} ${styles.collage2}`}>
        <img src={IMG_2} alt="" aria-hidden="true" />
      </div>

      {/* Noise grain overlay */}
      <div className={styles.grain} aria-hidden="true" />

      {/* Centre content */}
      <div className={styles.center}>
        <p ref={eyebrowRef} className={styles.eyebrow}>
          Brand Agency&nbsp;·&nbsp;Jaipur
        </p>
        <h1 ref={headRef} className={styles.headline}>
          <span>We craft brands</span>
          <span>that matter.</span>
        </h1>
        <p ref={subtitleRef} className={styles.subtitle}>
          Strategy&nbsp;·&nbsp;Design&nbsp;·&nbsp;Storytelling
        </p>
      </div>

      {/* Scroll hint */}
      <div ref={scrollHintRef} className={styles.scrollHint} aria-hidden="true">
        <span className={styles.scrollLine} />
        <span className={styles.scrollText}>Scroll</span>
      </div>

    </section>
  )
}
