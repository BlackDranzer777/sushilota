/*
 * TornPaper.jsx
 * SVG torn-paper divider between the hero illustration and the service sections.
 * Overlaps the hero's bottom edge via negative margin-top — creating the illusion
 * that the content section tears through the illustration.
 *
 * The `color` prop should match the background of whatever section sits below it.
 * Defaults to var(--peach-light) which is the first service card bg.
 *
 * The path is intentionally irregular — short L segments at varied heights.
 * viewBox width is 1440 (common design baseline). SVG scales to 100% viewport width.
 */

import styles from './TornPaper.module.css'

/* Deterministic torn-paper edge points — no Math.random, always stable */
const EDGE_Y = [
  58, 34, 62, 24, 50, 16, 44, 28, 56, 12, 40, 22, 54, 18, 46, 30,
  58, 10, 38, 26, 52, 14, 42, 20, 56, 8,  36, 24, 50, 16, 44, 28,
  60, 12, 40, 22, 54, 18, 46, 30, 58, 8,  38, 24, 52, 14, 42, 20,
  56, 10, 36, 26, 50, 16, 44, 28, 60, 12, 40, 22, 54, 18, 46, 30,
  58, 8,  38, 24, 52, 14, 42, 20, 56, 10, 36, 26, 50, 48,
]

function buildPath(width = 1440, height = 100, step = 18) {
  const parts = [`M0,${height}`, `L0,${EDGE_Y[0]}`]
  let x = 0
  let i = 1
  while (x < width) {
    x = Math.min(x + step + (i % 4 === 0 ? 8 : i % 3 === 0 ? 5 : 0), width)
    parts.push(`L${x},${EDGE_Y[i % EDGE_Y.length]}`)
    i++
  }
  parts.push(`L${width},${height}`, 'Z')
  return parts.join(' ')
}

const PATH = buildPath()

export default function TornPaper({ color = 'var(--peach-light)' }) {
  return (
    <div className={styles.wrapper} aria-hidden="true">
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
      >
        <path d={PATH} fill={color} />
      </svg>
    </div>
  )
}
