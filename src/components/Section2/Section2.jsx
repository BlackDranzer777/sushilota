/*
 * Section2.jsx
 *
 * TEXT:   Split-line reveal — each heading line slides up from behind
 *         an overflow:hidden clip. Label + body + CTA use a clean
 *         fade+slide. All driven by Framer Motion whileInView.
 *
 * BG:     Animated film grain — a 256×256 canvas of random noise,
 *         scaled to cover the section via CSS. Updates every 2nd frame
 *         (~30fps) for performance. mix-blend-mode: soft-light keeps
 *         it subtle and natural over the teal background.
 */

import { useEffect, useRef } from 'react'
import { motion }            from 'framer-motion'
import styles                from './Section2.module.css'

/* ── Animation presets ───────────────────────────────────────────── */
const lineReveal = (delay = 0) => ({
  initial:     { clipPath: 'inset(0 0 100% 0)', y: 10 },
  whileInView: { clipPath: 'inset(0 0 -10% 0)', y: 0 },
  viewport:    { once: true, margin: '-80px' },
  transition:  { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay },
})

const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-80px' },
  transition:  { duration: 0.85, ease: [0.16, 1, 0.3, 1], delay },
})

const HEADING_LINES = [
  "We don't just market",
  "brands. We make them",
  "matter.",
]

const GRAIN_SIZE = 256   /* canvas px — scaled up via CSS */

export default function Section2() {
  const grainRef     = useRef(null)
  const sectionRef   = useRef(null)
  const rafRef       = useRef(null)
  const visibleRef   = useRef(false)

  /* ── Animated grain canvas ───────────────────────────────────────── */
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
      if (frame % 2 !== 0) return   /* ~30fps grain update */

      const img  = ctx.createImageData(GRAIN_SIZE, GRAIN_SIZE)
      const data = img.data
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0
        data[i] = data[i + 1] = data[i + 2] = v
        data[i + 3] = 255
      }
      ctx.putImageData(img, 0, 0)
    }

    /* Pause grain when section is off-screen */
    const io = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting },
      { threshold: 0 }
    )
    if (sectionRef.current) io.observe(sectionRef.current)

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafRef.current)
      io.disconnect()
    }
  }, [])

  return (
    <section ref={sectionRef} id="section-2" className={styles.section}>

      {/* Grain overlay */}
      <canvas ref={grainRef} className={styles.grain} aria-hidden="true" />

      <div className={styles.inner}>

        {/* Label — fade+slide */}
        <div className={styles.lineWrap}>
          <motion.p className={styles.label} {...lineReveal(0)}>
            Jaipur&nbsp;·&nbsp;India
          </motion.p>
        </div>

        {/* Heading — split-line reveal, one clip per line */}
        <h2 className={styles.heading}>
          {HEADING_LINES.map((line, i) => (
            <div key={line} className={styles.lineWrap}>
              <motion.span className={styles.headingLine} {...lineReveal(i * 0.09)}>
                {line}
              </motion.span>
            </div>
          ))}
        </h2>

        {/* Body — fade+slide */}
        <motion.p className={styles.body} {...fadeUp(0.25)}>
          Sushi Lota is a full-service creative and marketing agency rooted in
          Jaipur&apos;s artistic heritage. Strategy, design, and storytelling —
          crafted with the precision of an itamae.
        </motion.p>

        {/* CTA */}
        <motion.a
          href="#contact"
          className={styles.cta}
          {...fadeUp(0.35)}
          whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
        >
          Work with us
        </motion.a>

      </div>
    </section>
  )
}
