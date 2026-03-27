/*
 * App.jsx — Sushi Lota
 *
 * Hero: TWO options exist — comment out whichever you don't want.
 *   A) CinematicHero — WebGL ink-rise scroll experience (existing)
 *   B) HeroSection   — Collage parallax (new)
 *
 * Smooth scroll is handled by useLenis (wired into GSAP ticker).
 */

import { useLenis }               from './hooks/useLenis'

import TopBar                     from './components/TopBar/TopBar'
import SideNav                    from './components/SideNav/SideNav'
import CursorPaint                from './components/CursorPaint/CursorPaint'

/* ── Hero (pick one) ─────────────────────────────────────────────── */
import CinematicHero              from './components/CinematicHero/CinematicHero'
import HeroSection                from './components/HeroSection/HeroSection'

/* ── Existing sections ───────────────────────────────────────────── */
import Section2                   from './components/Section2/Section2'

/* ── New sections ────────────────────────────────────────────────── */
import WhoWeAre                   from './components/WhoWeAre/WhoWeAre'
import StrategySection            from './components/StrategySection/StrategySection'
import DifferentiationSection     from './components/DifferentiationSection/DifferentiationSection'
import ObjectivesSection          from './components/ObjectivesSection/ObjectivesSection'
import ServicesSection            from './components/ServicesSection/ServicesSection'
import CTASection                 from './components/CTASection/CTASection'

export default function App() {
  /* Initialise Lenis smooth scroll, wired into GSAP ticker */
  useLenis()

  return (
    <>
      <CursorPaint />
      <TopBar />
      <SideNav />

      {/* filter: url(#cursor-lens) — warps pixels inside <main> at cursor.
          TopBar + SideNav stay outside to avoid breaking fixed stacking. */}
      <main>

        {/* ── Hero (choose A or B) ────────────────────────────────── */}
        {/* OPTION A — WebGL cinematic ink experience */}
        {/* <CinematicHero /> */}

        {/* OPTION B — Collage parallax hero */}
        <HeroSection />

        {/* ── About / identity ───────────────────────────────────── */}
        <Section2 />
        <WhoWeAre />

        {/* ── Strategy + differentiation ─────────────────────────── */}
        <StrategySection />
        <DifferentiationSection />

        {/* ── Objectives ─────────────────────────────────────────── */}
        <ObjectivesSection />

        {/* ── Services (7 full-screen panels) ────────────────────── */}
        <ServicesSection />

        {/* ── CTA / Contact ──────────────────────────────────────── */}
        <CTASection />

      </main>
    </>
  )
}
