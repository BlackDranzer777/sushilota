/*
 * SidekickPin.jsx
 * GSAP pinned scroll experience with 3-stage feature reveal.
 * - Section is pinned for 3× viewport height of scroll
 * - Timeline scrubs: left text fades in/out, right card morphs
 * - Three features cycle through as user scrolls
 * - Uses scrub: 1 for smooth scroll-linked playback
 */

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '../../hooks/useGSAP'
import styles from './SidekickPin.module.css'

const FEATURES = [
  {
    label: 'Insights',
    title: 'Proactively delivered',
    desc: 'Personalized recommendations and next steps using real-time market trends — before you even think to ask.',
    icon: '◎',
    accent: '#f0a500',
  },
  {
    label: 'Complexity',
    title: 'Delegated to AI',
    desc: 'Build custom apps and workflows designed for your exact needs. No engineering team required.',
    icon: '⬡',
    accent: '#4a9eff',
  },
  {
    label: 'Designs',
    title: 'Instantly refined',
    desc: 'Tell Sidekick what you want and watch your storefront update in real time. Language is the interface.',
    icon: '◈',
    accent: '#a855f7',
  },
]

export default function SidekickPin() {
  const sectionRef  = useRef(null)
  const leftRefs    = useRef([])
  const rightRefs   = useRef([])
  const cardRef     = useRef(null)

  // Assign refs to arrays
  const setLeftRef  = (i) => (el) => { leftRefs.current[i] = el }
  const setRightRef = (i) => (el) => { rightRefs.current[i] = el }

  useGSAP(() => {
    const section = sectionRef.current

    // Set initial states: only first feature visible
    gsap.set(leftRefs.current.slice(1), { opacity: 0, y: 30 })
    gsap.set(rightRefs.current.slice(1), { opacity: 0, scale: 0.96 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=250%',
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      },
    })

    // Stage 0 → 1
    tl.to(leftRefs.current[0], { opacity: 0, y: -30, duration: 1 }, 0)
      .to(rightRefs.current[0], { opacity: 0, scale: 0.94, duration: 1 }, 0)
      .to(leftRefs.current[1], { opacity: 1, y: 0, duration: 1 }, 0.5)
      .to(rightRefs.current[1], { opacity: 1, scale: 1, duration: 1 }, 0.5)

    // Stage 1 → 2
    tl.to(leftRefs.current[1], { opacity: 0, y: -30, duration: 1 }, 2)
      .to(rightRefs.current[1], { opacity: 0, scale: 0.94, duration: 1 }, 2)
      .to(leftRefs.current[2], { opacity: 1, y: 0, duration: 1 }, 2.5)
      .to(rightRefs.current[2], { opacity: 1, scale: 1, duration: 1 }, 2.5)

  }, sectionRef, [])

  return (
    <section ref={sectionRef} className={styles.section} id="sidekick">
      <div className={styles.inner}>
        {/* ─── Left panel ─────────────────────── */}
        <div className={styles.left}>
          <p className={styles.eyebrow}>Sidekick</p>
          <h2 className={styles.sectionTitle}>Your AI commerce<br /><em>co-founder</em></h2>

          {FEATURES.map((f, i) => (
            <div key={i} ref={setLeftRef(i)} className={styles.featureText}>
              <span className={styles.featureLabel} style={{ color: f.accent }}>
                {f.label}
              </span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ─── Right panel ────────────────────── */}
        <div className={styles.right}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              ref={setRightRef(i)}
              className={styles.card}
              style={{ '--card-accent': f.accent }}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>{f.icon}</span>
                <span className={styles.cardLabel}>{f.label}</span>
              </div>
              <div className={styles.cardBody}>
                <h4 className={styles.cardTitle}>{f.title}</h4>
                <p className={styles.cardDesc}>{f.desc}</p>
                <div className={styles.cardBar}>
                  <div className={styles.cardBarFill} />
                </div>
                <div className={styles.cardTags}>
                  <span className={styles.tag}>AI-powered</span>
                  <span className={styles.tag}>Real-time</span>
                  <span className={styles.tag}>No code</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
