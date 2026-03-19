/*
 * FigureRight.jsx
 * Secondary character — right side. Parallax speed: 0.6 (moves faster).
 * Receives figureRef for GSAP targeting from CinematicHero.jsx.
 *
 * ILLUSTRATION SWAP:
 *   FIGURE_RIGHT = "🎨"
 *   → REPLACE WITH: Indian male figure in creative stance,
 *     holding brand/marketing symbols.
 *
 *   To swap:
 *   1. Import: import figureRightPng from '../../../assets/figure-right.png'
 *   2. Replace the <span> with: <img src={figureRightPng} alt="Sushi Lota creative director" />
 */

import styles from '../CinematicHero.module.css'

export default function FigureRight({ figureRef }) {
  return (
    <div ref={figureRef} className={`${styles.figure} ${styles.figureRight}`} aria-hidden="true">
      {/* FIGURE_RIGHT placeholder → see swap guide above */}
      <span role="img" aria-label="figure-right-placeholder">🎨</span>
    </div>
  )
}
