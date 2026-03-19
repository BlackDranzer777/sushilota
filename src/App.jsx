/*
 * App.jsx — Sushi Lota
 * Building sections one by one.
 * Current: Hero (with built-in bottom-up ink + scale) + placeholder section 2.
 */

import TopBar from './components/TopBar/TopBar'
import SideNav from './components/SideNav/SideNav'
import CinematicHero from './components/CinematicHero/CinematicHero'

export default function App() {
  return (
    <>
      <TopBar />
      <SideNav />

      <main>
        <CinematicHero />
        {/* ── Section 2 placeholder — replace when ready ─────────── */}
        <div
          id="section-2"
          style={{ height: '100vh', background: '#026b64' }}
        />
      </main>
    </>
  )
}
