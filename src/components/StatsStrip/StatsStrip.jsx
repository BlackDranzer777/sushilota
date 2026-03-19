/*
 * StatsStrip.jsx
 * Full-width dark section displaying 4 animated statistics.
 * Each number counts up from 0 to target via useCountUp when it enters viewport.
 * Accepts: stats array [{ value, suffix, label, decimals? }]
 */

import { useRef } from 'react'
import { useCountUp } from '../../hooks/useCountUp'
import styles from './StatsStrip.module.css'

function StatItem({ value, suffix = '', label, decimals = 0 }) {
  const numRef = useRef(null)
  useCountUp(numRef, value, decimals)

  return (
    <div className={styles.stat}>
      <div className={styles.number}>
        <span ref={numRef}>{decimals > 0 ? value.toFixed(decimals) : '0'}</span>
        <span className={styles.suffix}>{suffix}</span>
      </div>
      <p className={styles.label}>{label}</p>
    </div>
  )
}

export default function StatsStrip({ stats = [] }) {
  return (
    <section className={styles.section} id="stats">
      <div className={styles.inner}>
        {stats.map((s, i) => (
          <StatItem key={i} {...s} />
        ))}
      </div>
    </section>
  )
}
