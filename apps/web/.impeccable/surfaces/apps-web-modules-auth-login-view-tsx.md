---
version: 1
slug: "apps-web-modules-auth-login-view-tsx"
primary_target: "apps/web/modules/auth/login-view.tsx"
related_targets: ["apps/web/modules/shell/SideBar.tsx","apps/web/modules/onboarding/personal/calendar"]
---

Scope: advisor-facing app of cal.annuitygator.com — login (/auth/login), auth error, onboarding calendar step, app shell (sidebar, top nav, primary buttons). Mode: Operate. Public booking pages share the global tokens but keep their own layout (owned separately).

Audience and job: Annuity Gator advisors, rare short visits; first login must end with calendar and video meetings (Zoom or Google Meet) connected, unaided. AIM admins sign in with email, password and 2FA. Nobody signs up here.

Login (2026-11-20 redesign): the screen tells an infrequent advisor what happens after signing in, without numbers or promises.

## Direction contract

THESIS: the olive rail advisors meet inside the app starts at the door and carries the route in: sign in, check your calendar, connect Zoom or Google Meet. Refuses the centered card on a flat ground that every SaaS login ships.

OWN-WORLD: olive #1f3d1b rail (dark #142812) with cream type and the light wordmark; route line in olive hairline #3d6a37, stops ringed in #6fca60, the current stop filled #42a635; content side on white (dark #11180f) with a DM Serif Display heading in olive, Inter everywhere else, primary actions in brand green per tokens.css.

STORY: the advisor recognizes Annuity Gator, sees they are at stop one of three, signs in with Google; AIM staff use the email form under its own "AIM staff" divider.

FIRST VIEWPORT: desktop: left 40% olive rail, wordmark top, serif statement, vertical three-stop route with stop one marked "You are here", help line at the foot; right 60% white, centered 440px column: serif "Advisor sign-in", subtitle, Google button, AIM staff divider, email, password, Continue. Phone: compact olive band with wordmark and a horizontal three-dot route above the form, which stays in the first screen.

FORM: "The route in", dealt structure 3 of 3 on the decision page; seed:6d3529bc0a857d7c

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
