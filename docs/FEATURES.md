# Elementar RT Admin — Feature Specification

This is the **source of truth** for the build. It is an original specification of
behaviour and UX, written independently. Implementation must follow this document,
not any third-party source. Data-shape field lists and route paths are facts; all
copy, layout, and code are ours to design.

Conventions for every page: standalone components, `OnPush`, signals, `inject()`,
Tailwind + Material 3 tokens, dark mode, keyboard-accessible, responsive. Each
feature area owns a `mock-data.ts` (typed models + a `providedIn:'root'` service
returning signals/observables). No HTTP backend.

---

## 1. Route map

Top-level areas are lazy-loaded. Auth, error, and onboarding render **outside** the
app shell; everything else renders **inside** the shell (sidebar + header + body).

### Outside shell
- `/auth/sign-in`, `/auth/sign-up`, `/auth/forgot-password`, `/auth/password-reset`,
  `/auth/set-new-password`, `/auth/create-account`, `/auth/done`
- `/error/not-found`, `/error/not-found-2`, `/error/server-error`, `/error/server-error-2`,
  `/error/forbidden`, `/error/forbidden-2`, `/error/maintenance`
- `/onboarding`

### Inside shell
- `/dashboard/getting-started` (shell default redirect target), `/dashboard/basic`,
  `/dashboard/analytics`, `/dashboard/ecommerce`, `/dashboard/finance`,
  `/dashboard/explore`, `/dashboard/dynamic`
- `/applications/calendar`, `/applications/messenger`, `/applications/file-manager`,
  `/applications/content-editor`, `/applications/kanban`, `/applications/notes`,
  `/applications/contacts`, `/applications/ai-studio`
- `/applications/help-center/{home,faq,guides,support}`
- `/applications/invoice/{list, details/:id, new, edit/:id}`
- `/applications/email/{inbox, sent, drafts, spam, trash, label/:label}`
- `/applications/projects`
- `/applications/courses/{list, details/:id, builder/:id}`
- `/management/posts/{list, new, details/:id, edit/:id, categories, topics}`
- `/management/settings/{general, writing, reading, discussion, media}`
- `/account/notifications`
- `/account/settings/{my-profile, security, notifications, notifications-2, billing, billing-2, sessions, cookie, payment}`
- `/user-profile/overview`, `/user-profile/talent`
- `/widgets/{general, crypto, finance, analytics}`
- `/cards/{general, users}`
- `/prebuilt/{skeleton, notifications, selects, dialogs}`
- `/datatables/{general, users}`
- `/themes`
- `/pricing/{basic, membership}`
- `/integrations`
- `/service-pages/{email-activation, integrations}`
- `/content/posts`
- `**` → `/error/not-found`

Default: `/` → `/dashboard/getting-started`.

---

## 2. Sidebar navigation tree

Rendered from a declarative `NavItem[]` (heading | link | group with children).
Icons are Iconify **Solar** names. Active state derived from the current URL path.
Groups auto-expand when a child route is active; collapsed otherwise.

```
HEADING  Dashboards
  LINK   Getting Started      solar:rocket-2-bold-duotone        /dashboard/getting-started
  GROUP  Dashboards           solar:widget-5-bold-duotone
         Basic                                                    /dashboard/basic
         Analytics                                                /dashboard/analytics
         eCommerce                                                /dashboard/ecommerce
         Finance                                                  /dashboard/finance
         Explore                                                  /dashboard/explore
         Dynamic                                                  /dashboard/dynamic

HEADING  Applications
  LINK   Calendar             solar:calendar-bold-duotone         /applications/calendar
  LINK   Messenger            solar:chat-round-dots-bold-duotone  /applications/messenger
  LINK   Email                solar:letter-bold-duotone           /applications/email/inbox
  LINK   File Manager         solar:folder-with-files-bold-duotone /applications/file-manager
  LINK   Kanban               solar:notebook-bold-duotone         /applications/kanban
  LINK   Notes                solar:notes-bold-duotone            /applications/notes
  LINK   Contacts             solar:users-group-rounded-bold-duotone /applications/contacts
  LINK   Content Editor       solar:pen-new-square-bold-duotone   /applications/content-editor
  LINK   AI Studio            solar:magic-stick-3-bold-duotone    /applications/ai-studio
  LINK   Invoice              solar:bill-list-bold-duotone        /applications/invoice/list
  LINK   Projects             solar:folder-bold-duotone           /applications/projects
  LINK   Courses              solar:square-academic-cap-bold-duotone /applications/courses/list
  GROUP  Help Center          solar:question-circle-bold-duotone
         Home / FAQ / Guides / Support                            /applications/help-center/*

HEADING  Management
  GROUP  Posts                solar:document-text-bold-duotone
         All Posts / New Post / Categories / Topics               /management/posts/*
  GROUP  Site Settings        solar:settings-bold-duotone
         General / Writing / Reading / Discussion / Media         /management/settings/*

HEADING  Account
  LINK   Notifications        solar:bell-bold-duotone             /account/notifications
  GROUP  Settings             solar:user-circle-bold-duotone
         My Profile / Security / Notifications / Billing / Sessions / Cookies / Payment
  GROUP  Profile              solar:user-id-bold-duotone
         Overview / Talent                                        /user-profile/*

HEADING  UI Gallery
  GROUP  Widgets              solar:pie-chart-2-bold-duotone      /widgets/*
  GROUP  Cards                solar:card-bold-duotone             /cards/*
  GROUP  Prebuilt             solar:widget-4-bold-duotone         /prebuilt/*
  GROUP  Data Tables          solar:tablet-bold-duotone           /datatables/*
  LINK   Themes               solar:pallete-2-bold-duotone        /themes
  GROUP  Pricing              solar:tag-price-bold-duotone        /pricing/*
  LINK   Integrations         solar:plug-circle-bold-duotone      /integrations
```

Sidebar footer: an "Upgrade" promo card (dismissible). Sidebar supports a
compact (icon-only) vs full (icon+label) mode, persisted to localStorage.

---

## 3. App shell

- **Layout**: `emr-layout` in `windowMode` with topbar / sidebar / header / body slots
  (`@elementar-rt/components/layout`). Body scrolls; shell stays fixed.
- **Topbar** (thin, above everything): global announcement banner (dismissible,
  from `AppStore`) and incidents banner (severity color, from `AppStore`).
- **Header**: sidebar toggle button, breadcrumbs (derived from route data `title`s),
  a spacer, then the action cluster (right): global search trigger, apps popover
  (grid of app shortcuts), notifications popover (list of mock notifications with
  unread dot + "mark all read"), chat drawer trigger (opens a compact messenger),
  color-scheme switcher (`emr-color-scheme-switcher`), and an avatar menu (DiceBear
  avatar → profile / settings / sign-out).
- **Sidebar**: nav tree from §2; brand logo at top; compact/full toggle; footer promo.
- **State**: root `AppStore` (`@ngrx/signals`) holds `announcement`, `incidents`,
  `notifications`, and shell UI prefs (sidebar compact, sidebar open on mobile).
- Below `lg` the sidebar becomes an overlay drawer; header actions collapse into
  an overflow menu.

---

## 4. Shared infrastructure

### 4.1 Datatable kit (`shared/datatable`)
Wrapper over `@tanstack/angular-table`: column defs, sorting, pagination, global
filter, row selection (checkbox), sticky header, responsive horizontal scroll,
empty + loading (skeleton) states. Cell renderers (`shared/datatable/cells`):
- **user** — avatar + name + secondary (email)
- **status** — colored badge/chip (maps status → color)
- **currency** — right-aligned money (Intl.NumberFormat)
- **date** — formatted date (date-fns) + relative tooltip
- **progress** — bar + percent
- **rating** — stars
- **tags** — chip list
- **actions** — kebab menu (view/edit/delete)

### 4.2 Chart / widget kit (`shared/charts`)
- `ChartHostDirective` — `echarts.init` on the host, `ResizeObserver` for resize,
  re-init/`setOption` on color-scheme change (reads `ColorSchemeStore`), dispose on
  destroy. Input: `option` (EChartsOption) + optional `height`.
- `WidgetCardComponent` — titled card (title, subtitle, header actions slot, body)
  using elementar `card`/`panel` styling.
- `chart-palette.ts` — categorical + sequential palettes derived from Material system
  tokens; readable in light and dark. Single source for all chart colors.

### 4.3 Mock helpers (`shared/mock`)
`randomId()` (uuid), `pick`/`sample`, `daysAgo`, `mockDelay<T>()` rx operator.
`shared/models` holds cross-feature models (User, etc.).

---

## 5. Widget catalog

Each widget is a standalone component with typed inputs and its own mock defaults,
registered in `widgets/registry.ts` (`{id,name,description,component,defaultCols,defaultRows}`)
so both the galleries and the dynamic dashboard can render them.

| Widget | Chart / form | Data shape |
|---|---|---|
| Traffic overview | area line, multi-series | `{date, visitors, pageviews}[]` |
| Sales gauge | gauge (0–100%) | `{value, target}` |
| Income vs expense | grouped bars | `{month, income, expense}[]` |
| Purchases by channel | line, 3 series | `{date, direct, referral, social}[]` |
| Revenue by category | donut | `{name, value}[]` |
| Transactions list | list rows | `{name, type, amount, date, status}[]` |
| Productive time | horizontal bars / heat | `{day, hours}[]` |
| Card balance | stat + sparkline | `{balance, delta, series[]}` |
| Stat tiles (KPI) | number + delta + micro-chart | `{label, value, delta, series[]}` |
| Crypto ticker | sparkline rows | `{symbol, price, change24h, series[]}` |
| Top products | table mini | `{product, sold, revenue}[]` |
| Visitors by country | list + flags | `{country, code, visitors, pct}[]` |

Galleries group these: **general** (traffic, KPI tiles, transactions, productive-time,
top-products), **crypto** (crypto tickers, balance), **finance** (income/expense,
card-balance, revenue donut), **analytics** (traffic, visitors-by-country, purchases).

---

## 6. Per-area behaviour (concise)

**Dashboards** — composed from §5 widgets in responsive grids. `getting-started`
is an onboarding checklist + quick-links. `dynamic` uses `@katoid/angular-grid-layout`:
draggable/resizable tiles, add/remove via a drawer widget picker (from the registry),
render tiles with `NgComponentOutlet`, layout persisted to localStorage.

**Calendar** — FullCalendar (dayGrid + timeGrid + interaction). Month/week/day views,
click a slot to create, click an event to edit (dialog). Mock `ScheduleService`.

**Messenger** — conversation list + thread pane; bubbles, day separators (date-fns),
typing indicator; emoji picker + text input. Responsive: list collapses to a drawer.

**Email** — folder rail (inbox/sent/drafts/spam/trash + labels) + message list
(datatable: sender, subject, snippet, date, star/attachment flags) + reading pane;
compose dialog. Service filters mock messages by folder/label param.

**File Manager** — breadcrumb path, grid/list toggle (segmented), file-type icons,
selection, upload dropzone; list mode uses the datatable kit.

**Kanban** — columns with draggable cards (elementar `kanban-board` or CDK drag-drop),
add card/column, card detail popover.

**Notes** — masonry of colored note cards, inline create/edit, tag filter, delete.

**Contacts** — searchable list + detail side panel (avatar, fields, actions).

**AI Studio** — in-browser chat via `@mlc-ai/web-llm`. Model picker, streaming tokens
rendered as sanitized markdown (`marked`), load-progress UI, graceful fallback when
`navigator.gpu` is unavailable. web-llm confined to this route's lazy chunk.

**Content Editor** — original block-based builder: block list (paragraph, heading,
image, quote, divider, embed), add-block menu, CDK drag reorder, per-block settings
popover, JSON document model in a SignalStore, preview toggle.

**Invoice** — list (datatable: number, client, amount, status, due date, actions);
details (printable layout); new/edit (client fields + editable line-items form-array
with live totals + tax).

**Projects** — project cards (name, progress, members via DiceBear, due date, status),
filter chips, board/grid toggle.

**Courses** — list (course cards), details (curriculum accordion, progress, lessons),
builder (sections→lessons tree, CDK drag reorder, lesson editor reusing the posts editor).

**Help Center** — home (search hero + category cards), faq (accordion), guides
(article cards), support (ticket datatable + new-ticket dialog).

**Posts (management)** — list (datatable: title, author, status, category, date),
new/edit with a rich editor (`@milkdown/crepe`), details (rendered article),
categories & topics simple CRUD lists.

**Site Settings (management)** — general/writing/reading/discussion/media: grouped
settings forms (cards of fields), fake save with a snackbar.

**Account** — notifications feed; settings sub-area with a secondary nav:
my-profile (avatar upload + form), security (password change + 2FA + connected apps),
notifications & notifications-2 (preference matrices), billing & billing-2 (current
plan + invoice history datatable), sessions (device table + revoke via confirm),
cookie (consent categories), payment (methods table + add-card dialog).

**User Profile** — overview (header cover + avatar, about, stats, activity timeline)
and talent (skills, experience timeline, portfolio).

**UI Gallery** — datatables (general + users reference), cards (general + users),
prebuilt (skeleton, notifications, selects: country/currency/timezone/date-format,
dialogs/confirm), themes (theme + scheme preview with live swatches), pricing
(basic tiers + membership with radio-card selection), integrations (toggle cards),
service-pages (email-activation, integrations status), content/posts (public post list).

---

## 7. Mock-data catalog (key models)

```ts
User        { id, name, email, avatarSeed, role, status: 'active'|'invited'|'suspended', lastActive }
Notification{ id, title, body, icon, time, read, kind }
Invoice     { id, number, client: {name,email,avatarSeed}, amount, currency, status, issued, due, items[] }
InvoiceItem { id, description, qty, unitPrice }
EmailMsg    { id, folder, labels[], from: {name,email,avatarSeed}, subject, snippet, body, date, read, starred, hasAttachment }
Project     { id, name, description, progress, status, due, members: seed[], tags[] }
Course      { id, title, cover, category, level, lessons, durationMins, progress, sections[] }
Contact     { id, name, email, phone, company, avatarSeed, tags[] }
Note        { id, title, body, color, tags[], updated }
Post        { id, title, excerpt, author: {name,avatarSeed}, status, category, tags[], cover, updated, contentJson }
Ticket      { id, subject, requester, priority, status, updated }
Plan        { id, name, priceMonthly, priceYearly, features[], highlighted }
Session     { id, device, browser, ip, location, lastActive, current }
PaymentCard { id, brand, last4, exp, primary }
CryptoTicker{ symbol, name, price, change24h, series[] }
```

Counts: users ~30, notifications ~12, invoices ~20, emails ~40, projects ~10,
courses ~8, contacts ~25, notes ~12, posts ~15, tickets ~15, plans 3–4.

---

## 8. Verification per phase
`ng build` clean → `ng serve` → load the phase's routes in a browser (agent-browser)
→ zero console errors → dark + light both correct → commit `phase(N): …`.
