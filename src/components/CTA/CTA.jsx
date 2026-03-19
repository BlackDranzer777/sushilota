/*
 * CTA.jsx
 * High-contrast cream/off-white contrast break section with dual CTA buttons.
 * Framer Motion entrance animation. Radial gradient background.
 */

import { motion } from 'framer-motion'
import styles from './CTA.module.css'

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden:  { y: 32, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
}

export default function CTA() {
  return (
    <section className={styles.section} id="cta">
      {/* Radial gradient background */}
      <div className={styles.bg} aria-hidden="true" />

      <motion.div
        className={styles.inner}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <motion.p className={styles.eyebrow} variants={itemVariants}>
          Start today
        </motion.p>

        <motion.h2 className={styles.heading} variants={itemVariants}>
          Your next era starts<br />
          <em>right now.</em>
        </motion.h2>

        <motion.p className={styles.sub} variants={itemVariants}>
          Join thousands of merchants already building on the Renaissance Edition.
          No contracts. No setup fees. Cancel anytime.
        </motion.p>

        <motion.div className={styles.actions} variants={itemVariants}>
          <a href="#" className={styles.btnPrimary}>
            Start for free
          </a>
          <a href="#" className={styles.btnGhost}>
            Talk to sales
          </a>
        </motion.div>

        <motion.p className={styles.footnote} variants={itemVariants}>
          14-day free trial · No credit card required
        </motion.p>
      </motion.div>
    </section>
  )
}
