/*
 * CTASection.jsx
 *
 * Minimal, high-contrast closing section.
 * Large headline + single email CTA.
 * Light animation: fade + slide up once, no heavy scroll effects.
 */

import { useEffect, useRef } from 'react'
import { gsap }              from 'gsap'
import { ScrollTrigger }     from 'gsap/ScrollTrigger'
import styles                from './CTASection.module.css'

gsap.registerPlugin(ScrollTrigger)

export default function CTASection() {
  const sectionRef = useRef(null)
  const line1Ref   = useRef(null)
  const line2Ref   = useRef(null)
  const subRef     = useRef(null)
  const ctaRef     = useRef(null)
  const rulerRef   = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const lines = [line1Ref.current, line2Ref.current].filter(Boolean)

      gsap.set(lines,          { clipPath: 'inset(0 0 100% 0)', y: 16 })
      gsap.set(subRef.current, { opacity: 0, y: 20 })
      gsap.set(ctaRef.current, { opacity: 0, y: 16 })
      gsap.set(rulerRef.current, { scaleX: 0, transformOrigin: 'left center' })

      gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
      })
        .to(rulerRef.current, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' })
        .to(lines, { clipPath: 'inset(0 0 -10% 0)', y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 }, '-=0.5')
        .to(subRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.35')
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className={styles.section} id="contact">

      <div className={styles.inner}>
        <div ref={rulerRef} className={styles.ruler} aria-hidden="true" />

        <h2 className={styles.heading}>
          <span ref={line1Ref} className={styles.headLine}>Ready to build</span>
          <span ref={line2Ref} className={styles.headLine}>something that matters?</span>
        </h2>

        <p ref={subRef} className={styles.sub}>
          Let's talk about your brand. No decks, no hard sell — just a conversation.
        </p>

        <div ref={ctaRef} className={styles.actions}>
          <a href="mailto:hello@sushilota.com" className={styles.ctaPrimary}>
            hello@sushilota.com
            <span aria-hidden="true">↗</span>
          </a>
          <span className={styles.ctaDivider} aria-hidden="true">or</span>
          <a href="tel:+911234567890" className={styles.ctaSecondary}>
            Call us
          </a>
        </div>

        <div className={styles.footer}>
          <span className={styles.footerBrand}>Sushi&nbsp;Lota</span>
          <span className={styles.footerCity}>Jaipur, India</span>
          <span className={styles.footerYear}>© {new Date().getFullYear()}</span>
        </div>
      </div>

    </section>
  )
}
