/*
 * Marquee.jsx
 * Infinite scrolling ticker strip. Renders items array twice side-by-side
 * so CSS animation loops seamlessly. Pure CSS — no JS animation.
 * Receives: items (string[])
 */

import styles from './Marquee.module.css'

export default function Marquee({ items = [] }) {
  // Double the items for seamless looping
  const track = [...items, ...items]

  return (
    <div className={styles.wrapper} aria-hidden="true">
      <div className={styles.track}>
        {track.map((item, i) => (
          <span key={i} className={styles.pill}>
            <span className={styles.dot}>✦</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
