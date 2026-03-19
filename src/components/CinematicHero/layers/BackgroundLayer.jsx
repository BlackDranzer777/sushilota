/*
 * BackgroundLayer.jsx
 * Four absolutely-positioned gradient divs stacked on top of each other.
 * GSAP (in CinematicHero.jsx) drives each div's opacity via the passed refs,
 * creating a smooth transition between DAWN → DAY → DUSK → NIGHT as the
 * user scrolls through the 600vh cinematic section.
 *
 * ILLUSTRATION SWAP: GROUND_SILHOUETTE gradient divs at bottom
 * → Replace the .ground div with a Jaipur skyline SVG/PNG (Hawa Mahal outline)
 */

import styles from '../CinematicHero.module.css'

export default function BackgroundLayer({ dawnRef, dayRef, duskRef, nightRef }) {
  return (
    <div className={styles.bgLayer} aria-hidden="true">
      {/* DAWN — warm golden hour */}
      <div ref={dawnRef} className={`${styles.gradient} ${styles.gradDawn}`} />
      {/* DAY — vibrant teal + mint */}
      <div ref={dayRef}  className={`${styles.gradient} ${styles.gradDay}`}  style={{ opacity: 0 }} />
      {/* DUSK — coral and salmon */}
      <div ref={duskRef} className={`${styles.gradient} ${styles.gradDusk}`} style={{ opacity: 0 }} />
      {/* NIGHT — deep teal-black */}
      <div ref={nightRef} className={`${styles.gradient} ${styles.gradNight}`} style={{ opacity: 0 }} />

      {/*
        GROUND_SILHOUETTE placeholder
        → REPLACE WITH: <img src={jaipurSkyline} /> Hawa Mahal / city outline SVG
      */}
      <div className={styles.groundSilhouette} />
    </div>
  )
}
