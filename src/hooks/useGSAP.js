/*
 * useGSAP.js
 * Thin wrapper around GSAP context + useLayoutEffect.
 * Runs the provided callback inside a GSAP context scoped to `scope`,
 * then automatically reverts (cleans up) all animations on unmount or dep change.
 * Prevents GSAP instances from leaking across React hot reloads.
 *
 * Usage:
 *   const containerRef = useRef(null)
 *   useGSAP((ctx) => {
 *     gsap.from(containerRef.current, { opacity: 0, y: 30 })
 *   }, containerRef, [])
 */

import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * @param {Function} callback  - receives the GSAP context as first arg
 * @param {React.RefObject} scope - optional ref to scope selector functions
 * @param {Array} deps - dependency array (like useEffect)
 */
export function useGSAP(callback, scope, deps = []) {
  const savedCallback = useRef(callback)
  savedCallback.current = callback

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      savedCallback.current()
    }, scope?.current ?? undefined)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
