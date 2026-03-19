/*
 * ServiceCard.jsx
 * A single service section with Framer Motion entrance animations.
 * Alternates between LAYOUT A (text left, visual right) for all services.
 * Receives a service object from services.js data.
 *
 * ILLUSTRATION SWAP:
 *   The large .visual emoji in each card corresponds to a service illustration.
 *   When real PNGs are ready, replace the <span> emoji in the visual div with:
 *   <img src={importedPng} alt={service.label} className={styles.visualImg} />
 *   See ILLUSTRATION_SWAP_GUIDE.md for the full list.
 */

import { motion } from 'framer-motion'
import styles from './ServiceCard.module.css'

const fadeUp = {
  initial:    { y: 48, opacity: 0 },
  whileInView:{ y: 0,  opacity: 1 },
  viewport:   { once: true, margin: '-100px' },
}

const tagVariants = {
  initial:    { scale: 0.8, opacity: 0 },
  whileInView:{ scale: 1,   opacity: 1 },
  viewport:   { once: true, margin: '-80px' },
}

const visualVariants = {
  initial:    { scale: 0.6, rotate: -10, opacity: 0 },
  whileInView:{ scale: 1,   rotate: 0,   opacity: 1 },
  viewport:   { once: true, margin: '-80px' },
  transition: { type: 'spring', damping: 14, stiffness: 80 },
}

export default function ServiceCard({ service, index }) {
  const isDark = service.textColor === '#ffffff'

  return (
    <section
      id={service.id}
      className={styles.section}
      style={{
        background:  service.bg,
        color:       service.textColor,
      }}
    >
      {/* Decorative Roman numeral — large background text */}
      <span className={styles.bgNumeral} aria-hidden="true">
        {service.numeral}
      </span>

      <div className={styles.inner}>
        {/* ── Text column ─────────────────────────── */}
        <div className={styles.textCol}>
          <motion.p
            className={styles.label}
            style={{ color: isDark ? 'var(--amber)' : 'var(--teal-deep)' }}
            {...fadeUp}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {service.numeral} · {service.label}
          </motion.p>

          <motion.h2
            className={styles.title}
            {...fadeUp}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          >
            {service.title.split('\n').map((line, i) => (
              <span key={i} className={styles.titleLine}>{line}</span>
            ))}
          </motion.h2>

          <motion.p
            className={styles.body}
            style={{ color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(10,26,24,0.6)' }}
            {...fadeUp}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}
          >
            {service.body}
          </motion.p>

          {/* Service tag pills */}
          <div className={styles.tags}>
            {service.tags.map((tag, i) => (
              <motion.span
                key={tag}
                className={styles.tag}
                style={{
                  background: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(2,107,100,0.1)',
                  color: isDark ? 'var(--amber)' : 'var(--teal-deep)',
                  border: isDark
                    ? '1px solid rgba(254,178,93,0.25)'
                    : '1px solid rgba(2,107,100,0.2)',
                }}
                {...tagVariants}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.24 + i * 0.06 }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </div>

        {/* ── Visual column ────────────────────────── */}
        <div className={styles.visualCol}>
          <motion.div
            className={styles.visual}
            {...visualVariants}
          >
            {/*
              ILLUSTRATION PLACEHOLDER
              Replace <span> with <img src={...} alt={service.label} />
              See ILLUSTRATION_SWAP_GUIDE.md for which file goes here.
            */}
            <span role="img" aria-label={`${service.label} illustration placeholder`}>
              {service.visual}
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
