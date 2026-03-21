/*
 * App.jsx — Sushi Lota
 */

import TopBar        from './components/TopBar/TopBar'
import SideNav       from './components/SideNav/SideNav'
import CinematicHero from './components/CinematicHero/CinematicHero'
import Section2      from './components/Section2/Section2'
import CursorLens    from './components/CursorLens/CursorLens'

export default function App() {
  return (
    <>
      <CursorLens />
      <TopBar />
      <SideNav />

      {/* filter: url(#cursor-lens) — the SVG filter defined in CursorLens
          warps every pixel inside <main> at the cursor position.
          TopBar + SideNav are outside main so they stay unaffected
          (avoids breaking position: fixed stacking context). */}
      <main style={{ filter: 'url(#cursor-lens)' }}>
        <CinematicHero />
        <Section2 />
      </main>
    </>
  )
}
