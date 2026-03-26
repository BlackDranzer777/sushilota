/*
 * useLenis.js
 *
 * Initialises Lenis smooth scroll and wires it into the GSAP ticker
 * so ScrollTrigger scrub animations stay in sync.
 */

import { useEffect } from 'react'
import Lenis        from 'lenis'
import { gsap }     from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration:    1.2,
      easing:      (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    })

    /* Keep ScrollTrigger in sync with Lenis scroll position */
    lenis.on('scroll', ScrollTrigger.update)

    /* Drive Lenis from the GSAP ticker (single rAF loop) */
    const tickerCb = gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    /* Disable GSAP's own lag smoothing — Lenis handles it */
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tickerCb)
      lenis.destroy()
    }
  }, [])
}
