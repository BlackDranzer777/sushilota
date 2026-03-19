/*
 * GroundLayer.jsx
 * Landscape / terrain silhouette at the bottom of the scene.
 * Parallax speed: 0.1 (barely moves — feels like distant ground).
 * GSAP tween is applied via ref from CinematicHero.jsx.
 *
 * ILLUSTRATION SWAP:
 *   GROUND_SILHOUETTE → Replace the CSS gradient div with a Jaipur skyline
 *   PNG/SVG import: import jaipurSkyline from '../../assets/jaipur-skyline.png'
 *   Then: <img src={jaipurSkyline} className={styles.skylineImg} alt="" />
 */

import styles from '../CinematicHero.module.css'

export default function GroundLayer({ groundRef }) {
  return (
    <div ref={groundRef} className={styles.groundLayer} aria-hidden="true">
      {/*
        GROUND_SILHOUETTE placeholder — layered gradient hills
        → REPLACE WITH: Jaipur skyline / Hawa Mahal silhouette PNG
      */}
      <div className={styles.hill3} />
      <div className={styles.hill2} />
      <div className={styles.hill1} />
    </div>
  )
}
