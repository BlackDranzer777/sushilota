/*
 * SideNav.jsx
 * Fixed left sidebar — Roman numeral + service label pairs.
 * Highlights the active service using IntersectionObserver:
 *   each service section has an id matching NAV_ITEMS[n].href (without #).
 *   When a section enters the viewport, its index becomes active.
 */

import { useState, useEffect } from 'react'
import { NAV_ITEMS } from '../../data/navItems'
import styles from './SideNav.module.css'

export default function SideNav() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const ids = NAV_ITEMS.map(item => item.href.replace('#', ''))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = ids.indexOf(entry.target.id)
            if (idx !== -1) setActiveIndex(idx)
          }
        })
      },
      { threshold: 0.4 }
    )

    ids.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <nav className={styles.nav} aria-label="Services navigation">
      <ul role="list" className={styles.list}>
        {NAV_ITEMS.map((item, i) => {
          const isActive = i === activeIndex
          return (
            <li key={item.numeral}>
              <a
                href={item.href}
                className={`${styles.item} ${isActive ? styles.active : ''}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className={styles.label}>{item.label}</span>
                <span className={styles.numeral}>{item.numeral}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
