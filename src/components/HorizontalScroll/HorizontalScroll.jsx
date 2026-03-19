/*
 * HorizontalScroll.jsx
 * GSAP horizontal scroll section. A pinned row of channel cards that
 * translates horizontally as the user scrolls vertically.
 * Accepts: channels array [{ name, desc, color }]
 */

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '../../hooks/useGSAP'
import styles from './HorizontalScroll.module.css'

const CHANNEL_ICONS = {
  ChatGPT:    '◎',
  Perplexity: '◈',
  Copilot:    '⬡',
  Gemini:     '◇',
}

export default function HorizontalScroll({ channels = [] }) {
  const sectionRef = useRef(null)
  const trackRef   = useRef(null)

  useGSAP(() => {
    const section = sectionRef.current
    const track   = trackRef.current
    if (!section || !track) return

    const totalWidth   = track.scrollWidth
    const viewportWidth = section.offsetWidth
    const dist          = totalWidth - viewportWidth

    gsap.to(track, {
      x: -dist,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: `+=${dist + 200}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    })
  }, sectionRef, [channels.length])

  return (
    <section ref={sectionRef} className={styles.section} id="channels">
      {/* Section label — stays fixed during horizontal scroll */}
      <div className={styles.label}>
        <p className={styles.eyebrow}>AI Channels</p>
        <h2 className={styles.title}>
          Sell everywhere<br />AI lives.
        </h2>
      </div>

      {/* Scrolling track */}
      <div className={styles.viewport}>
        <div ref={trackRef} className={styles.track}>
          {channels.map((ch, i) => (
            <div
              key={i}
              className={styles.card}
              style={{ '--ch-color': ch.color }}
            >
              <div className={styles.cardTop}>
                <span className={styles.icon}>{CHANNEL_ICONS[ch.name] ?? '◎'}</span>
                <span className={styles.cardName}>{ch.name}</span>
              </div>
              <p className={styles.cardDesc}>{ch.desc}</p>
              <div className={styles.cardFooter}>
                <span className={styles.pill}>Live now</span>
                <span className={styles.arrow}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
