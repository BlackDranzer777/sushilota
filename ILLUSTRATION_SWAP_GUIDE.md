# Illustration Swap Guide — Sushi Lota

This document lists every emoji placeholder in the codebase and the exact steps to replace each one with a real PNG/SVG illustration.

---

## Cinematic Hero — Figures

### FIGURE_LEFT `🧘‍♀️`
- **File:** `src/components/CinematicHero/layers/FigureLeft.jsx`
- **Line:** Inside the returned `<span>` element
- **Replace with:** Traditional Indian woman figure in classical pose, holding design tools (pen + paintbrush), flowing saree
- **Asset path:** `src/assets/figures/figure-left.png`
- **Swap code:**
  ```jsx
  // Before:
  <span role="img" aria-label="figure-left-placeholder">🧘‍♀️</span>

  // After:
  import figureLeft from '../../../assets/figures/figure-left.png'
  <img src={figureLeft} alt="Sushi Lota brand designer" className={styles.figureImg} />
  ```
- **CSS:** Set `font-size: unset` on `.figure` and add `.figureImg { width: 260px; height: auto; }`

---

### FIGURE_RIGHT `🎨`
- **File:** `src/components/CinematicHero/layers/FigureRight.jsx`
- **Replace with:** Indian male figure in creative stance, holding brand/marketing symbols
- **Asset path:** `src/assets/figures/figure-right.png`
- **Swap code:**
  ```jsx
  import figureRight from '../../../assets/figures/figure-right.png'
  <img src={figureRight} alt="Sushi Lota creative director" className={styles.figureImg} />
  ```

---

## Cinematic Hero — Floating Props

All props are in `src/components/CinematicHero/layers/FloatingProps.jsx`.
Each entry in `PROPS_CONFIG` has an `id` field — match it to the asset below.

### PROP_LOTUS `🪷` — id: `"lotus"`
- **Asset path:** `src/assets/props/lotus.png`
- **Description:** Floating lotus flower illustration (Indian motif)
- **Size in scene:** 120px

### PROP_STAMP `📮` — id: `"stamp"`
- **Asset path:** `src/assets/props/stamp.png`
- **Description:** Indian postal stamp with Sushi Lota logo (from pitch deck)
- **Size in scene:** 90px

### PROP_PAINTBRUSH `🖌️` — id: `"paintbrush"`
- **Asset path:** `src/assets/props/paintbrush.png`
- **Description:** Large artistic paintbrush dripping with brand colors (#feb25d, #ffac9a)
- **Size in scene:** 150px

### PROP_CAMERA `📷` — id: `"camera"`
- **Asset path:** `src/assets/props/camera.png`
- **Description:** Vintage camera illustration (photography services)
- **Size in scene:** 100px

### PROP_PEACOCK `🦚` — id: `"peacock"`
- **Asset path:** `src/assets/props/peacock.png`
- **Description:** Rajasthani peacock illustration (Indian heritage motif, Jaipur reference)
- **Size in scene:** 140px

### PROP_MEGAPHONE `📣` — id: `"megaphone"`
- **Asset path:** `src/assets/props/megaphone.png`
- **Description:** Bold megaphone (marketing/PR services)
- **Size in scene:** 110px

### PROP_ENVELOPE `✉️` — id: `"envelope"`
- **Asset path:** `src/assets/props/envelope.png`
- **Description:** Decorative envelope with Indian pattern border
- **Size in scene:** 85px

### PROP_SPARKLES `✨` — id: `"sparkles"`
- **Asset path:** `src/assets/props/sparkles.png`
- **Description:** Hand-drawn sparkle/star cluster
- **Size in scene:** 80px

**To swap any prop:**
```jsx
// In FloatingProps.jsx PROPS_CONFIG array, for the matching id entry:
// 1. Add import at top:
import lotus from '../../../assets/props/lotus.png'

// 2. Add `img` field to the config object:
{ id: 'lotus', emoji: '🪷', img: lotus, size: 120, ... }

// 3. In the JSX, change:
<span>{prop.emoji}</span>
// to:
{prop.img
  ? <img src={prop.img} alt={prop.id} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
  : <span>{prop.emoji}</span>
}
```

---

## Ground / Skyline

### GROUND_SILHOUETTE — gradient CSS divs
- **File:** `src/components/CinematicHero/layers/BackgroundLayer.jsx` → `.groundSilhouette` div
  AND `src/components/CinematicHero/layers/GroundLayer.jsx` → `.hill1`, `.hill2`, `.hill3` divs
- **Replace with:** Jaipur skyline silhouette SVG or PNG (Hawa Mahal outline)
- **Asset path:** `src/assets/ground/jaipur-skyline.svg`
- **Swap code (BackgroundLayer.jsx):**
  ```jsx
  import jaipurSkyline from '../../../assets/ground/jaipur-skyline.svg'
  // Replace <div className={styles.groundSilhouette} /> with:
  <img src={jaipurSkyline} className={styles.skylineImg} alt="" />
  ```
- **CSS:** `.skylineImg { position: absolute; bottom: 0; width: 100%; object-fit: cover; }`

---

## Particle Field

### PARTICLE — CSS dots
- **File:** `src/components/CinematicHero/layers/ParticleField.jsx`
- **Replace with:** Gold dust / glitter PNG particles (can be a single small PNG used for multiple `<img>` elements)
- **Asset path:** `src/assets/particles/gold-particle.png`
- **Swap code:**
  ```jsx
  import goldParticle from '../../../assets/particles/gold-particle.png'
  // In particle map, replace the <div className={styles.particle} /> with:
  <img src={goldParticle} className={styles.particle} alt="" />
  // Update CSS: remove border-radius/background, set width/height
  ```

---

## Service Section Visuals

Each service card in `src/data/services.js` has a `visual` field (emoji).
The rendering lives in `src/components/ServiceCard/ServiceCard.jsx` → `.visual` div.

| Service ID    | Emoji | Asset path                          | Description                  |
|---------------|-------|-------------------------------------|------------------------------|
| `branding`    | 🎨    | `src/assets/services/branding.png`  | Brand identity illustration  |
| `packaging`   | 📦    | `src/assets/services/packaging.png` | Package/box illustration     |
| `seo`         | 📣    | `src/assets/services/seo.png`       | Megaphone/signal illustration|
| `web`         | 💻    | `src/assets/services/web.png`       | Laptop/website illustration  |
| `social`      | 📱    | `src/assets/services/social.png`    | Phone/social illustration    |
| `photography` | 📷    | `src/assets/services/camera.png`    | Camera illustration          |
| `design`      | 🖌️   | `src/assets/services/design.png`    | Paintbrush illustration      |
| `pr`          | 📢    | `src/assets/services/pr.png`        | Speaker/PR illustration      |

**To swap a service visual:**
```js
// In services.js, add an `img` field:
import brandingImg from '../assets/services/branding.png'
{ id: 'branding', ..., visual: '🎨', img: brandingImg }

// In ServiceCard.jsx, replace:
<span>{service.visual}</span>
// with:
{service.img
  ? <img src={service.img} alt={service.label} className={styles.visualImg} />
  : <span>{service.visual}</span>
}
```

---

## Asset Folder Structure to Create

```
src/assets/
  figures/
    figure-left.png      ← FIGURE_LEFT
    figure-right.png     ← FIGURE_RIGHT
  props/
    lotus.png
    stamp.png
    paintbrush.png
    camera.png
    peacock.png
    megaphone.png
    envelope.png
    sparkles.png
  ground/
    jaipur-skyline.svg   ← GROUND_SILHOUETTE
  particles/
    gold-particle.png    ← PARTICLE
  services/
    branding.png
    packaging.png
    seo.png
    web.png
    social.png
    camera.png
    design.png
    pr.png
```
