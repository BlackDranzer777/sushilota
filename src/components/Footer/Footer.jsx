/*
 * Footer.jsx
 * Minimal dark footer — wordmark, service links, tagline, copyright.
 */

import { NAV_ITEMS } from '../../data/navItems'
import styles from './Footer.module.css'

const COL_A = NAV_ITEMS.slice(0, 6)
const COL_B = NAV_ITEMS.slice(6)

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* ── Top row ─────────────────────────── */}
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <a href="#" className={styles.wordmark} aria-label="Sushi Lota">
              Sushi Lota
            </a>
            <p className={styles.location}>Jaipur, India</p>
            <p className={styles.tagline}>The Itamae of Your Brand</p>
          </div>

          {/* Service links — 2 columns */}
          <nav className={styles.linksWrap} aria-label="Footer services">
            <div className={styles.linkCol}>
              <p className={styles.colHeading}>Services</p>
              <ul role="list">
                {COL_A.map(item => (
                  <li key={item.numeral}>
                    <a href={item.href} className={styles.link}>
                      <span className={styles.linkNum}>{item.numeral}</span>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.linkCol}>
              <p className={styles.colHeading}>&nbsp;</p>
              <ul role="list">
                {COL_B.map(item => (
                  <li key={item.numeral}>
                    <a href={item.href} className={styles.link}>
                      <span className={styles.linkNum}>{item.numeral}</span>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Right tagline block */}
          <div className={styles.rightQuote}>
            <p className={styles.bigTagline}>The Itamae<br /><em>of Your Brand</em></p>
          </div>
        </div>

        {/* ── Bottom bar ───────────────────────── */}
        <div className={styles.bottom}>
          <p className={styles.copy}>© 2024 Sushi Lota. All rights reserved.</p>
          <p className={styles.copyRight}>
            Jaipur, India · Marketing & Design Agency
          </p>
        </div>

      </div>
    </footer>
  )
}
