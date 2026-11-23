# Cal.diy — Agent Guide

AIM's fork of cal.diy: a Yarn 4 + Turborepo monorepo (Next 16 web app, tRPC, Prisma/PostgreSQL) that runs
Annuity Gator's advisor scheduling at cal.annuitygator.com. This fork's changes are interleaved with upstream
cal.diy code, so read **AIM fork: what is not upstream** before editing shared files.

## Commands

```bash
yarn dev                              # web app only (Next + turbopack); needs .env and .env.appStore
yarn dx                               # docker database + migrations + seed, then dev
yarn test                             # TZ=UTC vitest, whole workspace
yarn test <path/to/file.test.ts>      # one file
VITEST_MODE=integration yarn test <path/to/file.integration-test.ts>
yarn lint:fix                         # biome lint --write (per package, via turbo)
yarn format                           # biome format --write
yarn type-check:ci                    # CI type check: turbo, every package
yarn workspace @calcom/web type-check # focused type check for the app
yarn prisma generate                  # after editing packages/prisma/schema.prisma
```

- Yarn is pinned by `yarnPath` in `.yarnrc.yml`. If `yarn` is not on `PATH` (non-interactive shells), run
  `node .yarn/releases/yarn-4.12.0.cjs <command>`.
- `yarn dev` / `yarn dx` abort before starting when `.env` / `.env.appStore` disagree with their `*.example`
  files (`env-check` tasks in `turbo.json`).
- Biome config is authoritative: 110 columns, LF, 2 spaces. Linting and formatting are separate scripts;
  pre-commit only runs `biome lint` on staged files.
- The pre-commit hook also runs `yarn app-store:build`, which regenerates `packages/app-store/*.generated.*`
  and stages them. Commit those files with the change; never hand-edit them.
- Unit tests live under `packages/**` and `apps/**` (`*.test.ts`, `*.spec.ts`). Timezone-sensitive suites are
  `*.timezone.test.ts` and need `TZ=UTC`. Projects are defined in `vitest.workspace.ts`.
- CI is `.github/workflows/all-checks.yml`: type check, lint, unit, integration, e2e, production builds.

## Branches and delivery

- Feature branches are `feat/…`, `fix/…`, `chore/…`, merged locally into the integration line `develop`
  (`Merge branch 'feat/x' into develop`) and then deleted; they are not pushed. Releases reach `origin/main`
  through pull requests.
- `origin` is AIM-techteam/cal.diy and carries `main` and `develop`; local `develop` tracks `origin/develop`.
  Push `develop` only when asked, and only as a fast-forward.
- Conventional commit subjects (`feat(scope): …`). No AI attribution trailers.
- Keep changes reviewable: under ~500 lines and ~10 code files; split by layer (schema → service → UI) when
  larger. `agents/rules/quality-pr-creation.md` has the detail.

## Layout

- `apps/web` — the Next app. Two routers coexist: `apps/web/app/` (App Router) and `apps/web/pages/` (Pages
  Router, including `pages/api`). Match the router used by the neighbouring code.
- `packages/features` — most product logic (bookings, event types, auth, workflows). `packages/trpc` — routers
  and handlers. `packages/prisma` — `schema.prisma` + migrations. `packages/ui`, `packages/coss-ui` — shared
  components; coss-ui is pulled from the coss registry (`yarn workspace @coss/ui registry:pull`), so treat it
  as vendored.
- `packages/config/theme/tokens.css` — the only source of design tokens. `packages/i18n/locales/<locale>/common.json`
  — translations.
- `apps/api` — API v2. Not built or deployed for this instance, so `/api/v2` returns 404 in production.
- `scripts/` — one-off ops SQL/JS, not application code.

## Conventions that differ from defaults

- Prisma: `select`, never `include` (performance and credential leakage).
- Errors: `ErrorWithCode` from `@calcom/lib/errors` in services, repositories and utilities; `TRPCError` only
  inside tRPC routers. Always name the failing entity and value in the message.
- Imports: direct source paths, `import type` for types, no barrel `index.ts` imports.
- `apps/api/v2` has no path mappings for `@calcom/features` / `@calcom/trpc`; re-export through
  `packages/platform/libraries/index.ts` and import from `@calcom/platform-libraries`.
- Every user-facing string goes through `t()` with a key in `packages/i18n/locales/en/common.json`; AIM keys
  are prefixed `aim_` and must also exist in `es`.
- Permission checks belong in `page.tsx`, never in `layout.tsx`.
- Comments explain **why**. In AIM files the house style is a paragraph recording the incident or decision
  (see `apps/web/app/api/aim/booking-ics/[file]/route.ts`); match it instead of writing terse labels.

## AIM fork: what is not upstream

These look like cal.diy but are AIM behaviour. Preserve them when resolving upstream merges or refactoring.

- **Two-day booker view** — event metadata `bookerTwoDayView` (`packages/prisma/zod-utils.ts`). New and
  duplicated event types default to it via `withAimEventTypeDefaults` (`packages/features/eventtypes/lib/`).
  Rendering lives in `packages/features/bookings/Booker/utils/twoDayView.ts`, `TwoDayPicker`,
  `apps/web/modules/bookings/lib/two-day-theme.ts` (`--td-*` CSS variables) and the two-day form style in
  `BookingFormStyleContext.tsx`.
- **One shared Google credential** — every advisor's connection copies one ops account
  (`AIM_SHARED_GOOGLE_ACCOUNT`, default `gator@annuitygator.com`). `CalendarService` filters the calendar list
  down to the user's own calendar; that filter is the fix for advisors seeing ~250 unrelated calendars, so
  never remove it.
- **Accounts are provisioned, never self-served** — Google sign-in only opens an existing account. With
  `AIM_ALLOW_GOOGLE_SIGNUP` unset (the default) unknown emails get `/auth/error?error=no-account`. Do not
  restore upstream signup behaviour.
- **Onboarding** — one calendar step, then `/apps/zoom` so each advisor connects their own Zoom; a cron moves
  their event types from Google Meet to Zoom afterwards.
- **Public iCal endpoint** — `apps/web/app/api/aim/booking-ics/[file]/route.ts`, linked from Keap emails.
  Serves the first uid of a reschedule chain, follows it forward, and answers `METHOD:CANCEL` for cancelled
  bookings.
- **Admin impersonation** — `apps/web/pages/api/auth/impersonate.ts` signs a JWT for the target user; the admin
  identity is never read from the request body. Banner: `apps/web/modules/users/components/ImpersonationBanner.tsx`.
- **Brand layer** — `apps/web/components/aim/*` and `apps/web/styles/aim-brand.css`.

## Design system — do not invent values

- `apps/web/PRODUCT.md` (users, product principles) and `apps/web/DESIGN.md` (tokens, rules, component
  treatments) are authoritative. Read both before changing advisor-facing UI.
- Palette lives only in `packages/config/theme/tokens.css` (`:root` and `.dark`); fonts in
  `apps/web/app/fonts.ts`. `aim-brand.css` maps tokens onto `--cal-*` and coss-ui variables and must not
  declare palette values.
- `AimBrandScope` adds `body.aim-brand` on advisor screens; mount it on any new advisor-facing screen. Rules
  for `.aim-rail` and the login route stay outside that scope so the olive paints before mount.
- Public booking pages share the global tokens but keep their own layout.
- `apps/web/.impeccable/` is the design record: `design.json` (regenerated from the shipped build) and
  `surfaces/<slug>.md` per screen. Commit it alongside UI changes.

## Rules and docs index

- `agents/rules/` (symlinked as `.claude/rules` and `.cursor/rules`) holds the engineering rules. Each rule
  declares `paths:` frontmatter so it loads only for matching files — keep that frontmatter, and keep new
  rules small; the whole set is loaded into a shared context budget.
- `agents/commands.md` — command reference. `agents/knowledge-base.md` — domain model (managed event types,
  orgs/teams, OAuth clients, local DB users). `agents/README.md` — index.
- `SPEC-WORKFLOW.md` + `specs/` — opt-in spec-driven workflow, only when the user asks for it.

## Boundaries

- **Ask first**: schema changes in `packages/prisma/schema.prisma`, new dependencies, changes spanning several
  packages, deleting files, full builds or E2E suites.
- **Never**: `as any`, exposing `credential.key` in a query or response, committing secrets or `.env` files,
  editing `*.generated.*` by hand, force-pushing shared branches.

## Production context

- Deployed at cal.annuitygator.com for ~85 advisors on a managed PostgreSQL database.
- Images are built off the production host and shipped; do not plan to rebuild the app on the server.
- AIM uses its own SendGrid account and its own Google Cloud project ("AIM Calendar"). Never point production
  at another instance's credentials.
