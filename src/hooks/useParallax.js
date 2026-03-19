/*
 * useParallax.js
 * Calculates a parallax Y offset for a given scroll progress and speed factor.
 * Used by layer components that need to compute their own parallax independently.
 *
 * The main parallax in CinematicHero.jsx is done via GSAP timeline tweens —
 * this hook is provided for components that need a React-state-based offset.
 *
 * Usage:
 *   const offset = useParallax(scrollProgress, 0.4, 200)
 *   // offset: number in px, where 200 = total travel range in px
 */

export function useParallax(progress = 0, speed = 0.5, range = 200) {
  // Returns offset from 0 at progress=0 to -range*speed at progress=1
  return -(progress * range * speed)
}
