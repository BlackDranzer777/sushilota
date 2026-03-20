/*
 * TopBar.jsx
 * Fixed top bar — fully transparent, lets the painting show through.
 * Left: Sushi Lota wordmark. Right: "Get in touch" amber pill CTA.
 */

import styles from './TopBar.module.css'

export default function TopBar() {
  return (
    <header className={styles.topbar} role="banner">
      <a href="#" className={styles.wordmark} aria-label="Sushi Lota — home">
        <img
          src="/wordmark.png"
          alt="Sushi Lota"
          className={styles.wordmarkImg}
        />
      </a>
      <a href="#contact" className={styles.cta}>
        Get in touch
      </a>
    </header>
  )
}
