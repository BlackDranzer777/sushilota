/*
 * useCountUp.js
 * Animates a number from 0 to `target` when the referenced element scrolls
 * into view. Uses GSAP's onUpdate trick to tween a plain object's `val` property
 * and write it to a DOM node — no React state updates, no re-renders.
 *
 * Usage:
 *   const numRef = useRef(null)
 *   useCountUp(numRef, 150, 0)
 *   return <span ref={numRef}>0</span>
 */

import { useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * @param {React.RefObject} ref       - ref pointing to the DOM element displaying the number
 * @param {number}          target    - the final number to count up to
 * @param {number}          decimals  - decimal places to display (default 0)
 */
export function useCountUp(ref, target, decimals = 0) {
  useLayoutEffect(() => {
    if (!ref.current) return

    const obj = { val: 0 }

    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
          once: true,
        },
        onUpdate() {
          if (ref.current) {
            ref.current.textContent = obj.val.toFixed(decimals)
          }
        },
      })
    })

    return () => ctx.revert()
  }, [ref, target, decimals])
}
