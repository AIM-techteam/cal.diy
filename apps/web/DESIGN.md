---
name: Annuity Gator Advisor App
description: The advisor-facing side of cal.annuitygator.com, wearing the Annuity Evaluation 4.0 funnel brand.
colors:
  brand-green: "#2b7a24"
  brand-green-deep: "#22631c"
  focus-green: "#42a635"
  selection-green: "#cfe8c6"
  olive-rail: "#1f3d1b"
  olive-hairline: "#2c5227"
  rail-text: "#e2f2dc"
  rail-text-subtle: "#bdd3b6"
  rail-text-muted: "#a3bc9b"
  ink: "#1d2419"
  text: "#2f3a2c"
  text-subtle: "#4b5848"
  text-muted: "#5a6655"
  content-white: "#ffffff"
  sage-emphasis: "#e2f2dc"
  sage-ground: "#f1f6ee"
  sage-wash: "#f7faf5"
  sage-stroke: "#9fae99"
  switch-off-track: "#7f8f79"
  sage-hairline: "#dfe7db"
  sage-hairline-faint: "#eaf0e7"
typography:
  display:
    fontFamily: "AG Serif (DM Serif Display), Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 400
  headline:
    fontFamily: "AG Serif (DM Serif Display), Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.25
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
rounded:
  card: "12px"
  panel: "16px"
components:
  button-primary:
    backgroundColor: "{colors.brand-green}"
    textColor: "{colors.content-white}"
  button-primary-hover:
    backgroundColor: "{colors.brand-green-deep}"
  input:
    backgroundColor: "{colors.content-white}"
    textColor: "{colors.ink}"
  nav-rail:
    backgroundColor: "{colors.olive-rail}"
    textColor: "{colors.rail-text}"
  card-login:
    backgroundColor: "{colors.content-white}"
    rounded: "{rounded.card}"
    padding: "40px"
  switch-off:
    backgroundColor: "{colors.switch-off-track}"
---

# Design System: Annuity Gator Advisor App

## Overview

**Creative North Star: "The Funnel's Back Office"**

cal's screens, kept exactly as advisors know them, re-dressed in the Annuity Gator funnel identity they already trust. Layout, components and density are stock cal.diy; what changes is palette, heading face, wordmark, and one signature region: the olive sidebar rail. The neutral blue-gray SaaS look is refused; nothing else about cal's structure is reinvented.

The whole theme is a token override. It lives in `apps/web/styles/aim-brand.css` and applies only under `body.aim-brand`, a class `AimBrandScope` (`apps/web/components/aim/AimBrandScope.tsx`) adds while an advisor-facing screen is mounted (app shell, login, auth error, onboarding) and removes on unmount. It sits on `<body>` so portalled menus and dialogs inherit it. Public booking pages (booker, booking confirmation) never mount the scope and are owned by another developer; they must keep cal's own look.

**Key Characteristics:**
- Token remap, not component rewrite: the `--cal-*` tokens and the coss-ui tokens (`--primary`, `--primary-foreground`, `--ring`, `--border`, `--input`, `--muted-foreground`, `--foreground`) are redefined in the same scope.
- Brand green on every primary action, focus ring, selection, caret and native accent.
- Olive rail on the left; content on white; sage grounds only on login and onboarding.
- DM Serif Display for headings only; Inter for everything else.
- The Annuity Gator wordmark and arrow-A mark, used as supplied.

## Colors

A green-on-sage palette lifted from the Annuity Evaluation 4.0 funnel (`annuity-evaluation-4/funnel/assets/app.css`), with every neutral tinted sage instead of cal's blue-gray.

### Primary
- **Button Green** (brand-green): every primary action (`--cal-brand`, `--primary`), plus `accent-color` and `caret-color`. White text on it measures 5.37:1. Hover/emphasis is **Deep Button Green** (brand-green-deep).
- **Focus Green** (focus-green): `--ring` and the `:focus-visible` outline color. In dark theme it becomes the brand color itself, with near-black text (#0e1a0c, 5.75:1).
- **Selection Green** (selection-green): text selection ground, with ink text.

### Secondary
- **Olive Rail** (olive-rail): the sidebar ground. Inside the rail the neutrals flip to cream: rail-text for nav labels (10.3:1), rail-text-subtle (7.6:1) and rail-text-muted (5.9:1); dividers are olive-hairline; hover and active nav items are translucent cream (rgba(226,242,220,0.1) and 0.18). Dark theme deepens the rail to #142812.

### Neutral
- **Ink** (ink): headings and emphasis text; also coss-ui `--foreground`.
- **Text / Subtle Text** (text, text-subtle): default and secondary body copy.
- **Muted Sage Text** (text-muted): the lowest text tier and coss-ui `--muted-foreground`. Chosen to clear 4.5:1 on every light ground: 6.06 on white, 5.75 on sage-wash, 5.53 on sage-ground, 5.18 on sage-emphasis.
- **Content White** (content-white): the in-app content ground, the funnel's own `--bg`.
- **Sage Ground / Sage Wash / Sage Emphasis** (sage-ground, sage-wash, sage-emphasis): `--cal-bg-subtle`, `--cal-bg-muted`, `--cal-bg-emphasis`. Sage-ground is the page behind the login and onboarding cards; sage-emphasis tints chips and badges.
- **Sage Stroke** (sage-stroke): `--cal-border` and coss-ui `--input` (form field strokes).
- **Sage Hairlines** (sage-hairline, sage-hairline-faint): `--cal-border-subtle` / coss-ui `--border`, and `--cal-border-muted`.

### Named Rules
**The Scope Rule.** Every brand value is declared under `body.aim-brand` and nowhere else. A global `:root` override would repaint the public booking pages, which are out of bounds.

**The Muted Floor Rule.** No text on a light ground goes below text-muted. Stock cal markup that hard-codes `text-gray-400` / `text-zinc-400` (2.6:1 on white) is remapped to `--cal-text-muted` inside the scope.

**The Honest Off Rule.** An unchecked switch uses switch-off-track `#7f8f79` (3.4:1 on white), never a brand tint, so a hidden event type cannot read as half-on.

**The Neutral Dark Rule.** Dark theme keeps cal's own gray neutrals; only the brand green and the type follow the funnel.

## Typography

**Display Font:** DM Serif Display, self-hosted as "AG Serif" from `/aim/dm-serif-display-latin{,-ext}-v17.woff2` (OFL, license in `/aim/OFL-dm-serif-display.txt`), with Georgia, serif
**Body Font:** Inter (cal's stock sans)

**Character:** a high-contrast editorial serif for headings over a plain, legible sans, the same pairing advisors see in the funnel.

### Hierarchy
- **Display** (400, 1.875rem): auth page headings ("Advisor sign-in", auth container headings).
- **Headline** (400, 1.25rem, 1.25): app page titles and onboarding card titles.
- **Body** (Inter, 0.875rem): subtitles, descriptions, list content.
- **Label** (Inter 500, 0.875rem): form labels, nav items, buttons.

### Named Rules
**The Headings-Only Serif Rule.** The serif enters only through `--font-cal` (the `font-cal` utility). Body, labels, data and numbers stay on Inter.

**The One Weight Rule.** DM Serif Display ships a single weight (400). Never pair `font-cal` with a bold or semibold weight; the browser fakes it. `aim-brand.css` pins `.font-cal` to 400 with `font-synthesis: none`, so stock cal markup that asks for semibold still renders the real face.

## Layout

Stock cal layout is preserved unchanged. In-app: a sticky left rail (56px icon-only at md, 224px with labels at lg; hidden below md, where a top bar with the wordmark takes over) beside content on white. Login: one centered card (max-width 28rem, 40px padding) on sage-ground, wordmark then serif heading then Google as the primary action. Onboarding: a single calendar step in a centered 16px-radius panel on sage, wordmark above, sign-out below; no step dots and no Back button, because there is only one step.

## Elevation & Depth

Flat, as cal ships it. Depth comes from tonal grounds (white card on sage, olive rail beside white) and hairline borders; the only shadows are cal's stock small card shadow on login and the floating footer on onboarding. The theme adds none.

## Shapes

Inherited from cal: gently rounded cards (12px on login), larger panels (16px on onboarding), pill switches and avatars. The theme changes no radius.

## Components

### Buttons
- **Primary:** brand-green ground, white text; hover brand-green-deep. Used for Sign in with Google, New, Continue.
- **Secondary / outline:** white ground with sage-stroke border and ink text (Connect, Continue on the password form).
- **Focus:** focus-green outline.

### Inputs / Fields
- **Style:** white ground, sage-stroke (`--input`) border, ink text, brand-green caret.
- **Focus:** focus-green ring.

### Navigation
- **Rail:** olive ground, cream labels in Inter 500; active item on translucent cream (0.18), hover 0.1; scrollbar #3d6a37. The light wordmark heads the rail at lg (22px tall), the light arrow-A mark replaces it at md (28px). The license credits line at the rail foot is kept, raised to 0.625rem at full opacity in rail-text-subtle so it is readable on olive.
- **Mobile:** top bar with the dark wordmark (20px tall).

### Switches
- **On:** brand green. **Off:** sage-stroke track.

### Wordmark (signature)
`AimLogo` (`apps/web/components/aim/AimLogo.tsx`) renders the supplied PNGs from `/aim/`: dark wordmark on light grounds, light (cream-ink) wordmark and mark on the olive rail. Assets are used as-is per the brand commitment in PRODUCT.md: no recoloring, cropping or redrawing.

## Do's and Don'ts

### Do:
- **Do** add new brand values only inside `body.aim-brand` in `apps/web/styles/aim-brand.css`, and mount `AimBrandScope` on any new advisor-facing screen.
- **Do** map both token families (`--cal-*` and coss-ui) when a new token is needed; coss-ui components ignore `--cal-*`.
- **Do** use brand-green for every primary action and text-muted as the floor for light-ground text.
- **Do** use the light wordmark on olive and the dark wordmark on white or sage.

### Don't:
- **Don't** touch the public booking pages or move any brand value to `:root`.
- **Don't** set a heading in the serif at any weight other than 400.
- **Don't** give an off switch or disabled control a brand tint.
- **Don't** recolor, redraw or substitute the Annuity Gator wordmark.
- **Don't** spread olive beyond the rail; content stays on white, and sage grounds stay on login and onboarding.
