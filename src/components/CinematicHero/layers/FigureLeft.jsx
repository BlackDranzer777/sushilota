/*
 * FigureLeft.jsx
 * Main character — left side of the scene. Parallax speed: 0.4.
 * Slight rotation and drift applied via GSAP from CinematicHero.jsx.
 * Night glow (drop-shadow filter) applied by CinematicHero.jsx onUpdate.
 *
 * ILLUSTRATION SWAP:
 *   FIGURE_LEFT = "🧘‍♀️"
 *   → REPLACE WITH: Traditional Indian woman figure in classical pose,
 *     holding design tools (pen + paintbrush), flowing saree.
 *
 *   To swap:
 *   1. Import: import figureLeftPng from '../../../assets/figure-left.png'
 *   2. Replace the <span> emoji with: <img src={figureLeftPng} alt="Sushi Lota brand designer" />
 *   3. Remove fontSize from .figure, set width/height on the img instead.
 */

import styles from '../CinematicHero.module.css'

export default function FigureLeft({ figureRef }) {
  return (
    <div ref={figureRef} className={`${styles.figure} ${styles.figureLeft}`} aria-hidden="true">
      {/* FIGURE_LEFT placeholder → see swap guide above */}
      <span role="img" aria-label="figure-left-placeholder">🧘‍♀️</span>
    </div>
  )
}
