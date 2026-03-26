/*
 * ServicesSection.jsx
 *
 * Seven services, each rendered as a full-screen sticky panel.
 * Architecture mirrors Section3 / Section4:
 *   .travel (320vh) + .scene (sticky 100vh) per service.
 *
 * ANIMATIONS per panel:
 *   • Image scales + fades in with parallax
 *   • Heading lines reveal via clipPath
 *   • Body / tags fade-translate
 *   • Hover: image scale + colour overlay reveal
 *
 * Asset mapping:
 *   Branding    → /assets/orange-bg/Untitled_Artwork 3.png
 *   Website     → /assets/teal-bg/Untitled_Artwork 1.png
 *   Social      → /assets/pink-bg/Untitled_Artwork 6.png
 *   Content     → /assets/mix-bg/Untitled_Artwork 2.png
 *   SEO         → /assets/orange-bg/Untitled_Artwork 4.png
 *   Photography → /assets/mix-bg/Untitled_Artwork 14.png
 *   PR          → /assets/pink-bg/Untitled_Artwork 7.png
 */

import { useEffect, useRef } from 'react'
import { gsap }              from 'gsap'
import { ScrollTrigger }     from 'gsap/ScrollTrigger'
import styles                from './ServicesSection.module.css'

gsap.registerPlugin(ScrollTrigger)

const SERVICES = [
  {
    id:      'svc-branding',
    num:     '01',
    label:   'Branding',
    title:   'Identity that\nendures.',
    body:    'We build brand identities from the ground up — names, marks, visual systems, and guidelines that remain coherent and compelling as you scale.',
    tags:    ['Brand Identity', 'Logo Design', 'Visual Language', 'Brand Guidelines'],
    bg:      '#B34A16',
    text:    '#F6EDD8',
    accent:  '#E8490C',
    img:     '/assets/orange-bg/Untitled_Artwork 3.png',
  },
  {
    id:      'svc-website',
    num:     '02',
    label:   'Website',
    title:   'Digital presence\nthat converts.',
    body:    'From strategy to deployment — websites that balance craft and performance. Every interaction considered, every load time optimised.',
    tags:    ['UX Strategy', 'Design', 'Development', 'CMS'],
    bg:      '#026b64',
    text:    '#F6EDD8',
    accent:  '#4ecdc4',
    img:     '/assets/teal-bg/Untitled_Artwork 1.png',
  },
  {
    id:      'svc-social',
    num:     '03',
    label:   'Social Media',
    title:   'Content that\nearns attention.',
    body:    'Social strategy, content calendars, creative direction, and community management — built for platforms, not just scheduled posts.',
    tags:    ['Strategy', 'Content Creation', 'Community', 'Paid Social'],
    bg:      '#C9637B',
    text:    '#F6EDD8',
    accent:  '#E8B4BE',
    img:     '/assets/pink-bg/Untitled_Artwork 6.png',
  },
  {
    id:      'svc-content',
    num:     '04',
    label:   'Content',
    title:   'Stories that\nstick.',
    body:    "Long-form, short-form, visual, written — content that serves a purpose beyond filling a feed. Built around your audience's questions and desires.",
    tags:    ['Copywriting', 'Video', 'Photography', 'Editorial'],
    bg:      '#F6EDD8',
    text:    '#0a1a18',
    accent:  '#B34A16',
    img:     '/assets/mix-bg/Untitled_Artwork 2.png',
  },
  {
    id:      'svc-seo',
    num:     '05',
    label:   'SEO',
    title:   'Visibility that\nlasts.',
    body:    'We build organic search presence through technical precision, content strategy, and authority-building — not shortcuts that fade.',
    tags:    ['Technical SEO', 'Content Strategy', 'Link Building', 'Analytics'],
    bg:      '#0a1a18',
    text:    '#F6EDD8',
    accent:  '#4ecdc4',
    img:     '/assets/orange-bg/Untitled_Artwork 4.png',
  },
  {
    id:      'svc-photography',
    num:     '06',
    label:   'Photography',
    title:   'Images that\ntell the truth.',
    body:    'Commercial and editorial photography that captures the authentic character of your brand — not stock-ready approximations of it.',
    tags:    ['Brand Photography', 'Product', 'Editorial', 'Post-Production'],
    bg:      '#160f0a',
    text:    '#F6EDD8',
    accent:  '#E8490C',
    img:     '/assets/mix-bg/Untitled_Artwork 14.png',
  },
  {
    id:      'svc-pr',
    num:     '07',
    label:   'PR',
    title:   'Reputation built\nby design.',
    body:    'Media placements, influencer partnerships, and narrative management. We shape how the world talks about you — before they form their own opinion.',
    tags:    ['Media Relations', 'Influencer', 'Crisis Comms', 'Press'],
    bg:      '#F2C4CE',
    text:    '#0a1a18',
    accent:  '#C9637B',
    img:     '/assets/pink-bg/Untitled_Artwork 7.png',
  },
]

/* ── Service panel ────────────────────────────────────────────────── */
function ServicePanel({ service, index }) {
  const travelRef = useRef(null)
  const labelRef  = useRef(null)
  const numRef    = useRef(null)
  const line0Ref  = useRef(null)
  const line1Ref  = useRef(null)
  const bodyRef   = useRef(null)
  const tagsRef   = useRef(null)
  const imgRef    = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const lines = [line0Ref, line1Ref].map(r => r.current).filter(Boolean)

      gsap.set(labelRef.current,   { opacity: 0, y: 14 })
      gsap.set(numRef.current,     { opacity: 0, y: 14 })
      gsap.set(lines,              { clipPath: 'inset(0 0 100% 0)', y: 10 })
      gsap.set(bodyRef.current,    { opacity: 0, y: 22 })
      gsap.set(tagsRef.current,    { opacity: 0, y: 16 })
      gsap.set(imgRef.current,     { scale: 1.12, opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: travelRef.current,
          start:   'top top',
          end:     'bottom bottom',
          scrub:   1.4,
        },
      })

      /* Enter */
      tl.to(imgRef.current, { scale: 1, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0)
      tl.to(numRef.current,  { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 0.05)
      tl.to(labelRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 0.1)
      tl.to(lines, { clipPath: 'inset(0 0 -10% 0)', y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.06 }, 0.18)
      tl.to(bodyRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 0.38)
      tl.to(tagsRef.current, { opacity: 1, y: 0, duration: 0.38, ease: 'power3.out' }, 0.5)

      /* Hold */
      /* Exit — fade everything down */
      const exit = 1.4
      tl.to(imgRef.current,    { opacity: 0, y: -30, duration: 0.4, ease: 'power3.in' }, exit)
      tl.to(numRef.current,    { opacity: 0, y: -12, duration: 0.3, ease: 'power3.in' }, exit + 0.04)
      tl.to(labelRef.current,  { opacity: 0, y: -12, duration: 0.3, ease: 'power3.in' }, exit + 0.06)
      tl.to(lines,             { clipPath: 'inset(0 0 100% 0)', y: -8, duration: 0.35, ease: 'power3.in', stagger: 0.04 }, exit + 0.1)
      tl.to(bodyRef.current,   { opacity: 0, y: -16, duration: 0.3, ease: 'power3.in' }, exit + 0.18)
      tl.to(tagsRef.current,   { opacity: 0, y: -12, duration: 0.28, ease: 'power3.in' }, exit + 0.24)
    }, travelRef)

    return () => ctx.revert()
  }, [index])

  /* Image scale on hover */
  const onImgHoverIn  = () => gsap.to(imgRef.current,    { scale: 1.06, duration: 0.5, ease: 'power2.out', overwrite: 'auto' })
  const onImgHoverOut = () => gsap.to(imgRef.current,    { scale: 1,    duration: 0.6, ease: 'power3.out', overwrite: 'auto' })
  const onImgHoverInO  = () => gsap.to(overlayRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out' })
  const onImgHoverOutO = () => gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, ease: 'power2.out' })

  const titleLines = service.title.split('\n')

  return (
    <div ref={travelRef} className={styles.travel} style={{ background: service.bg }}>
      <section
        id={service.id}
        className={styles.scene}
        style={{ '--svc-bg': service.bg, '--svc-text': service.text, '--svc-accent': service.accent }}
      >
        {/* Left: text */}
        <div className={styles.content}>
          <div className={styles.meta}>
            <span ref={numRef}   className={styles.num}>{service.num}</span>
            <span ref={labelRef} className={styles.svcLabel}>{service.label}</span>
          </div>

          <h2 className={styles.title} aria-label={service.title.replace('\n', ' ')}>
            {titleLines.map((line, i) => {
              const refs = [line0Ref, line1Ref]
              return (
                <span key={i} ref={refs[i]} className={styles.titleLine} aria-hidden="true">
                  {line}
                </span>
              )
            })}
          </h2>

          <p ref={bodyRef} className={styles.body}>{service.body}</p>

          <p ref={tagsRef} className={styles.tags}>
            {service.tags.map((tag, i) => (
              <span key={tag}>
                {tag}
                {i < service.tags.length - 1 && (
                  <span className={styles.tagSep} aria-hidden="true">&nbsp;·&nbsp;</span>
                )}
              </span>
            ))}
          </p>
        </div>

        {/* Right: illustration */}
        <div
          className={styles.visual}
          onMouseEnter={() => { onImgHoverIn(); onImgHoverInO() }}
          onMouseLeave={() => { onImgHoverOut(); onImgHoverOutO() }}
        >
          <div className={styles.visualInner}>
            <img
              ref={imgRef}
              src={service.img}
              alt={service.label}
              className={styles.img}
            />
            <div
              ref={overlayRef}
              className={styles.overlay}
              style={{ background: service.accent }}
            />
          </div>
        </div>

      </section>
    </div>
  )
}

/* ── Intro panel ──────────────────────────────────────────────────── */
function ServicesIntro() {
  const ref     = useRef(null)
  const numRef  = useRef(null)
  const headRef = useRef(null)
  const bodyRef = useRef(null)

  useEffect(() => {
    const lines = headRef.current
      ? Array.from(headRef.current.querySelectorAll('span'))
      : []

    const ctx = gsap.context(() => {
      gsap.set(numRef.current,  { opacity: 0, y: 16 })
      gsap.set(lines,           { clipPath: 'inset(0 0 100% 0)', y: 12 })
      gsap.set(bodyRef.current, { opacity: 0, y: 20 })

      gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true } })
        .to(numRef.current,  { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' })
        .to(lines, { clipPath: 'inset(0 0 -10% 0)', y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.12 }, '-=0.3')
        .to(bodyRef.current, { opacity: 1, y: 0, duration: 0.7,  ease: 'power3.out' }, '-=0.4')
    })
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className={styles.intro}>
      <div className={styles.introInner}>
        <p ref={numRef} className={styles.introNum}>05</p>
        <h2 ref={headRef} className={styles.introHead}>
          <span>The</span>
          <span>Services.</span>
        </h2>
        <p ref={bodyRef} className={styles.introBody}>
          Seven disciplines. Each one practised with the precision of a craftsman.
        </p>
      </div>
    </section>
  )
}

/* ── Export ───────────────────────────────────────────────────────── */
export default function ServicesSection() {
  return (
    <>
      <ServicesIntro />
      {SERVICES.map((svc, i) => (
        <ServicePanel key={svc.id} service={svc} index={i} />
      ))}
    </>
  )
}
