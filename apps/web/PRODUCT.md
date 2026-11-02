# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Annuity Gator advisors** (financial advisors who receive appointments from Annuity Gator's funnels). They come in rarely and for short tasks: connect their calendar and their own Zoom on first login, check upcoming appointments, adjust their hours. Accounts are created for them by AIM; they never sign up.
- **AIM admins** (staff of Advisor Internet Marketing, the company that runs Annuity Gator) manage advisor accounts.

## Product Purpose

The internal side of cal.annuitygator.com, Annuity Gator's self-hosted scheduling (a fork of cal.diy). Prospects book appointments with an advisor from the funnels; advisors use these screens to keep their availability and connections right. Success: an advisor connects calendar and Zoom on first login without asking for help, and never meets options that do not apply to them (plans, teams, pricing).

## Positioning

It must feel like an Annuity Gator tool, not a third-party SaaS: advisors already trust the Annuity Gator brand from the funnels and should recognize it here.

## Operating Context

- Sign-in: advisors with Google (`@annuitygator.com` Workspace); AIM admins with email, password and 2FA.
- First login lands on "connect your calendar", then on Zoom. The calendar is already connected for them by ops (via gator@), so the step is mostly confirmation and adding calendars to check for conflicts.
- Production cannot rebuild on its server; images are built elsewhere and shipped.

## Capabilities and Constraints

- Interface language: English.
- Out of scope: the public booking pages (booker, booking confirmation). They are owned by another developer (Miguel Alberto) and must not be touched (instruction from the owner on 2026-11-02).
- Each advisor's Zoom is their own account; it cannot be pre-installed.

## Brand Commitments

- Name "Annuity Gator" and the logo `annuitygator-v1` (source: `annuity-evaluation-4/funnel/assets/img/annuitygator-v1.png`) are used as they are.
- Brand palette and type come from the Annuity Evaluation 4.0 funnel (`annuity-evaluation-4/funnel/assets/app.css`), chosen by the owner on 2026-11-02.

## Evidence on Hand

No testimonials, metrics or claims are provided for these screens; none should be invented.

## Product Principles

1. Only what applies to an advisor; hide everything cal ships for other businesses.
2. First login ends with calendar and Zoom connected, unaided.
3. Recognizably Annuity Gator, from the funnel the advisor already knows.
