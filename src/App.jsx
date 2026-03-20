/*
 * App.jsx — Sushi Lota
 * Building sections one by one.
 * Current: Hero (ink) → Section 2
 */

import TopBar from './components/TopBar/TopBar'
import SideNav from './components/SideNav/SideNav'
import CinematicHero from './components/CinematicHero/CinematicHero'
import Section2 from './components/Section2/Section2'

export default function App() {
  return (
    <>
      <TopBar />
      <SideNav />

      <main>
        <CinematicHero />
        <Section2 />
      </main>
    </>
  )
}
