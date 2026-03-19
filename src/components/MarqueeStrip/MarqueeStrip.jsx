/*
 * MarqueeStrip.jsx
 * Full-width amber ticker with two rows scrolling in opposite directions.
 * Pure CSS keyframe animation — no JavaScript.
 * Items sourced from MARQUEE_ITEMS in services.js.
 */

import { MARQUEE_ITEMS } from '../../data/services'
import styles from './MarqueeStrip.module.css'

// Repeat items to ensure seamless looping at all viewport widths
const ROW_A = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
const ROW_B = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

function MarqueeRow({ items, reverse = false }) {
  return (
    <div className={styles.row}>
      <div className={`${styles.track} ${reverse ? styles.trackReverse : ''}`}>
        {items.map((item, i) => (
          <span key={i} className={styles.item}>
            <span className={styles.dot} aria-hidden="true">✦</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function MarqueeStrip() {
  return (
    <div className={styles.wrapper} aria-label="Marquee strip" aria-hidden="true">
      <MarqueeRow items={ROW_A} />
      <MarqueeRow items={ROW_B} reverse />
    </div>
  )
}
