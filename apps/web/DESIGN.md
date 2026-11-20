---
name: Annuity Gator Advisor App
description: cal.annuitygator.com (advisor app and public booking pages), wearing the Annuity Gator funnel brand in light and dark.
colors:
  brand-green: "#2b7a24"
  brand-green-deep: "#22631c"
  focus-green: "#42a635"
  selection-green: "#cfe8c6"
  olive-rail: "#1f3d1b"
  olive-hairline: "#2c5227"
  route-connector: "#3d6a37"
  route-ring: "#6fca60"
  route-numeral: "#0d150b"
  rail-text: "#e2f2dc"
  rail-text-subtle: "#bdd3b6"
  rail-text-muted: "#a3bc9b"
  ink: "#1d2419"
  heading-olive: "#1f3d1b"
  text-subtle: "#4b5848"
  text-muted: "#5a6655"
  content-white: "#ffffff"
  sage-emphasis: "#e2f2dc"
  sage-ground: "#f1f6ee"
  sage-wash: "#f7faf5"
  sage-stroke: "#82927c"
  switch-off-track: "#7f8f79"
  sage-hairline: "#dfe7db"
  sage-hairline-faint: "#eaf0e7"
typography:
  display-xl:
    fontFamily: "DM Serif Display, serif"
    fontSize: "3rem"
    fontWeight: 400
    lineHeight: 1.05
  display:
    fontFamily: "DM Serif Display, serif"
    fontSize: "1.875rem"
    fontWeight: 400
  headline:
    fontFamily: "DM Serif Display, serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.25
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
  label-caps:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.08em"
rounded:
  card: "12px"
  panel: "16px"
  pill: "9999px"
spacing:
  rail-pad-phone: "20px"
  rail-pad-lg: "56px"
  route-gap-lg: "40px"
  form-gap: "24px"
components:
  button-primary:
    backgroundColor: "{colors.brand-green}"
    textColor: "{colors.content-white}"
  button-primary-hover:
    backgroundColor: "{colors.brand-green-deep}"
  button-google:
    backgroundColor: "{colors.brand-green}"
    textColor: "{colors.content-white}"
    height: "48px"
  button-continue-outline:
    backgroundColor: "{colors.content-white}"
    textColor: "{colors.ink}"
    height: "44px"
  input:
    backgroundColor: "{colors.content-white}"
    textColor: "{colors.ink}"
  nav-rail:
    backgroundColor: "{colors.olive-rail}"
    textColor: "{colors.rail-text}"
  login-rail:
    backgroundColor: "{colors.olive-rail}"
    textColor: "{colors.rail-text}"
    padding: "{spacing.rail-pad-lg}"
  route-stop-current:
    backgroundColor: "{colors.focus-green}"
    textColor: "{colors.route-numeral}"
    rounded: "{rounded.pill}"
    size: "28px"
  route-stop-upcoming:
    backgroundColor: "{colors.olive-rail}"
    textColor: "{colors.rail-text-subtle}"
    rounded: "{rounded.pill}"
    size: "28px"
  route-here-pill:
    backgroundColor: "{colors.sage-emphasis}"
    textColor: "{colors.heading-olive}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.pill}"
  switch-off:
    backgroundColor: "{colors.switch-off-track}"
---

# Design System: Annuity Gator Advisor App

## Overview

**Creative North Star: "The Funnel's Back Office"**

cal's screens, re-dressed in the Annuity Gator funnel identity (quiz.annuitygator.com) that advisors and prospects already trust. The whole app speaks one brand: palette, heading face, wordmark, and one signature region, the olive rail. Advisors meet that rail at the door: the login is an olive rail carrying the route in (sign in, check your calendar, connect Zoom or Google Meet) beside a plain white sign-in column, and the same rail runs down the side of the app once they are inside. The neutral blue-gray SaaS look is refused, and so is the centered card on a flat ground for the login.

The theme has two layers:

1. **Global tokens** in `packages/config/theme/tokens.css` (`:root` for light, `.dark` for dark) and fonts in `apps/web/app/fonts.ts` (Inter as `--font-sans`, DM Serif Display as `--font-cal`). Every surface, public booking pages included, reads these. `--ag-brand`, `--ag-brand-emphasis` and `--ag-brand-text` hold the brand per theme.
2. **Advisor-app fixes** in `apps/web/styles/aim-brand.css`. Most rules sit under `body.aim-brand`, a class `AimBrandScope` (`apps/web/components/aim/AimBrandScope.tsx`) adds while an advisor-facing screen is mounted (app shell, login, auth error, onboarding); it sits on `<body>` so portalled menus and dialogs inherit it. They hold only what tokens cannot express: the coss-ui token family, stock markup that hard-codes grays, the off switch and text selection. The olive rail (`.aim-rail`) and the login route (`.aim-login-*`) are deliberately **not** scoped to `body.aim-brand`: `AimBrandScope` adds its class after mount, and the olive ground must be there on first paint or the cream wordmark sits on a light ground.

Runtime brand colors (`useAppTheme` on `<html>`, an advisor's `brandColor`) are overridden by pinning `--cal-brand*` to `--ag-brand*`: on `<body>` in the advisor app, and on the booking wrapper through `BOOKING_BRAND_VARS` (`apps/web/modules/bookings/lib/booking-brand.ts`).

**Key Characteristics:**
- Token remap, not component rewrite: `--cal-*` tokens are global; coss-ui tokens (`--primary`, `--primary-foreground`, `--ring`, `--border`, `--input`, `--muted-foreground`, `--foreground`) point at them inside the advisor scope.
- Brand green on every primary action, focus ring, selection, caret and native accent.
- Olive rail on the left (the app sidebar, and the login's route rail); content on white. Sage grounds stay on onboarding and the auth utility pages (error, forgot password, logout).
- DM Serif Display for headings only; Inter for everything else.
- The Annuity Gator wordmark and arrow-A mark, used as supplied.

## Colors

A green-on-sage palette lifted from the Annuity Gator funnel (quiz.annuitygator.com), with every neutral tinted sage instead of cal's blue-gray. Dark theme derives from the same greens (see Dark theme).

### Primary
- **Button Green** (brand-green): every primary action (`--cal-brand`, `--primary`), plus `accent-color` and `caret-color`. White text on it measures 5.37:1. Hover/emphasis is **Deep Button Green** (brand-green-deep).
- **Focus Green** (focus-green): token `--ag-ring` in `tokens.css`, read by coss-ui `--ring` and the `:focus-visible` outline color (5.8:1 on the dark ground too), and the filled current stop of the login route. Reserved for icons, rings, checks and that stop on light or olive grounds: 3.12:1 on white is too low for small text.
- **Selection Green** (selection-green): text selection ground, with ink text.

### Secondary
- **Olive Rail** (olive-rail): the sidebar ground and the login rail. Inside the rail the neutrals flip to cream: headings white, rail-text for labels (10.3:1), rail-text-subtle (7.6:1) and rail-text-muted (5.9:1); dividers are olive-hairline; hover and active nav items are translucent cream (rgba(226,242,220,0.1) and 0.18). Dark theme deepens the rail to #142812.
- **Route colors** (route-connector, route-ring, route-numeral): the login route drawn on the rail. The connector between stops is route-connector (also the rail scrollbar), upcoming stops are rings of route-ring on the olive ground with rail-text-subtle numerals, and the current stop is filled focus-green with a near-black route-numeral. The "You are here" pill on the current stop is sage-emphasis with heading-olive text.

### Neutral
- **Heading Olive** (heading-olive): `--cal-text-emphasis`, headings and emphasis text (12.06:1).
- **Ink / Subtle Text** (ink, text-subtle): `--cal-text` default body copy (also coss-ui `--foreground`) and `--cal-text-subtle` secondary copy.
- **Muted Sage Text** (text-muted): the lowest text tier and coss-ui `--muted-foreground`. Chosen to clear 4.5:1 on every light ground: 6.06 on white, 5.75 on sage-wash, 5.53 on sage-ground, 5.18 on sage-emphasis.
- **Content White** (content-white): the in-app content ground, the funnel's own `--bg`, and the login's sign-in side.
- **Sage Ground / Sage Wash / Sage Emphasis** (sage-ground, sage-wash, sage-emphasis): `--cal-bg-subtle`, `--cal-bg-muted`, `--cal-bg-emphasis`. Sage-ground is the page behind the auth utility cards (`AuthContainer`); sage-wash is the onboarding page ground behind its white panel; sage-emphasis tints chips and badges.
- **Sage Stroke** (sage-stroke): `--cal-border` and coss-ui `--input` (form field strokes), 3.31:1 on white so input boundaries clear 3:1.
- **Sage Hairlines** (sage-hairline, sage-hairline-faint): `--cal-border-subtle` / coss-ui `--border` (the login's "AIM staff" divider lines), and `--cal-border-muted`.

### Named Rules
**The One Source Rule.** Every palette value lives in `packages/config/theme/tokens.css`, light and dark. `aim-brand.css` may reference tokens but never declares a new palette value, except the olive rail (including the login route drawn on it: connector #3d6a37, stop rings #6fca60, current stop #42a635 with #0d150b numeral, "You are here" pill #e2f2dc on #1f3d1b ink, and the current stop's halo in the same green), the off-switch track, and text selection.

**The Muted Floor Rule.** No text on a light ground goes below text-muted. Stock cal markup that hard-codes `text-gray-400` / `text-zinc-400` (2.6:1 on white) is remapped to `--cal-text-muted` inside the advisor scope.

**The Honest Off Rule.** An unchecked switch uses switch-off-track `#7f8f79` (3.4:1 on white), never a brand tint, so a hidden event type cannot read as half-on.

**The Green Dark Rule.** Dark theme uses olive-black grounds derived from the funnel greens, never pure black or cal's grays: ground #11180f, muted #18221a, subtle #1f2c1d, emphasis #283826; text #e6eee2, headings #f3f8ef, subtle #a4b49f, muted #94a38f (4.69:1 or better on every dark ground); field strokes #5b7055 (3.35:1). Primary actions are #4cae3e with near-black #0d150b text (6.58:1), hover #5cc04d; white text never sits on the dark-theme green.

### Dark theme
See **The Green Dark Rule**. The olive rail deepens to #142812 in dark; the login's sign-in side takes the dark ground #11180f. Route colors stay the same in both themes.

## Typography

**Display Font:** DM Serif Display, loaded with `next/font/google` in `apps/web/app/fonts.ts` as `--font-cal` (OFL)
**Body Font:** Inter, `--font-sans`, also from `apps/web/app/fonts.ts`

**Character:** a high-contrast editorial serif for headings over a plain, legible sans, the same pairing advisors see in the funnel.

### Hierarchy
- **Display XL** (400, 3rem, 1.05): the login's "Advisor sign-in" heading (2.25rem on phones) and the rail statement on desktop (line-height 1.08, max 28rem, balanced).
- **Display** (400, 1.875rem): auth utility page headings (`AuthContainer`).
- **Headline** (400, 1.25rem, 1.25): app page titles and onboarding card titles.
- **Title** (Inter 600, 1rem): route stop names on the desktop rail (0.75rem on phones, 0.875rem from sm).
- **Body** (Inter, 0.875rem): subtitles, descriptions, list content. The login subtitle runs at 1rem.
- **Label** (Inter 500, 0.875rem): form labels, nav items, buttons.
- **Label Caps** (Inter 600, 0.75rem, 0.08em, uppercase): the "You are here" stop badge only.

### Named Rules
**The Headings-Only Serif Rule.** The serif enters only through `--font-cal` (the `font-cal` utility). Body, labels, data and numbers stay on Inter.

**The One Weight Rule.** DM Serif Display ships a single weight (400). Never pair `font-cal` with a bold or semibold weight; the browser fakes it. `tokens.css` pins `.font-cal` to 400 with `font-synthesis: none`, so stock cal markup that asks for semibold still renders the real face.

## Layout

Stock cal layout is preserved unchanged in the app. In-app: a sticky left rail (56px icon-only at md, 224px with labels at lg; hidden below md, where a top bar with the wordmark takes over) beside content on white.

**Login (the route in).** No card. From lg (1024px) the page is two columns, 2fr : 3fr: the olive rail takes 40% at full height (56px padding, 64px from xl) with the light wordmark at the top, the serif statement, the vertical three-stop route (40px between stops) and the help line pinned to the foot; the white side centers a 440px column holding the serif heading, subtitle, Google button, "AIM staff" divider, email and password fields (24px apart) and Continue. Below lg the rail collapses to a compact top band (20px side padding, 32px from sm) with the wordmark and a horizontal three-dot route showing stop names only; the statement, descriptions and "You are here" pill are hidden, the help line moves under the form, and the form stays in the first screen.

**Auth utility pages** (error, forgot password, logout) keep `AuthContainer`: the wordmark above one centered card (max-width 28rem) on sage-ground.

**Onboarding:** a single calendar step in a centered 16px-radius white panel on sage-wash, wordmark above, sign-out below; no step dots and no Back button, because there is only one step.

## Elevation & Depth

Flat, as cal ships it. Depth comes from tonal grounds (olive rail beside white, white panel on sage) and hairline borders. The login carries no shadow at all; the only stock shadow kept is the floating footer on onboarding. The theme adds none; the current-stop halo on the login is motion, not elevation.

## Shapes

Rounded to match the funnel: `--radius-md` 10px, `--radius-lg` 12px (buttons, inputs), `--radius-xl` 14px (cards), `--radius-2xl` 16px (panels); pill switches, avatars, route stops (28px circles with a 2px ring) and the "You are here" badge.

## Components

### Buttons
- **Primary:** brand-green ground, white text; hover brand-green-deep. Used for Sign in with Google, New, and Continue wherever no Google button sits above it (Google disabled, or the two-factor step).
- **Google (login):** the primary treatment at 48px tall with 1rem text and the colored Google mark; the advisor's way in.
- **Secondary / outline:** white ground with sage-stroke border and ink text. Used for Connect, and for the login's Continue (44px) whenever Google is shown, so the page carries one primary action.
- **Focus:** focus-green outline.

### Inputs / Fields
- **Style:** white ground, sage-stroke (`--input`) border, ink text, brand-green caret.
- **Focus:** focus-green ring.
- **Error:** field messages in the destructive foreground at 0.75rem under the field.

### Navigation
- **Rail:** olive ground, cream labels in Inter 500; active item on translucent cream (0.18), hover 0.1; scrollbar route-connector. The light wordmark heads the rail at lg (22px tall), the light arrow-A mark replaces it at md (28px). The license credits line at the rail foot is kept, raised to 0.625rem at full opacity in rail-text-subtle so it is readable on olive.
- **Mobile:** top bar with the dark wordmark (20px tall).

### Switches
- **On:** brand green. **Off:** switch-off-track.

### Login Route (signature)
`AimLoginRoute` (`apps/web/components/aim/AimLoginRoute.tsx`) draws the three stops of a first login on the olive rail as an ordered list: sign in, check your calendar, connect Zoom or Google Meet. Stops are 28px numbered circles: the current one filled focus-green with a route-numeral, upcoming ones ringed route-ring on olive. A 2px route-connector runs between them, down from lg and across below it; its geometry in `aim-brand.css` mirrors the component's spacing classes and changes with them. The current stop carries `aria-current="step"` and, from lg, the "You are here" badge; descriptions show only from lg (max 22rem). Every string is an i18n key (`aim_login_*`, English and Spanish).

**The One Moment Rule.** The login has exactly one motion moment: a halo that grows from the current stop to 12px and fades, twice (1.6s, cubic-bezier(0.16, 1, 0.3, 1), 0.3s delay). `prefers-reduced-motion: reduce` turns it off.

**The AIM Staff Divider Rule.** Advisors sign in with Google; the email and password form below is for AIM staff, introduced by a hairline divider labelled "AIM staff" in text-muted (28px above and below). It appears only when a social sign-in button is shown.

### Wordmark (signature)
`AimLogo` (`apps/web/components/aim/AimLogo.tsx`) renders the supplied PNGs from `/aim/`: dark wordmark on light grounds, light (cream-ink) wordmark and mark on the olive rail (24px tall on the login band, 28px on the desktop login rail). Assets are used as-is per the brand commitment in PRODUCT.md: no recoloring, cropping or redrawing.

## Do's and Don'ts

### Do:
- **Do** add new palette values to `packages/config/theme/tokens.css` in both `:root` and `.dark`, and mount `AimBrandScope` on any new advisor-facing screen.
- **Do** map both token families (`--cal-*` and coss-ui) when a new token is needed; coss-ui components ignore `--cal-*`.
- **Do** use brand-green for every primary action and text-muted as the floor for light-ground text.
- **Do** use the light wordmark on olive and the dark wordmark on white or sage.
- **Do** keep `.aim-rail` and the login route rules outside `body.aim-brand`, so the olive paints before `AimBrandScope` mounts.
- **Do** keep one primary action per auth screen: when Google is shown, Continue drops to outline.
- **Do** put every login string through `t()` with English and Spanish entries.

### Don't:
- **Don't** declare palette values outside `tokens.css`, or let a runtime brand color (advisor `brandColor`, `useAppTheme`) reach a brand surface unpinned.
- **Don't** set a heading in the serif at any weight other than 400.
- **Don't** give an off switch or disabled control a brand tint.
- **Don't** recolor, redraw or substitute the Annuity Gator wordmark.
- **Don't** spread olive beyond the rail; content stays on white, and sage grounds stay on onboarding and the auth utility pages.
- **Don't** put the login back in a centered card on a flat ground.
- **Don't** add a second motion moment to the login, or run the halo under reduced motion.
