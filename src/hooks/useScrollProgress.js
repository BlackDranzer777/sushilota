/*
 * useScrollProgress.js
 * Returns the scroll progress (0–1) of the #hero-scene cinematic section.
 * Components can use this to react to the hero scroll phase.
 * Progress is also broadcast via 'heroProgress' custom event by CinematicHero.jsx.
 *
 * Usage:
 *   const progress = useScrollProgress('#hero-scene')
 */

import { useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function useScrollProgress(triggerId = '#hero-scene') {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: triggerId,
      start: 'top top',
      end:   'bottom bottom',
      scrub: true,
      onUpdate(self) {
        setProgress(self.progress)
      },
    })
    return () => st.kill()
  }, [triggerId])

  return progress
}
