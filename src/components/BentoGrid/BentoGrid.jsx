/*
 * BentoGrid.jsx
 * CSS Grid bento layout with Framer Motion entrance + hover animations.
 * Accepts cards array: { category, title, desc, size: 'small'|'wide'|'tall' }
 * - whileInView entrance with stagger via delay prop
 * - whileHover lift with glowing box-shadow
 */

import { motion } from 'framer-motion'
import styles from './BentoGrid.module.css'

const cardVariants = {
  hidden:  { y: 40, opacity: 0 },
  visible: (delay) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      delay,
    },
  }),
}

const CATEGORY_COLORS = {
  Developer: '#4a9eff',
  AI:        '#a855f7',
  Analytics: '#10b981',
  Design:    '#f0a500',
  Scale:     '#f43f5e',
}

export default function BentoGrid({ cards = [] }) {
  return (
    <section className={styles.section} id="features">
      <div className={styles.header}>
        <p className={styles.eyebrow}>The Platform</p>
        <h2 className={styles.title}>
          Everything you need.<br />
          <em>Nothing you don't.</em>
        </h2>
      </div>

      <div className={styles.grid}>
        {cards.map((card, i) => (
          <motion.article
            key={i}
            className={`${styles.card} ${styles[card.size]}`}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            custom={i * 0.08}
            whileHover={{
              y: -6,
              boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)`,
              transition: { duration: 0.25, ease: 'easeOut' },
            }}
          >
            <span
              className={styles.category}
              style={{ color: CATEGORY_COLORS[card.category] ?? 'var(--text-muted)' }}
            >
              {card.category}
            </span>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardDesc}>{card.desc}</p>

            {/* Decorative corner glow */}
            <div
              className={styles.glow}
              style={{ background: CATEGORY_COLORS[card.category] ?? 'var(--amber)' }}
            />
          </motion.article>
        ))}
      </div>
    </section>
  )
}
