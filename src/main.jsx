/*
 * main.jsx — Sushi Lota
 * Registers GSAP plugins globally before React renders.
 * ScrollSmoother is NOT used — cinematic hero uses CSS sticky instead.
 */

import { createRoot } from 'react-dom/client'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import './styles/global.css'
import App from './App.jsx'

gsap.registerPlugin(ScrollTrigger)

// StrictMode omitted intentionally — double useLayoutEffect invocation
// breaks GSAP ScrollTrigger timeline setup.
createRoot(document.getElementById('root')).render(<App />)
