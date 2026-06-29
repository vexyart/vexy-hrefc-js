# PLAN — vexy-hrefc-js

Hover a link, see what's behind it. No click, no new tab, no leaving the page.

That's the whole product. This plan turns the v0.1 prototype — a clever but tangled `<script>` buried in a Webflow page — into a small, dependency-free library you can drop into any site, publish to NPM, and restyle to taste. The hard parts are the parts the prototype got wrong: CORS, silence, and customization.

---

## 1. What we're building

A client-side JavaScript library that shows a preview popup for links. Point at a link, and a small card fades in with the target page's title, a short description, and optionally a thumbnail. It reads Open Graph tags first, falls back through plainer HTML, and when the browser blocks the request — which it will, often — it routes through a reader proxy instead.

Three rules from the brief shape every decision:

1. **Silent.** No "Loading…" text. The popup does not appear until it has something to show. If a fetch fails, nothing happens. This is a reading-experience enhancement, not a feature anyone is owed.
2. **Self-contained.** One file, no peer dependencies. The prototype loaded Tippy.js and Popper from a CDN. We replace both with ~60 lines of positioning code so the whole thing is a single `<script>` tag.
3. **Yours to restyle.** Sensible defaults that inherit the host page's fonts and colors and follow the system dark/light setting — then get out of the way. Every class name, every color, the whole render function: overridable.

### Ships as

- **ESM** — `import { hrefc } from 'vexy-hrefc'`
- **Global** — `<script src="hrefc.global.min.js">` then `Hrefc.init()`, attaches `window.Hrefc`
- **CSS** — injected automatically; also shipped standalone for those who'd rather link it

Published to NPM as `vexy-hrefc`, served over jsDelivr/unpkg, documented on GitHub Pages.

---

## 2. What the prototype taught us

The v0.1 code (in `private/vexy-hrefc-js-v0.1.html`, the "Fetch Help local code" block) already solved the easy 70%:

- `og:title` → `<title>` fallback, with the site-suffix trimmed at the first `|`.
- `og:description` → a generic default.
- A `Map` cache plus a `pending` map so two hovers on the same link fire one request.
- HTML escaping before injection.
- A hardcoded `fallbackMocks` table for known URLs when the fetch dies.

What it got wrong, and we fix:

| Prototype | Production |
|---|---|
| Native `fetch` only — dies on cross-origin CORS | Proxy fallback chain (r.jina.ai and friends) |
| "Loading preview…" shown immediately | Nothing shows until content is ready |
| Tippy.js + Popper (~25KB, two CDN loads) | Zero-dependency popup + positioner |
| Description only | Title, description, thumbnail, favicon — each toggleable |
| Hardcoded mock fallbacks | Real fallback chain; silent if all fail |
| Inline in a Webflow page | Built library, NPM package, restyleable |

---

## 3. Architecture

Small modules, each doing one job, composed at the edges. Source in `src/`, bundled by esbuild.

```
src/
  index.js       Public API: hrefc(), Hrefc class, auto-init, exports
  config.js      Defaults + deep-merge + normalization
  fetcher.js     Fetch pipeline: native → proxy chain, timeout, cache, dedupe
  proxies.js     Proxy adapters (r.jina.ai default; pluggable)
  extract.js     HTML → { title, description, image, favicon } with fallback chains
  thumbnail.js   Thumbnail resolution: og:image → screenshot providers → iframe → none
  popup.js       DOM creation, positioning (mini-popper), show/hide, hover intent
  styles.js      Default CSS string, custom properties, dark/light, font inheritance
  util.js        escapeHTML, absoluteUrl, debounce, once
```

### Data flow

```
hover a matched link
  → wait hoverDelay (intent guard)
  → cache hit? show it.  miss? →
  → fetcher: same-origin? try native fetch.
             cross-origin or native failed? walk proxy chain.
  → extract: parse HTML, pull title/description/image/favicon (fallback chains)
  → thumbnail (if enabled): og:image → mshots → microlink → iframe → drop it
  → render: default card or user render(); cache result
  → popup: position near link, fade in. (only now does anything appear)
```

Every step is wrapped so a failure returns "nothing" rather than throwing. The pipeline is a Kahn-style chain of pure-ish transforms: input HTML in, structured data out, DOM at the end.

### Fetch and CORS — the load-bearing part

The browser blocks reading cross-origin responses. So:

- **Same-origin links** use native `fetch` (fast, free).
- **Cross-origin links** skip native (it can't work) and go straight to the proxy chain, unless configured otherwise.
- **Proxy chain** is an ordered list of adapters. Default: `r.jina.ai` —
  `GET https://r.jina.ai/<url>` with `X-Engine: direct`, `X-Return-Format: html`.
  Each adapter is `(url, signal) => Promise<string>` returning HTML. Add your own; reorder freely.
- Every request gets an `AbortController` timeout. First adapter to return usable HTML wins. All fail → silent.

### Extraction fallback chains

- **Title:** `og:title` → `twitter:title` → `<title>`. Optional suffix-trim at `|`/`–`/`—` (off by default; the prototype's `|` trim is a preset).
- **Description:** `og:description` → `twitter:description` → `meta[name=description]` → first N chars of body text (N = 350, configurable). On by default.
- **Image:** `og:image` → `twitter:image`. Feeds the thumbnail chain. Off by default.
- **Favicon:** `link[rel~=icon]` (best size) → `/favicon.ico` → Google favicon service. Opt-in, shown before the title.

All relative URLs resolved against the response's final URL.

### Thumbnails (off by default)

When enabled and no `og:image`/`twitter:image` exists, walk a provider chain, keyless options first:

1. **og:image / twitter:image** — already free, use it.
2. **WordPress mShots** — `https://s0.wp.com/mshots/v1/<url>?w=<width>`. Keyless, cached, real screenshot.
3. **Microlink** — `https://api.microlink.io/?url=<url>&screenshot=true&embed=screenshot.url`. Keyless free tier.
4. **Click-protected iframe** — render the target at desktop width (1280×800), scaled down to popup size, with a transparent overlay so clicks hit the card not the page. On by default when thumbnails are on; separately opt-out-able.
5. **Paid APIs** (ScreenshotOne, ApiFlash, etc.) — opt-in adapters, bring your own key.
6. Otherwise: no thumbnail. Silently.

### Customization surface

Three levels, increasing power:

1. **Config object** — toggles, class names, selectors, delays, providers. Covers most needs.
2. **CSS** — custom properties (`--hrefc-*`) for quick reskins; full class targeting for total control. Defaults inherit `font-family` and `color`, and flip on `prefers-color-scheme: dark`.
3. **`render(data, link)`** — return your own element or HTML string. Total ownership of the card.

---

## 4. Build & tooling

- **Bundler:** esbuild. Fast, tiny, no config sprawl. Outputs ESM, IIFE global, and minified global; bundles the CSS into JS and emits a standalone `.css`.
- **Tests:** Node's built-in runner (`node --test`) with `linkedom` for a DOM in extraction tests. Pure logic — extraction fallbacks, config merge, cache dedupe, proxy URL shaping — gets real coverage without a browser.
- **No runtime dependencies.** Dev only: `esbuild`, `linkedom`.

### Outputs (`dist/`)

| File | Format | For |
|---|---|---|
| `hrefc.esm.js` | ESM | bundlers, `import` |
| `hrefc.global.js` | IIFE | `<script>`, readable |
| `hrefc.global.min.js` | IIFE min | production `<script>`, CDN |
| `hrefc.css` | CSS | optional external stylesheet |
| `hrefc.d.ts` | types | copied from `src/`, ships with the package |

### Scripts

- `./build.sh` — `npm install` then `npm run build`. Clean `dist/`, bundle all targets, report sizes.
- `./publish.sh` — guard (clean tree, tests pass, version bumped), build, `npm publish`, tag, push.
- `package.json`: `main`/`module`/`exports`/`unpkg`/`jsdelivr`/`types` wired correctly. Hand-written `src/hrefc.d.ts`, copied to `dist/` by the build.

---

## 5. Documentation & demos (`docs/`)

GitHub Pages, Jekyll, `remote_theme: just-the-docs/just-the-docs`. Every concept appears twice: as copyable code and as a live, isolated preview.

The trick that ties them together: the **demos are the previews**. Standalone HTML files in `docs/demos/` load the built global script and show progressive examples — each with its source visible and copyable, and the live widget running right there. The Markdown pages embed those same demos via `<iframe>` and repeat the code in fenced blocks. One source of truth, two front doors.

### Pages (Markdown)

1. **index** — what it is, the 30-second version, one working example.
2. **getting-started** — install (NPM + CDN), first preview, the one-liner.
3. **configuration** — every option, with defaults and examples.
4. **styling** — CSS variables, dark mode, class targeting, full reskin.
5. **fetching & CORS** — why proxies, the default chain, adding your own.
6. **thumbnails** — the provider chain, iframe mode, paid adapters.
7. **api-reference** — `hrefc()`, instance methods, `render()`, hooks.
8. **recipes** — Webflow, docs tooltips, footnote previews, custom cards.

### Demos (HTML, progressive: simplest → most elaborate)

1. `01-basic.html` — one link, one line of setup.
2. `02-description-favicon.html` — toggles and favicon.
3. `03-thumbnails.html` — og:image, mShots, iframe fallback.
4. `04-styling.html` — CSS-variable reskin + dark mode.
5. `05-custom-render.html` — bring-your-own card.
6. `06-proxies.html` — custom fetch chain.

Each demo: a short intro, a copyable code block (with a copy button), and the running widget beside it. Writing follows the brief's rules — lead strong, plain language, helpful errors, no fluff.

### Webflow handoff (`private/WEBFLOW.md`)

Exact steps to swap the v0.1 prototype on the `/lines` page for the new build: which embeds to delete, the one script tag to add, the init snippet, and the class names to put on links. Editable via Webflow MCP (page id `6a3a85f11a8adeae9338a9f9`).

---

## 6. Phases

**P1 — Foundation.** Repo scaffold, `package.json`, esbuild config, `build.sh`, directory structure. → builds an empty bundle.

**P2 — Core library.** `config`, `util`, `extract`, `fetcher`, `proxies`, `popup`, `styles`, `index`. Title + description, native + r.jina.ai fetch, hover popup, default styles. → the prototype's job, done right.

**P3 — Thumbnails & favicon.** `thumbnail.js` provider chain, iframe mode, favicon. → full content set.

**P4 — Tests & verify.** Unit tests for extraction, config, cache, proxy shaping. Build passes, sizes reported. → green.

**P5 — Docs & demos.** Jekyll scaffold, 8 Markdown pages, 6 HTML demos, copy buttons, embedded previews.

**P6 — Ship.** `publish.sh`, `src/hrefc.d.ts`, README, `WEBFLOW.md`, CHANGELOG. → NPM-ready. *(Shipped: 1.0.0–1.0.3, incl. fade-in, above-the-link placement, speech-balloon arrow, configurable CTA.)*

**P7 — Prefetch.** Warm the cache for matched links on init, idle-scheduled and concurrency-capped. Default on; `prefetch: false` for lazy. → popups appear instantly. *(issues/101 #1; designed in §9.1.)*

**P8 — Per-link config.** Modifier classes + `data-` attributes for per-link overrides (thumbnail, favicon, CTA…), plus an "all links" mode. Decouple raw fetch (cached by URL) from per-link render. → one init, many behaviors. *(issues/101 #2; designed in §9.2.)*

---

## 7. Success criteria

- One `<script>` tag and one line of init shows a working preview. No other dependencies.
- Cross-origin links preview via proxy without console errors visible to end users.
- Failures are invisible: no stuck popups, no error text, no thrown exceptions in the page.
- Restyling needs no library edits — CSS variables for quick changes, `render()` for total control.
- `docs/` builds on GitHub Pages; every page shows copyable code and a live preview.
- Minified global bundle stays small (target < 12KB min, < 5KB gzipped).

---

## 8. Risks & calls

- **Proxy reliability.** r.jina.ai can rate-limit or change. Mitigation: chain is pluggable and ordered; document adding Microlink/others; cache aggressively.
- **iframe thumbnails are heavy.** Mitigation: off unless thumbnails requested, lazy (only on show), separately disableable.
- **Scope creep toward a "preview platform."** Mitigation: it's a hover card. No analytics, no SSR, no backend. Client-side only, as the brief says.
- **`npx` is shimmed to `pnpm dlx` on the dev machine.** Mitigation: build runs through `npm run` scripts using local `node_modules/.bin`, never bare `npx`.

---

## 9. Roadmap — faster & per-link previews (from `issues/101.md`)

Two requests, both real features. Designed here; not yet built.

### 9.1 Prefetch by default — instant popups

Today the fetch happens on hover, so the first preview of each link waits on the network. Warm the cache before the user hovers.

- **Default: eager.** After `refresh()` attaches links, enqueue a metadata prefetch for every matched link. On hover the data is already cached, so the popup is instant.
- **Scheduling.** Run prefetch from `requestIdleCallback` (fallback `setTimeout`) so it never blocks first paint or the page's own scripts — "once the library is initialized and all other code is executed".
- **Politeness.** `/lines` has ~34 help links. Firing 34 `r.jina.ai` requests at once invites rate-limiting. Cap concurrency (default ~4) with a small queue; reuse the existing in-flight de-dupe and cache.
- **Opt-out.** `prefetch: false` restores hover-time fetching. A `prefetch: 'visible'` mode (IntersectionObserver) is a possible middle ground for very long pages.
- **Config:** `prefetch: true | false` (default `true`), `prefetchConcurrency: 4`.
- **Interaction with 9.2:** prefetch warms *metadata only* (title/description/og:image extraction). Thumbnails and iframes still resolve on show, so a thumbnail link doesn't trigger a screenshot request during prefetch.

### 9.2 Per-link configuration — classes and data-attributes

One init, several behaviors, chosen per link.

- **Modes.** Base trigger class (default `hrefc`): `<a class="hrefc">` → title + description. All links: `selector: 'a[href]'` (documented preset) previews everything.
- **Per-link overrides, two ways:**
  - **Modifier classes** — a `modifiers` map of class → partial config. `<a class="hrefc thumb">` enables the thumbnail; `<a class="hrefc favicon">` adds the favicon. Ships sensible defaults (`thumb`, `favicon`), fully user-definable.
  - **`data-` attributes** — `data-hrefc-thumbnail`, `data-hrefc-favicon`, `data-hrefc-cta="Read the docs →"`, `data-hrefc-placement="bottom"`. Presence = true, `="false"` = off; string attrs carry values. More powerful than classes (set, not just toggle).
- **Resolution.** Per link, merge: base config → matched modifier overrides → data-attribute overrides → the config used for that link's render. Proposed precedence: data-attribute wins over class, most specific last.
- **Caching refactor (the load-bearing part).** The cache is keyed by URL. If per-link config changed *what gets fetched/extracted*, two links to one URL would collide. Fix: the fetch+extract step always pulls the full superset (raw title, full body text, `og:image`, favicon) and caches that by URL; per-link config only controls **rendering** — which fields show, `descriptionMaxLength`, `stripTitleSuffix`, thumbnail provider use. One cache entry per URL; links vary freely.
- **Config:** `modifiers: { thumb: { content: { thumbnail: true } }, favicon: { content: { favicon: true } } }`; `dataAttributes: true` (read `data-hrefc-*`).

### 9.3 Sequencing

P7 (prefetch) is small and self-contained — do it first. P8 (per-link) needs the fetch/render split from 9.2's caching refactor before the modifier/data-attribute layer goes on top.
