/*
 * Section2.jsx — Stamp Zoom
 *
 * Illustration starts as a postal stamp centered on a dark field.
 * On scroll, the stamp zooms (Ken Burns) + drifts right.
 * The stamp border dissolves early, leaving raw image.
 * At 50% scroll progress the text block slides in from bottom-right
 * and settles on the left — like a film title card.
 *
 * SCROLL TIMELINE  (scrub, total = 2.0)
 *   0 → 2.0  : stamp scale 1 → 3.2, x → +14vw
 *   0 → 0.7  : stamp border + foot + postmark fade to 0
 *   0.5 → 1.1: left gradient fades in (text readability)
 *   1.0 → 2.0: content block x: +36vw,y: 80 → 0,0; opacity 0 → 1
 *   1.1 → 1.8: individual text lines reveal
 */

import { useEffect, useRef } from 'react'
import { gsap }              from 'gsap'
import { ScrollTrigger }     from 'gsap/ScrollTrigger'
import styles                from './Section2.module.css'

gsap.registerPlugin(ScrollTrigger)

const HEADING_LINES = [
  "We don't just market",
  'brands. We make them',
  'matter.',
]

const IMG = '/assets/teal-bg/Untitled_Artwork 9.png'

export default function Section2() {
  const travelRef      = useRef(null)
  const shellRef       = useRef(null)   /* grows + drifts right            */
  const borderRef      = useRef(null)   /* stamp frame overlay — fades     */
  const footRef        = useRef(null)   /* denomination row — fades        */
  const postmarkRef    = useRef(null)   /* ink postmark — fades            */
  const leftOverlayRef = useRef(null)   /* dark left gradient — fades in   */
  const contentRef     = useRef(null)   /* text block                      */
  const locationRef    = useRef(null)
  const line0Ref       = useRef(null)
  const line1Ref       = useRef(null)
  const line2Ref       = useRef(null)
  const bodyRef        = useRef(null)
  const ctaRef         = useRef(null)

  useEffect(() => {
    const lines = [line0Ref, line1Ref, line2Ref].map(r => r.current).filter(Boolean)

    const ctx = gsap.context(() => {
      /*
       * Inverted-scale approach for crisp quality:
       * Shell is 100vw wide (renders at full resolution).
       * Scale it DOWN to stamp size initially, animate back to 1.
       * --inv compensates all decoration sizes so they look correct when small.
       */
      const STAMP_W   = 258
      const inv       = window.innerWidth / STAMP_W   /* e.g. 5.58 at 1440px */
      const stampScale = 1 / inv                      /* e.g. 0.179           */

      shellRef.current.style.setProperty('--inv', inv)

      /* ── Initial states ──────────────────────────────────────────── */
      gsap.set(shellRef.current,      { xPercent: -50, yPercent: -50, scale: stampScale })
      gsap.set(leftOverlayRef.current,{ opacity: 0 })
      gsap.set(contentRef.current,    { x: '36vw', y: 80, opacity: 0 })
      gsap.set(lines,                 { clipPath: 'inset(0 0 100% 0)', y: 8 })
      gsap.set(
        [locationRef.current, bodyRef.current, ctaRef.current],
        { opacity: 0, y: 16 },
      )

      /* ── Master scrub timeline ───────────────────────────────────── */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: travelRef.current,
          start:   'top top',
          end:     'bottom bottom',
          scrub:   1.8,
        },
      })

      /* Stamp zooms to fill full viewport — scale 1 = 100vw, full quality */
      tl.to(shellRef.current, {
        scale:    1,
        ease:     'power1.inOut',
        duration: 2,
      }, 0)

      /* Border, foot, postmark dissolve in first 35% */
      tl.to(
        [borderRef.current, footRef.current, postmarkRef.current],
        { opacity: 0, ease: 'power1.in', duration: 0.7 },
        0,
      )

      /* Left gradient fades in for text legibility */
      tl.to(leftOverlayRef.current, {
        opacity:  1,
        ease:     'power2.out',
        duration: 0.6,
      }, 0.5)

      /* Text block enters from bottom-right at 50% scroll */
      tl.to(contentRef.current, {
        x: 0, y: 0, opacity: 1,
        ease:     'power3.out',
        duration: 1,
      }, 1.0)

      /* Label */
      tl.to(locationRef.current, {
        opacity: 1, y: 0, duration: 0.3, ease: 'power3.out',
      }, 1.1)

      /* Heading lines reveal */
      tl.to(lines, {
        clipPath: 'inset(0 0 -10% 0)', y: 0,
        duration: 0.55, stagger: 0.1, ease: 'power3.out',
      }, 1.2)

      /* Body + CTA */
      tl.to([bodyRef.current, ctaRef.current], {
        opacity: 1, y: 0,
        duration: 0.35, stagger: 0.1, ease: 'power3.out',
      }, 1.6)

    }, travelRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={travelRef} id="section-2" className={styles.travel}>
      <div className={styles.sticky}>

        {/* ── Growing stamp shell ──────────────────────────────────── */}
        {/*
         * .shell     — grows (scale + x), centered initially
         * .clipBox   — clips the image (overflow: hidden)
         * .img       — always visible
         * .borderOverlay — stamp frame visual, fades out
         * .foot      — denomination row, fades out
         * .postmark  — fades out
         */}
        <div ref={shellRef} className={styles.shell}>

          {/* Image clip layer (overflow: hidden clips the img) */}
          <div className={styles.clipBox}>
            <img src={IMG} className={styles.img} alt="" aria-hidden="true" />
          </div>

          {/* Stamp border frame — perforated ring, fades early */}
          <div ref={borderRef} className={styles.borderOverlay} aria-hidden="true" />

          {/* Denomination foot — fades with border */}
          <div ref={footRef} className={styles.foot} aria-hidden="true">
            <span className={styles.footVal}>₹ 5.00</span>
            <span className={styles.footCountry}>INDIA</span>
          </div>

          {/* Postmark */}
          <div ref={postmarkRef} className={styles.postmark} aria-hidden="true" />

        </div>

        {/* Dark left gradient — fades in, makes text readable */}
        <div ref={leftOverlayRef} className={styles.leftOverlay} aria-hidden="true" />

        {/* ── Text — enters bottom-right, settles left ─────────────── */}
        <div ref={contentRef} className={styles.content}>

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

      </div>
    </section>
  )
}
