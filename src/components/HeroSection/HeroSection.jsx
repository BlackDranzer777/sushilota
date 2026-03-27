/*
 * HeroSection.jsx
 *
 * Collage-style hero with five floating postal stamps below the headline.
 *
 * LAYOUT:  Full-screen dark canvas. Headline centred.
 *          Five stamps clustered below the subtitle — scattered, overlapping,
 *          like a handful dropped on a desk.
 *
 * ANIMATIONS:
 *   • Entrance: headline + subtitle slide up; stamps pop in staggered.
 *   • Float:    each stamp oscillates y independently (GSAP repeat/yoyo).
 *   • Hover:    stamp lifts, flattens rotation, shadow deepens.
 */

import { useEffect, useRef } from 'react'
import { gsap }              from 'gsap'
import { ScrollTrigger }     from 'gsap/ScrollTrigger'
import styles                from './HeroSection.module.css'

gsap.registerPlugin(ScrollTrigger)

/* ── Stamp definitions ────────────────────────────────────────────── */
const STAMPS = [
  {
    img:      '/assets/mix-bg/Untitled_Artwork 14.png',
    rot:      -5,
    x:        12,
    y:        48,
    floatAmp: 6,
    floatDur: 5.0,
    delay:    0.0,
    zIndex:   1,           /* bottom of the pile */
  },
  {
    img:      '/assets/mix-bg/Untitled_Artwork 2.png',
    rot:      -7,
    x:        -195,
    y:        10,
    floatAmp: 9,
    floatDur: 3.8,
    delay:    0.08,
    zIndex:   3,
  },
  {
    img:      '/assets/pink-bg/Untitled_Artwork 6.png',
    rot:      8,
    x:        205,
    y:        -8,
    floatAmp: 8,
    floatDur: 4.1,
    delay:    0.18,
    zIndex:   2,
  },
  {
    img:      '/assets/orange-bg/Untitled_Artwork 3.png',
    rot:      -2,
    x:        88,
    y:        22,
    floatAmp: 11,
    floatDur: 3.5,
    delay:    0.3,
    zIndex:   4,
  },
  {
    img:      '/assets/teal-bg/Untitled_Artwork 1.png',
    rot:      4,
    x:        -52,
    y:        -22,
    floatAmp: 7,
    floatDur: 4.4,
    delay:    0.42,
    zIndex:   5,           /* top of the pile */
  },
]

export default function HeroSection() {
  const sectionRef    = useRef(null)
  const eyebrowRef    = useRef(null)
  const headRef       = useRef(null)
  const subtitleRef   = useRef(null)
  const scrollHintRef = useRef(null)

  /* One ref per stamp — outer wrapper (rotation + scale) */
  const outerRefs   = useRef([])
  /* Inner wrapper — y float */
  const innerRefs   = useRef([])
  /* Stored float tweens so we can pause/resume on hover */
  const floatTweens = useRef([])

  /* ── Entrance + floating loops ──────────────────────────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(outerRefs.current,  { opacity: 0, scale: 0.78 })
      gsap.set(
        [eyebrowRef.current, headRef.current, subtitleRef.current],
        { opacity: 0, y: 32 },
      )
      gsap.set(scrollHintRef.current, { opacity: 0 })

      /* Text entrance */
      const tl = gsap.timeline({ delay: 0.3 })
      tl.to(eyebrowRef.current,   { opacity: 1, y: 0, duration: 0.7,  ease: 'power3.out' })
        .to(headRef.current,      { opacity: 1, y: 0, duration: 0.9,  ease: 'power3.out' }, '-=0.45')
        .to(subtitleRef.current,  { opacity: 1, y: 0, duration: 0.7,  ease: 'power3.out' }, '-=0.5')
        .to(scrollHintRef.current,{ opacity: 1,        duration: 0.6               }, '-=0.3')

      /* Stamps pop in staggered */
      STAMPS.forEach((s, i) => {
        tl.to(outerRefs.current[i], {
          opacity: 1, scale: 1,
          duration: 0.65, ease: 'back.out(1.4)',
        }, 0.5 + s.delay)
      })

      /* Floating loops — start after each stamp enters */
      STAMPS.forEach((s, i) => {
        const tw = gsap.to(innerRefs.current[i], {
          y:        s.floatAmp,
          duration: s.floatDur,
          ease:     'sine.inOut',
          repeat:   -1,
          yoyo:     true,
          delay:    1.1 + s.delay,
        })
        floatTweens.current[i] = tw
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  /* ── Hover handlers ─────────────────────────────────────────────── */
  const hoverIn = (i) => {
    if (floatTweens.current[i]) floatTweens.current[i].pause()
    gsap.to(outerRefs.current[i], {
      scale: 1.10, rotation: 0,
      duration: 0.4, ease: 'power2.out', overwrite: 'auto',
    })
    gsap.to(innerRefs.current[i], {
      y: -10, duration: 0.35, ease: 'power2.out', overwrite: 'auto',
    })
    gsap.set(outerRefs.current[i], { zIndex: 20 })
  }

  const hoverOut = (i, rot) => {
    gsap.to(outerRefs.current[i], {
      scale: 1, rotation: rot,
      duration: 0.55, ease: 'power3.out', overwrite: 'auto',
    })
    gsap.to(innerRefs.current[i], {
      y: 0,
      duration: 0.55, ease: 'power3.out', overwrite: 'auto',
      onComplete: () => {
        if (floatTweens.current[i]) floatTweens.current[i].resume()
      },
    })
    gsap.set(outerRefs.current[i], { zIndex: STAMPS[i].zIndex })
  }

  return (
    <section ref={sectionRef} className={styles.hero} id="hero-new">

      {/* Noise grain */}
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

      {/* ── Stamps cluster ────────────────────────────────────────── */}
      <div className={styles.stampsCluster} aria-hidden="true">
        {STAMPS.map((s, i) => (
          <div
            key={i}
            ref={el => { outerRefs.current[i] = el }}
            className={styles.stampOuter}
            style={{
              '--rot': `${s.rot}deg`,
              '--tx':  `${s.x}px`,
              '--ty':  `${s.y}px`,
              zIndex:  s.zIndex,
            }}
            onMouseEnter={() => hoverIn(i)}
            onMouseLeave={() => hoverOut(i, s.rot)}
          >
            <div ref={el => { innerRefs.current[i] = el }}>
              <div className={styles.stamp}>
                <img src={s.img} className={styles.stampImg} alt="" />
                <div className={styles.stampFoot}>
                  <span className={styles.stampVal}>₹ 5.00</span>
                  <span className={styles.stampCountry}>INDIA</span>
                </div>
                <div className={styles.postmark} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll hint */}
      <div ref={scrollHintRef} className={styles.scrollHint} aria-hidden="true">
        <span className={styles.scrollLine} />
        <span className={styles.scrollText}>Scroll</span>
      </div>

    </section>
  )
}
