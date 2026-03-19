/*
 * FloatingProps.jsx
 * Scattered decorative illustration elements floating at different depths.
 * Each prop has:
 *   - Its own ref (passed to GSAP in CinematicHero.jsx for parallax)
 *   - A CSS idle float animation (looping up/down oscillation)
 *   - Unique position, size, and animation-duration for organic feel
 *
 * ════════════════════════════════════════════════════════════
 * ILLUSTRATION PLACEHOLDER MAP
 * ════════════════════════════════════════════════════════════
 * Each entry below = one illustration to commission and replace.
 *
 * PROP_LOTUS      = "🪷"
 *   → REPLACE WITH: Floating lotus flower illustration (Indian motif)
 *   → File: src/assets/props/lotus.png
 *   → Usage: <img src={lotus} alt="" /> inside .prop element
 *
 * PROP_STAMP      = "📮"
 *   → REPLACE WITH: Indian postal stamp with Sushi Lota logo
 *   → File: src/assets/props/stamp.png
 *
 * PROP_PAINTBRUSH = "🖌️"
 *   → REPLACE WITH: Large artistic paintbrush dripping brand colors
 *   → File: src/assets/props/paintbrush.png
 *
 * PROP_CAMERA     = "📷"
 *   → REPLACE WITH: Vintage camera illustration (photography services)
 *   → File: src/assets/props/camera.png
 *
 * PROP_PEACOCK    = "🦚"
 *   → REPLACE WITH: Rajasthani peacock illustration (Indian heritage)
 *   → File: src/assets/props/peacock.png
 *
 * PROP_MEGAPHONE  = "📣"
 *   → REPLACE WITH: Bold megaphone (marketing/PR services)
 *   → File: src/assets/props/megaphone.png
 *
 * PROP_ENVELOPE   = "✉️"
 *   → REPLACE WITH: Decorative envelope with Indian pattern border
 *   → File: src/assets/props/envelope.png
 *
 * PROP_SPARKLES   = "✨"
 *   → REPLACE WITH: Hand-drawn sparkle/star cluster
 *   → File: src/assets/props/sparkles.png
 * ════════════════════════════════════════════════════════════
 */

import styles from '../CinematicHero.module.css'

/*
 * PROPS_CONFIG defines every floating element:
 * { id, emoji, size, top, left/right, floatDuration, parallaxSpeed, zIndex }
 * parallaxSpeed is documented here but the actual GSAP tween lives in CinematicHero.jsx
 * under the FLOATING PROPS section of the timeline.
 */
export const PROPS_CONFIG = [
  {
    id: 'lotus',
    emoji: '🪷',      // PROP_LOTUS → replace with lotus.png
    size: 120,
    top: '25%', left: '12%',
    floatDuration: 5,
    parallaxY: -40,
    parallaxX: 15,
  },
  {
    id: 'stamp',
    emoji: '📮',      // PROP_STAMP → replace with stamp.png
    size: 90,
    top: '15%', left: '55%',
    floatDuration: 7,
    parallaxY: -70,
    parallaxX: -20,
  },
  {
    id: 'paintbrush',
    emoji: '🖌️',     // PROP_PAINTBRUSH → replace with paintbrush.png
    size: 150,
    top: '60%', left: '8%',
    floatDuration: 4,
    parallaxY: -30,
    parallaxX: 10,
  },
  {
    id: 'camera',
    emoji: '📷',      // PROP_CAMERA → replace with camera.png
    size: 100,
    top: '40%', right: '10%',
    floatDuration: 6,
    parallaxY: -55,
    parallaxX: -15,
  },
  {
    id: 'peacock',
    emoji: '🦚',      // PROP_PEACOCK → replace with peacock.png
    size: 140,
    top: '70%', right: '18%',
    floatDuration: 8,
    parallaxY: -25,
    parallaxX: -30,
  },
  {
    id: 'megaphone',
    emoji: '📣',      // PROP_MEGAPHONE → replace with megaphone.png
    size: 110,
    top: '20%', right: '30%',
    floatDuration: 5,
    parallaxY: -60,
    parallaxX: 25,
  },
  {
    id: 'envelope',
    emoji: '✉️',      // PROP_ENVELOPE → replace with envelope.png
    size: 85,
    top: '55%', left: '38%',
    floatDuration: 6,
    parallaxY: -45,
    parallaxX: -10,
  },
  {
    id: 'sparkles',
    emoji: '✨',      // PROP_SPARKLES → replace with sparkles.png
    size: 80,
    top: '30%', left: '72%',
    floatDuration: 3,
    parallaxY: -80,
    parallaxX: 20,
  },
]

export default function FloatingProps({ propRefs }) {
  return (
    <div className={styles.propsLayer} aria-hidden="true">
      {PROPS_CONFIG.map((prop, i) => {
        const posStyle = {
          top: prop.top,
          ...(prop.left  ? { left:  prop.left  } : {}),
          ...(prop.right ? { right: prop.right } : {}),
          fontSize: `${prop.size}px`,
          animationDuration: `${prop.floatDuration}s`,
        }
        return (
          <div
            key={prop.id}
            ref={el => { propRefs.current[i] = el }}
            className={styles.prop}
            style={posStyle}
            data-prop-id={prop.id}
          >
            {/* Placeholder → see ILLUSTRATION PLACEHOLDER MAP above */}
            <span role="img" aria-label={`prop-${prop.id}-placeholder`}>
              {prop.emoji}
            </span>
          </div>
        )
      })}
    </div>
  )
}
