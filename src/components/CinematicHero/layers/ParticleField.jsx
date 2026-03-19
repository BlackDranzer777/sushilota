/*
 * ParticleField.jsx
 * Night sky sparkle effect — CSS-only animated dots.
 * Opacity is controlled by GSAP from CinematicHero.jsx (0 → 1 in last 25% of scroll).
 * Starts at opacity: 0 so it's invisible until NIGHT phase.
 *
 * ILLUSTRATION SWAP:
 *   PARTICLE = "·" CSS dots
 *   → REPLACE WITH: Import a gold dust PNG sprite and use CSS animation
 *     to shift background-position for a sprite sheet animation,
 *     or place individual <img src={goldDust} /> elements.
 */

import styles from '../CinematicHero.module.css'

// 40 particles with seeded pseudo-random positions & animation delays
const PARTICLE_COUNT = 40

function seededRandom(seed) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  top:   `${seededRandom(i * 3 + 0) * 90}%`,
  left:  `${seededRandom(i * 3 + 1) * 95}%`,
  size:  seededRandom(i * 3 + 2) < 0.5 ? 2 : seededRandom(i * 3 + 2) < 0.8 ? 3 : 4,
  delay: `${(seededRandom(i * 7) * 3).toFixed(2)}s`,
  dur:   `${(1.5 + seededRandom(i * 11) * 2.5).toFixed(2)}s`,
}))

export default function ParticleField({ particlesRef }) {
  return (
    <div
      ref={particlesRef}
      className={styles.particleField}
      style={{ opacity: 0 }}  /* GSAP will drive this to 1 in NIGHT phase */
      aria-hidden="true"
    >
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className={styles.particle}
          style={{
            top:    p.top,
            left:   p.left,
            width:  `${p.size}px`,
            height: `${p.size}px`,
            animationDelay:    p.delay,
            animationDuration: p.dur,
          }}
        />
      ))}
    </div>
  )
}
