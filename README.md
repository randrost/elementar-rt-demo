# Elementar RT Admin

An open-source Angular 20 admin template. Every screen is built, not stubbed —
seven dashboards, sixteen application areas, a twelve-widget catalog, and the
settings, account, and UI-gallery pages an admin product actually needs.

**[Live demo](https://admin.elementar-rt.r-tulika.me)** · MIT licensed

---

## What this is

A complete admin front end running entirely on typed mock data. There is no
backend: each feature area owns a `mock-data.ts` with its models and a
root-provided service exposing signals. That makes it a template you can clone
and point at your own API, and a reference for how the pieces fit together.

It is built against [`docs/FEATURES.md`](docs/FEATURES.md), an independent
specification written before the code. If the two disagree, the spec wins.

### What it is not

Not a component library — it consumes [`@elementar-rt/components`](https://elementar-rt.r-tulika.me)
rather than defining one. Not production-hardened: there is no auth, no
persistence beyond `localStorage`, and the data resets on reload.

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Angular 20, standalone components, `OnPush` everywhere |
| State | Signals; `@ngrx/signals` for shared stores |
| Styling | Tailwind v4 + Angular Material 3 tokens |
| Charts | ECharts, wrapped in a directive |
| Tables | TanStack Table |
| Calendar | FullCalendar 6 (core driven imperatively) |
| Editor | Milkdown Crepe (posts), plus an original block editor |
| Grid | `@katoid/angular-grid-layout` (dynamic dashboard) |
| In-browser LLM | `@mlc-ai/web-llm`, WebGPU-gated |
| Icons | Iconify (Solar, Logos, Circle Flags), self-hosted |
| Avatars | DiceBear, generated at runtime |

Every heavy dependency is confined to the lazy chunk of the route that needs it.
Opening the dashboard does not download the calendar, the editor, or the LLM.

---

## Getting started

```bash
npm install
npm start            # dev server on http://localhost:4200
```

Other scripts:

```bash
npm run build        # production build into dist/
npm run build:prod   # explicit production configuration
npm test             # unit tests (Karma + Jasmine, watch mode)
npm run test:ci      # unit tests once, headless
npm run e2e          # end-to-end and accessibility tests (Playwright)
npm run e2e:ui       # the same, in Playwright's UI mode
```

The E2E suite starts its own dev server on port 4300, so it never picks up
whatever you have running on 4200.

Node 20 or newer.

---

## Project structure

```
src/app/
  core/           # avatar service, app store
  shared/         # datatable, charts, sparkline, stepper, mock helpers
  shell/          # sidebar, header, page container
  auth/           # sign-in through to the setup wizard
  error/          # 404 / 500 / 403 / maintenance
  onboarding/     # first-run flow
  dashboards/     # seven dashboards, incl. the drag-and-drop one
  widgets/        # the widget catalog and its registry
  applications/   # calendar, messenger, email, kanban, invoice, …
  management/     # posts and site settings
  account/        # notifications and account settings
  user-profile/   # overview and talent profiles
  gallery/        # cards, prebuilt, tables, themes, pricing, integrations
```

Two conventions carry most of the weight:

**The widget registry.** `widgets/registry.ts` maps an id to a component plus its
default grid size. The galleries, every dashboard, and the dynamic dashboard's
picker all render from that one list, so registering a widget publishes it
everywhere.

**Route-supplied variants.** Where two routes are two presentations of one
dataset — `billing` / `billing-2`, `notifications` / `notifications-2`,
`cards/general` / `cards/users` — they are one component reading `data.variant`
from the route, not two implementations to keep in sync.

---

## Feature map

| Area | Routes |
|---|---|
| Dashboards | getting-started, basic, analytics, ecommerce, finance, explore, dynamic |
| Applications | calendar, messenger, email, file manager, content editor, kanban, notes, contacts, AI studio, help center, invoice, projects, courses |
| Management | posts (list/new/edit/details/categories/topics), site settings (5 areas) |
| Account | notifications, settings (9 pages) |
| Profile | overview, talent |
| UI gallery | widgets, cards, prebuilt, datatables, themes, pricing, integrations, service pages, public posts |
| Outside shell | auth (7), errors (7), onboarding |

---

## Accessibility

Audited with axe-core (WCAG 2.0/2.1 A and AA) across 38 routes in both colour
schemes, with zero violations at the time of writing. That covers landmarks,
heading order, form labelling, and contrast — the tool cannot judge whether the
reading order makes sense, so treat it as a floor rather than a guarantee.

Keyboard focus is visible everywhere via a `:focus-visible` ring, and scrollable
regions are reachable by keyboard.

`npm run e2e` re-runs the axe checks, so a regression fails CI rather than
shipping.

---

## Deployment

The app is a static SPA served by nginx.

```bash
docker build -t elementar-rt-admin .
docker run -p 8080:80 elementar-rt-admin
```

`manifest.yaml` deploys it to Kubernetes behind an nginx ingress with
cert-manager TLS, and `Jenkinsfile` builds and pushes the image on every push to
the default branch.

Because it is a SPA, the nginx config falls back to `index.html` for unknown
paths — without that, a refresh on any deep link would 404.

---

## Licence

MIT — see [LICENSE](LICENSE). Use it, fork it, ship it.

Built by [Rostyslav Tulika](https://r-tulika.me).
