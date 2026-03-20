/*
 * Section2.jsx
 * The section that lives on the ink — background matches ink color #5f8674.
 * Content fades and slides in as the section enters the viewport.
 * Replace placeholder text with real content once direction is confirmed.
 */

import { motion } from 'framer-motion'
import styles from './Section2.module.css'

const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-80px' },
  transition:  { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay },
})

export default function Section2() {
  return (
    <section id="section-2" className={styles.section}>
      <div className={styles.inner}>

        <motion.p className={styles.label} {...fadeUp(0)}>
          Jaipur &nbsp;·&nbsp; India
        </motion.p>

        <motion.h2 className={styles.heading} {...fadeUp(0.1)}>
          We don't just market<br />brands. We make them<br />matter.
        </motion.h2>

        <motion.p className={styles.body} {...fadeUp(0.2)}>
          Sushi Lota is a full-service creative and marketing agency rooted in
          Jaipur's artistic heritage. Strategy, design, and storytelling —
          crafted with the precision of an itamae.
        </motion.p>

        <motion.a
          href="#contact"
          className={styles.cta}
          {...fadeUp(0.3)}
          whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
        >
          Work with us
        </motion.a>

      </div>
    </section>
  )
}
