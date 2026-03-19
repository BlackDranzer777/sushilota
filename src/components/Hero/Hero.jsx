/*
 * Hero.jsx
 * Full-viewport hero section for "The Renaissance Edition".
 * - Heading words animate in via Framer Motion stagger
 * - Animated gradient mesh background via CSS keyframes
 * - Bouncing scroll indicator at bottom
 * - Subtext + badge fade in after heading
 */

import { motion } from 'framer-motion'
import styles from './Hero.module.css'

const HEADING = 'The Renaissance Edition'
const words = HEADING.split(' ')

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const wordVariants = {
  hidden:  { y: 60, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
}

const fadeUp = {
  hidden:  { y: 24, opacity: 0 },
  visible: (delay) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay },
  }),
}

const bounce = {
  animate: {
    y: [0, 10, 0],
    transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
  },
}

export default function Hero() {
  return (
    <section className={styles.hero} id="hero" aria-label="Hero">
      {/* Animated gradient mesh */}
      <div className={styles.mesh} aria-hidden="true" />
      <div className={styles.meshGlow} aria-hidden="true" />

      <div className={styles.content}>
        {/* Edition badge */}
        <motion.div
          className={styles.badge}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.1}
        >
          <span className={styles.badgeDot} />
          Winter 2026 · Spark Platform
        </motion.div>

        {/* Main heading — word-by-word stagger */}
        <motion.h1
          className={styles.heading}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          aria-label={HEADING}
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              className={styles.word}
              variants={wordVariants}
            >
              {word}
              {i < words.length - 1 ? '\u00A0' : ''}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className={styles.sub}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1.0}
        >
          150+ updates. One platform. Built for what comes next.
        </motion.p>

        {/* Actions */}
        <motion.div
          className={styles.actions}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1.2}
        >
          <a href="#features" className={styles.btnPrimary}>
            Explore the edition
          </a>
          <a href="#sidekick" className={styles.btnGhost}>
            Meet Sidekick →
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className={styles.scrollIndicator}
        animate={bounce.animate}
        aria-hidden="true"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 3v14M4 11l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>
    </section>
  )
}
