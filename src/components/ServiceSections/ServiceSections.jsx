/*
 * ServiceSections.jsx
 * Composes all post-hero content sections in order:
 * Service cards → Statement break → CTA section
 * Data sourced from services.js — no content hardcoded here.
 */

import { motion } from 'framer-motion'
import { SERVICES, STATEMENT_QUOTE } from '../../data/services'
import ServiceCard from '../ServiceCard/ServiceCard'
import styles from './ServiceSections.module.css'

const fadeUp = {
  initial:    { y: 40, opacity: 0 },
  whileInView:{ y: 0,  opacity: 1 },
  viewport:   { once: true, margin: '-80px' },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
}

export default function ServiceSections() {
  return (
    <>
      {/* ── Service cards ─────────────────────── */}
      {SERVICES.map((service, i) => (
        <ServiceCard key={service.id} service={service} index={i} />
      ))}

      {/* ── Statement break (full amber) ──────── */}
      <section className={styles.statement} aria-label="Brand statement">
        <motion.blockquote className={styles.quote} {...fadeUp}>
          "{STATEMENT_QUOTE}"
        </motion.blockquote>
      </section>

      {/* ── CTA section ───────────────────────── */}
      <section className={styles.cta} id="contact" aria-label="Call to action">
        <div className={styles.ctaInner}>
          <motion.p className={styles.ctaLabel} {...fadeUp}>
            Let's begin
          </motion.p>
          <motion.h2
            className={styles.ctaTitle}
            {...fadeUp}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            Ready to craft<br />your story?
          </motion.h2>
          <motion.p
            className={styles.ctaSub}
            {...fadeUp}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            Let's build something extraordinary together.
          </motion.p>
          <motion.a
            href="mailto:hello@sushilota.com"
            className={styles.ctaBtn}
            {...fadeUp}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
          >
            Work with us
          </motion.a>
        </div>
      </section>
    </>
  )
}
