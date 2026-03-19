/*
 * Nav.jsx
 * Floating pill-shaped navigation bar, fixed at top-center.
 * - Shrinks slightly on scroll via GSAP ScrollTrigger
 * - Backdrop blur glass effect
 * - Logo left, links center, CTA right
 */

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '../../hooks/useGSAP'
import styles from './Nav.module.css'

export default function Nav({ links = [] }) {
  const navRef = useRef(null)

  useGSAP(() => {
    gsap.to(navRef.current, {
      paddingTop: '10px',
      paddingBottom: '10px',
      fontSize: '0.875rem',
      scrollTrigger: {
        trigger: document.body,
        start: 'top -80px',
        end: 'top -81px',
        toggleActions: 'play none none reverse',
      },
    })
  }, navRef, [])

  return (
    <header className={styles.header}>
      <nav ref={navRef} className={styles.nav} aria-label="Main navigation">
        {/* Logo */}
        <a href="#" className={styles.logo} aria-label="Spark Platform home">
          <span className={styles.logoMark}>✦</span>
          <span className={styles.logoText}>Spark</span>
        </a>

        {/* Links */}
        <ul className={styles.links} role="list">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={styles.link}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a href="#cta" className={styles.cta}>
          Get early access
        </a>
      </nav>
    </header>
  )
}
